#!/usr/bin/env python3
"""
基础命令行界面类
"""

import logging
from abc import ABC, abstractmethod
from app.services.database import DatabaseManager
from app.services.person_service import PersonService
from app.services.relationship_service import RelationshipService
from config import Config


# 将日志级别设置为WARNING（仅显示警告及以上级别的日志）
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)


class BaseCLI(ABC):
    """基础CLI类"""

    def __init__(self):
        self.db_manager = DatabaseManager(Config.SQLALCHEMY_DATABASE_URL)
        self.session = self.db_manager.get_session()
        self.person_service = PersonService(self.session)
        self.relationship_service = RelationshipService(self.session)

    def get_choice(self, prompt, valid_choices):
        """获取用户选择"""
        while True:
            choice = input(prompt).strip()
            if choice in valid_choices:
                return choice
            print("❌ 无效选择，请重新输入")

    def search_person_by_choice(self, prompt=""):
        """通过选择方式查找人员"""
        if prompt:
            print(prompt)

        while True:
            print("请选择查找方式:")
            print("1. 按姓名搜索")
            print("2. 按ID查找")
            print("3. 查看所有人员")
            print("0. 取消")

            choice = self.get_choice("请选择(0-3): ", ['0', '1', '2', '3'])

            if choice == '0':
                return None
            elif choice == '1':
                return self._search_by_name()
            elif choice == '2':
                return self._search_by_id()
            elif choice == '3':
                return self._view_all_persons()
            else:
                print("❌ 无效选择，请重新输入")

    def _search_by_name(self):
        """按姓名搜索"""
        keyword = input("请输入姓名关键词: ").strip()
        if not keyword:
            print("❌ 搜索关键词不能为空")
            return None

        persons = self.person_service.search_persons(keyword)
        if not persons:
            print("🔍 未找到相关人员")
            return None

        if len(persons) == 1:
            person = persons[0]
            print(f"✅ 找到: {person.name} (ID: {person.id})")
            return person
        else:
            print(f"\n🔍 找到 {len(persons)} 个相关人员:")
            self._display_persons_table(persons)
            return self._select_person_from_list()

    def _search_by_id(self):
        """按ID查找"""
        person_id = input("请输入人员ID: ").strip()
        if not person_id.isdigit():
            print("❌ 请输入有效的数字ID")
            return None

        person = self.person_service.get_person(int(person_id))
        if person:
            print(f"✅ 找到: {person.name} (ID: {person.id})")
            return person
        else:
            print("❌ 未找到该ID对应的人员")
            persons = self.person_service.get_all_persons()
            if persons:
                print("现有人员列表:")
                self._display_persons_table(persons)
            return None

    def _view_all_persons(self):
        """查看所有人员"""
        persons = self.person_service.get_all_persons()
        if not persons:
            print("❌ 系统中暂无人员数据")
            return None

        print(f"📋 所有人员列表 (共{len(persons)}人):")
        self._display_persons_table(persons)
        return self._select_person_from_list()

    def _select_person_from_list(self):
        """从列表中选择人员"""
        while True:
            person_id = input("请输入人员ID选择: ").strip()
            if person_id.isdigit():
                selected_person = self.person_service.get_person(int(person_id))
                if selected_person:
                    return selected_person
                else:
                    print("❌ 未找到该ID对应的人员")
            else:
                print("❌ 请输入有效的数字ID")

            retry = input("是否重新选择？(y/N): ").strip().lower()
            if retry != 'y':
                return None

    def _display_persons_table(self, persons):
        """显示人员表格"""
        print("-" * 80)
        print(f"{'ID':<4} {'姓名':<10} {'性别':<4} {'出生日期':<12} {'出生地':<15} {'电话':<12}")
        print("-" * 80)

        for person in persons:
            gender_display = "男" if person.gender == 'M' else "女"
            print(f"{person.id:<4} {person.name:<10} {gender_display:<4} "
                  f"{person.birth_date.strftime('%Y-%m-%d'):<12} "
                  f"{person.birth_place or '':<15} {person.phone or '':<12}")

    def format_relationship_display(self, relationship_type, sub_type):
        """格式化关系显示 - 修复版本"""
        # 明确关系类型的显示文本，确保"parent"显示为"父母"，"child"显示为"子女"
        type_map = {
            'parent': '父母',
            'child': '子女',
            'spouse': '配偶',
            'sibling': '兄弟姐妹'
        }
        sub_type_map = {
            'father': '父亲',
            'mother': '母亲',
            'son': '儿子',
            'daughter': '女儿',
            'husband': '丈夫',
            'wife': '妻子',
            'brother': '兄弟',
            'sister': '姐妹'
        }

        base_type = type_map.get(relationship_type, relationship_type)
        detail_type = sub_type_map.get(sub_type, '')

        if detail_type:
            return f"{detail_type}"  # 直接显示具体关系类型（如"父亲"而非"父母(父亲)"）
        else:
            return base_type

    def format_date_accuracy(self, accuracy):
        """格式化日期精确度显示"""
        accuracy_map = {
            'exact': '精确到日',
            'year_month': '精确到年月',
            'year_only': '仅年份'
        }
        return accuracy_map.get(accuracy, accuracy)

    def get_order_title(self, people_list, order_type="sibling"):
        """
        通用排行称谓生成方法
        :param people_list: 人员列表
        :param order_type: 类型（sibling/child），主要用于日志区分
        :return: 排行称谓映射
        """
        # 按出生日期从大到小排序（年龄从大到小）
        sorted_people = sorted(
            people_list,
            key=lambda x: (x.birth_date.year, x.birth_date.month, x.birth_date.day)
        )

        # 排行称谓映射（1-10）
        order_map = {
            1: "老大", 2: "老二", 3: "老三", 4: "老四", 5: "老五",
            6: "老六", 7: "老七", 8: "老八", 9: "老九", 10: "老十"
        }
        title_map = {}
        for idx, person in enumerate(sorted_people, 1):
            order = order_map.get(idx, f"{idx}")  # 11及以上用数字
            gender = "男" if person.gender == "M" else "女"
            title_map[person.id] = f"{order} {gender}"

        # logger.info(f"生成{order_type}排行称谓，共{len(title_map)}人")
        return title_map

    def get_sibling_order_title(self, current_person, siblings):
        """计算兄弟姐妹的排行称谓"""
        # 合并当前人员和兄弟姐妹，统一计算排行
        all_siblings = siblings.copy()
        all_siblings.append(current_person)
        return self.get_order_title(all_siblings, "sibling")

    def get_child_order_title(self, children):
        """计算子女的排行称谓"""
        return self.get_order_title(children, "child")

    @abstractmethod
    def run(self):
        """运行命令行界面"""
        pass

    def __del__(self):
        """析构函数，关闭数据库连接"""
        if hasattr(self, 'session'):
            self.session.close()