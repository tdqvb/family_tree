#!/usr/bin/env python3
"""
家族谱系系统主命令行界面
"""

from .base_cli import BaseCLI
from .person_cli import PersonCLI
from .relationship_cli import RelationshipCLI
from .query_cli import QueryCLI


class FamilyTreeCLI(BaseCLI):
    """家族谱系系统主CLI"""

    def display_menu(self):
        """显示主菜单"""
        print("\n" + "=" * 50)
        print("          家族谱系管理系统")
        print("=" * 50)
        print("1. 人员管理")
        print("2. 关系管理")
        print("3. 查询统计")
        print("0. 退出系统")
        print("=" * 50)

    def run(self):
        """运行命令行界面"""
        print("🚀 启动家族谱系管理系统...")

        while True:
            self.display_menu()
            choice = self.get_choice("\n请选择操作 (0-3): ", ['0', '1', '2', '3'])

            if choice == '0':
                print("👋 感谢使用，再见！")
                break
            elif choice == '1':
                person_cli = PersonCLI()
                person_cli.run()
            elif choice == '2':
                relationship_cli = RelationshipCLI()
                relationship_cli.run()
            elif choice == '3':
                query_cli = QueryCLI()
                query_cli.run()