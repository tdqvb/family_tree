#!/usr/bin/env python3
"""
家族谱系系统命令行界面包
"""

from .base_cli import BaseCLI
from .person_cli import PersonCLI
from .relationship_cli import RelationshipCLI
from .query_cli import QueryCLI
from .family_tree_cli import FamilyTreeCLI

__all__ = [
    'BaseCLI',
    'PersonCLI',
    'RelationshipCLI',
    'QueryCLI',
    'FamilyTreeCLI'
]

__version__ = '1.0.0'