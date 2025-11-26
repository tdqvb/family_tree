#!/usr/bin/env python3
"""
人员管理命令行界面
"""

from datetime import datetime
from .base_cli import BaseCLI


class PersonCLI(BaseCLI):
    """人员管理CLI"""

    def display_menu(self):
        """显示人员管理菜单"""
        print("\n" + "-" * 30)
        print("          人员管理")
        print("-" * 30)
        print("1. 添加人员")
        print("2. 查看所有人员")
        print("3. 搜索人员")
        print("4. 修改人员信息")
        print("5. 删除人员")
        print("6. 查看人员详情")
        print("0. 返回主菜单")

    def display_gender_menu(self):
        """显示性别选择菜单"""
        print("选择性别:")
        print("1. 男性")
        print("2. 女性")

    def display_date_accuracy_menu(self):
        """显示日期精确度菜单"""
        print("选择日期精确度:")
        print("1. 精确到日")
        print("2. 精确到年月")
        print("3. 仅年份")

    def input_person_data(self):
        """输入人员数据"""
        print("\n请输入人员信息：")
        name = input("姓名: ").strip()
        if not name:
            print("❌ 姓名不能为空")
            return None

        # 性别选择
        self.display_gender_menu()
        gender_choice = self.get_choice("请选择性别(1-2): ", ['1', '2'])
        gender = 'M' if gender_choice == '1' else 'F'

        # 出生日期
        print("出生日期:")
        birth_year = input("  年份(4位): ").strip()
        birth_month = input("  月份(1-12): ").strip()
        birth_day = input("  日期(1-31): ").strip()

        if not all([birth_year, birth_month, birth_day]):
            print("❌ 日期信息不完整")
            return None

        try:
            birth_date = datetime.strptime(f"{birth_year}-{birth_month}-{birth_day}", "%Y-%m-%d").date()
        except ValueError:
            print("❌ 日期格式错误")
            return None

        # 日期类型选择
        date_type_choice = self.get_choice("日期类型(1-公历/2-农历): ", ['1', '2'])
        birth_date_type = 'solar' if date_type_choice == '1' else 'lunar'

        # 日期精确度选择
        self.display_date_accuracy_menu()
        accuracy_choice = self.get_choice("请选择日期精确度(1-3)[默认1]: ", ['1', '2', '3', ''])
        accuracy_map = {'1': 'exact', '2': 'year_month', '3': 'year_only', '': 'exact'}
        birth_date_accuracy = accuracy_map[accuracy_choice]

        # 可选信息
        phone = input("电话(可选): ").strip() or None
        email = input("邮箱(可选): ").strip() or None
        birth_place = input("出生地(可选): ").strip() or None

        return {
            'name': name,
            'gender': gender,
            'birth_date': birth_date,
            'birth_date_type': birth_date_type,  # 修正字段名
            'birth_date_accuracy': birth_date_accuracy,  # 修正字段名
            'phone': phone,
            'email': email,
            'birth_place': birth_place
        }

    def add_person(self):
        """添加人员"""
        try:
            person_data = self.input_person_data()
            if person_data:
                person = self.person_service.create_person(person_data)
                print(f"✅ 添加成功！人员ID: {person.id}")
        except Exception as e:
            print(f"❌ 添加失败: {e}")

    def list_all_persons(self):
        """查看所有人员"""
        persons = self.person_service.get_all_persons()
        if not persons:
            print("📭 暂无人员数据")
            return

        print(f"\n📋 人员列表 (共{len(persons)}人):")
        self._display_persons_table(persons)

    def search_persons(self):
        """搜索人员"""
        keyword = input("请输入搜索关键词: ").strip()
        if not keyword:
            print("❌ 搜索关键词不能为空")
            return

        persons = self.person_service.search_persons(keyword)
        if not persons:
            print("🔍 未找到相关人员")
            return

        print(f"🔍 搜索结果 (共{len(persons)}人):")
        self._display_persons_table(persons)

    def update_person(self):
        """修改人员信息"""
        print("\n📝 修改人员信息")
        person = self.search_person_by_choice("请选择要修改的人员")
        if not person:
            return

        print(f"当前信息: {person.name} (ID: {person.id})")
        print("请输入新的信息（直接回车保持原值）:")

        update_data = {}
        name = input(f"姓名 [{person.name}]: ").strip()
        if name:
            update_data['name'] = name

        current_gender = '1' if person.gender == 'M' else '2'
        gender_choice = input(f"性别(1-男/2-女) [{current_gender}]: ").strip()
        if gender_choice in ['1', '2']:
            update_data['gender'] = 'M' if gender_choice == '1' else 'F'

        phone = input(f"电话 [{person.phone or ''}]: ").strip()
        if phone:
            update_data['phone'] = phone

        email = input(f"邮箱 [{person.email or ''}]: ").strip()
        if email:
            update_data['email'] = email

        birth_place = input(f"出生地 [{person.birth_place or ''}]: ").strip()
        if birth_place:
            update_data['birth_place'] = birth_place

        if update_data:
            updated_person = self.person_service.update_person(person.id, update_data)
            if updated_person:
                print("✅ 修改成功！")
            else:
                print("❌ 修改失败")
        else:
            print("ℹ️  未进行任何修改")

    def delete_person(self):
        """删除人员"""
        print("\n🗑️  删除人员")
        person = self.search_person_by_choice("请选择要删除的人员")
        if not person:
            return

        confirm = input(f"确定要删除 {person.name} (ID: {person.id}) 吗？(1-确认/0-取消): ").strip()
        if confirm == '1':
            if self.person_service.delete_person(person.id):
                print("✅ 删除成功！")
            else:
                print("❌ 删除失败")
        else:
            print("ℹ️  取消删除")

    def view_person_detail(self):
        """查看人员详情"""
        print("\n📄 查看人员详情")
        person = self.search_person_by_choice("请选择要查看的人员")
        if not person:
            return

        print(f"📄 人员详情:")
        print(f"  ID: {person.id}")
        print(f"  姓名: {person.name}")
        print(f"  性别: {'男' if person.gender == 'M' else '女'}")
        print(f"  出生日期: {person.birth_date} ({person.birth_date_type})")  # 修正字段名
        print(f"  日期精确度: {self.format_date_accuracy(person.birth_date_accuracy)}")  # 修正字段名
        print(f"  电话: {person.phone or '无'}")
        print(f"  邮箱: {person.email or '无'}")
        print(f"  出生地: {person.birth_place or '无'}")
        print(f"  是否在世: {'是' if person.is_living else '否'}")
        if not person.is_living and person.death_date:
            print(f"  逝世日期: {person.death_date} ({person.death_date_type})")
        if person.biography:
            print(f"  生平简介: {person.biography}")

    def run(self):
        """运行人员管理界面"""
        while True:
            self.display_menu()
            choice = self.get_choice("\n请选择操作 (0-6): ", ['0', '1', '2', '3', '4', '5', '6'])

            if choice == '0':
                break
            elif choice == '1':
                self.add_person()
            elif choice == '2':
                self.list_all_persons()
            elif choice == '3':
                self.search_persons()
            elif choice == '4':
                self.update_person()
            elif choice == '5':
                self.delete_person()
            elif choice == '6':
                self.view_person_detail()