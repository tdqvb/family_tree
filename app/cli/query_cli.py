#!/usr/bin/env python3
"""
查询统计命令行界面
"""

from .base_cli import BaseCLI


class QueryCLI(BaseCLI):
    """查询统计CLI"""

    def display_menu(self):
        """显示查询统计菜单"""
        print("\n" + "-" * 30)
        print("          查询统计")
        print("-" * 30)
        print("1. 统计信息")
        print("2. 按性别查询")
        print("3. 按出生日期查询")
        print("4. 查询在世人员")
        print("5. 查看家庭成员")
        print("0. 返回主菜单")

    def display_gender_menu(self):
        """显示性别选择菜单"""
        print("选择性别:")
        print("1. 男性")
        print("2. 女性")

    def show_statistics(self):
        """显示统计信息"""
        person_count = self.person_service.count_persons()
        relationship_count = self.relationship_service.count_relationships()
        male_count = len(self.person_service.get_persons_by_gender('M'))
        female_count = len(self.person_service.get_persons_by_gender('F'))
        living_count = len(self.person_service.get_living_persons())

        print("\n📊 系统统计信息:")
        print(f"  总人数: {person_count}")
        print(f"  男性: {male_count}人")
        print(f"  女性: {female_count}人")
        print(f"  在世: {living_count}人")
        print(f"  总关系数: {relationship_count}")

    def query_by_gender(self):
        """按性别查询"""
        self.display_gender_menu()
        gender_choice = self.get_choice("请选择性别(1-2): ", ['1', '2'])
        gender = 'M' if gender_choice == '1' else 'F'

        persons = self.person_service.get_persons_by_gender(gender)
        gender_display = "男" if gender == 'M' else "女"
        print(f"\n{gender_display}性成员 (共{len(persons)}人):")
        for person in persons:
            print(f"  ID: {person.id}, 姓名: {person.name}, 出生日期: {person.birth_date}")

    def query_living_persons(self):
        """查询在世人员"""
        persons = self.person_service.get_living_persons()
        print(f"\n在世人员 (共{len(persons)}人):")
        for person in persons:
            print(f"  ID: {person.id}, 姓名: {person.name}, 出生日期: {person.birth_date}")

    def view_person_relationships(self):
        """查看人员关系 - 修复版本"""
        print("\n🔗 查看人员关系")
        person = self.search_person_by_choice("请选择要查看关系的人员")
        if not person:
            return

        relationships = self.relationship_service.get_person_relationships(person.id)
        if not any(relationships.values()):
            print("📭 该人员暂无关系数据")
            return

        print(f"🔗 {person.name} 的关系网络:")

        if relationships['parents']:
            print(f"  👨‍👩‍👧‍👦 父母:")
            # 按出生日期从大到小排序（年龄大的父母在前）
            sorted_parents = sorted(
                relationships['parents'],
                key=lambda x: (x.birth_date.year, x.birth_date.month, x.birth_date.day)
            )
            for parent in sorted_parents:
                rel = self.relationship_service.get_relationships(
                    from_person_id=parent.id,
                    to_person_id=person.id,
                    relationship_type='parent'
                )
                if rel:
                    relationship_display = self.format_relationship_display(rel[0].relationship_type, rel[0].sub_type)
                    print(f"    ← {parent.name} ({relationship_display})")
                else:
                    print(f"    ← {parent.name}")

        if relationships['spouses']:
            print(f"  💑 配偶:")
            for spouse in relationships['spouses']:
                print(f"    ↔ {spouse.name}")

        if relationships['children']:
            print(f"  👶 子女:")
            # 按年龄排序
            sorted_children = sorted(
                relationships['children'],
                key=lambda x: (x.birth_date.year, x.birth_date.month, x.birth_date.day)
            )
            # 获取子女排行称谓
            child_title_map = self.get_child_order_title(sorted_children)

            for child in sorted_children:
                # 获取父母关系类型（父亲/母亲）
                rel = self.relationship_service.get_relationships(
                    from_person_id=person.id,
                    to_person_id=child.id,
                    relationship_type='parent'
                )
                if rel:
                    relationship_display = self.format_relationship_display(rel[0].relationship_type, rel[0].sub_type)
                    # 显示格式：（父亲 老大 男）
                    print(f"    → {child.name} ({relationship_display} {child_title_map[child.id]})")
                else:
                    print(f"    → {child.name} ({child_title_map[child.id]})")

        if relationships['siblings']:
            print(f"  👫 兄弟姐妹:")
            # 获取排行称谓
            title_map = self.get_sibling_order_title(person, relationships['siblings'])
            # 按年龄排序显示
            sorted_siblings = sorted(
                relationships['siblings'],
                key=lambda x: (x.birth_date.year, x.birth_date.month, x.birth_date.day)
            )
            for sibling in sorted_siblings:
                print(f"    — {sibling.name} ({title_map[sibling.id]})")

    def run(self):
        """运行查询统计界面"""
        while True:
            self.display_menu()
            choice = self.get_choice("\n请选择操作 (0-5): ", ['0', '1', '2', '3', '4', '5'])

            if choice == '0':
                break
            elif choice == '1':
                self.show_statistics()
            elif choice == '2':
                self.query_by_gender()
            elif choice == '3':
                print("ℹ️  按出生日期查询功能开发中...")
            elif choice == '4':
                self.query_living_persons()
            elif choice == '5':
                self.view_person_relationships()