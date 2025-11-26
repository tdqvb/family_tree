#!/usr/bin/env python3
"""
关系管理命令行界面 - 修复版本
"""

from .base_cli import BaseCLI


class RelationshipCLI(BaseCLI):
    """关系管理CLI - 修复版本"""

    def display_menu(self):
        """显示关系管理菜单"""
        print("\n" + "-" * 30)
        print("          关系管理")
        print("-" * 30)
        print("1. 添加关系")
        print("2. 查看所有关系")
        print("3. 查看人员关系")
        print("4. 删除关系")
        print("0. 返回主菜单")

    def display_relationship_type_menu(self):
        """显示关系类型菜单"""
        print("选择关系类型:")
        print("1. 父母关系 (A是B的父母)")
        print("2. 子女关系 (A是B的子女)")
        print("3. 配偶关系")
        print("4. 兄弟姐妹关系")

    def add_relationship(self):
        """添加关系 - 修复版本"""
        print("\n🎯 添加关系")

        # 选择关系发起方
        print("【选择关系发起方】")
        from_person = self.search_person_by_choice("")
        if not from_person:
            print("❌ 未选择关系发起方，取消操作")
            return

        print(f"✅ 已选择发起方: {from_person.name} (ID: {from_person.id})")

        # 选择关系类型
        print("\n【选择关系类型】")
        self.display_relationship_type_menu()
        type_choice = self.get_choice("请选择关系类型(1-4): ", ['1', '2', '3', '4'])

        type_map = {
            '1': 'parent',   # A是B的父母
            '2': 'child',    # A是B的子女
            '3': 'spouse',
            '4': 'sibling'
        }

        relationship_type = type_map[type_choice]

        # 选择关系接收方
        type_names = {
            '1': '子女（A是其父母）',
            '2': '父母（A是其子女）',
            '3': '配偶',
            '4': '兄弟姐妹'
        }

        print(f"\n【选择关系接收方】({type_names[type_choice]})")
        to_person = self.search_person_by_choice("")
        if not to_person:
            print("❌ 未选择关系接收方，取消操作")
            return

        print(f"✅ 已选择接收方: {to_person.name} (ID: {to_person.id})")

        # 验证关系
        if to_person.id == from_person.id:
            print("❌ 不能与自己建立关系")
            return

        if relationship_type == 'spouse' and from_person.gender == to_person.gender:
            print("❌ 配偶关系需要在异性之间建立")
            return

        # 显示关系确认
        relationship_display = self.format_relationship_display(relationship_type, '')

        # 计算相反关系显示
        opposite_map = {
            'parent': 'child',
            'child': 'parent',
            'spouse': 'spouse',
            'sibling': 'sibling'
        }
        opposite_type = opposite_map[relationship_type]
        opposite_display = self.format_relationship_display(opposite_type, '')

        print(f"\n📋 关系建立确认:")
        print(f"  主要关系: {from_person.name} → {to_person.name} ({relationship_display})")
        print(f"  自动创建: {to_person.name} → {from_person.name} ({opposite_display})")

        confirm = input("确认建立此关系？(1-确认/0-取消): ").strip()
        if confirm == '1':
            try:
                relationship_data = {
                    'from_person_id': from_person.id,
                    'to_person_id': to_person.id,
                    'relationship_type': relationship_type
                }

                relationship = self.relationship_service.create_relationship(relationship_data)
                print(f"✅ 关系添加成功！")
                print(f"   {from_person.name} → {to_person.name} ({relationship_display})")
                print(f"   {to_person.name} → {from_person.name} ({opposite_display})")

            except Exception as e:
                print(f"❌ 添加失败: {e}")
        else:
            print("ℹ️ 取消建立关系")

    def list_all_relationships(self):
        """查看所有关系"""
        relationships = self.relationship_service.get_all_relationships()
        if not relationships:
            print("📭 暂无关系数据")
            return

        print(f"\n🔗 关系列表 (共{len(relationships)}条):")
        print("-" * 80)

        for rel in relationships:
            from_person = self.person_service.get_person(rel.from_person_id)
            to_person = self.person_service.get_person(rel.to_person_id)
            if from_person and to_person:
                relationship_display = self.format_relationship_display(rel.relationship_type, rel.sub_type)
                print(f"ID: {rel.id}, {from_person.name} → {to_person.name}, 关系: {relationship_display}")

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

    def delete_relationship(self):
        """删除关系（同时删除双向关系）"""
        relationship_id = input("请输入要删除的关系ID: ").strip()
        if not relationship_id.isdigit():
            print("❌ 请输入有效的数字ID")
            return

        relationship = self.relationship_service.get_relationship(int(relationship_id))
        if not relationship:
            print("❌ 未找到该关系")
            return

        from_person = self.person_service.get_person(relationship.from_person_id)
        to_person = self.person_service.get_person(relationship.to_person_id)
        relationship_display = self.format_relationship_display(relationship.relationship_type, relationship.sub_type)

        confirm = input(
            f"确定要删除 {from_person.name} → {to_person.name} 的{relationship_display}关系吗？(同时删除反向关系)(1-确认/0-取消): ").strip()
        if confirm == '1':
            if self.relationship_service.delete_relationship_and_opposite(relationship.id):
                print("✅ 删除成功！相关的关系也已自动清理")
            else:
                print("❌ 删除失败")
        else:
            print("ℹ️ 取消删除")

    def run(self):
        """运行关系管理界面"""
        while True:
            self.display_menu()
            choice = self.get_choice("\n请选择操作 (0-4): ", ['0', '1', '2', '3', '4'])

            if choice == '0':
                break
            elif choice == '1':
                self.add_relationship()
            elif choice == '2':
                self.list_all_relationships()
            elif choice == '3':
                self.view_person_relationships()
            elif choice == '4':
                self.delete_relationship()