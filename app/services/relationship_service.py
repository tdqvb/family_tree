"""
关系相关业务逻辑服务 - 修复双向关系显示版本
"""

from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import date
import logging

from app.models.relationship import Relationship
from app.models.person import Person

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class RelationshipService:
    """关系服务类 - 修复双向关系显示版本"""

    # 关系类型映射（双向对应）
    RELATIONSHIP_TYPE_MAP = {
        'parent': 'child',
        'child': 'parent',
        'spouse': 'spouse'
    }

    # 子类型映射（存储用英文，显示用中文）
    SUB_TYPE_MAP = {
        'parent': {
            'M': 'father',
            'F': 'mother'
        },
        'child': {
            'M': 'son',
            'F': 'daughter'
        },
        'spouse': {
            'M': 'husband',
            'F': 'wife'
        }
    }

    # 子类型中文显示映射
    SUB_TYPE_DISPLAY_MAP = {
        'father': '父亲',
        'mother': '母亲',
        'son': '儿子',
        'daughter': '女儿',
        'husband': '丈夫',
        'wife': '妻子'
    }

    def __init__(self, db: Session):
        self.db = db

    def _get_person_or_raise(self, person_id: int) -> Person:
        """获取人员信息，如果不存在则抛出异常"""
        person = self.db.query(Person).filter(Person.id == person_id).first()
        if not person:
            raise ValueError(f"Person ID {person_id} does not exist")
        return person

    def _relationship_exists(self, from_person_id: int, to_person_id: int,
                             relationship_type: str = None) -> bool:
        """检查关系是否已存在"""
        try:
            query = self.db.query(Relationship).filter(
                and_(
                    Relationship.from_person_id == from_person_id,
                    Relationship.to_person_id == to_person_id
                )
            )

            if relationship_type:
                query = query.filter(Relationship.relationship_type == relationship_type)

            return query.first() is not None

        except Exception as e:
            logger.error(f"Check relationship existence failed: {e}")
            raise

    def _create_relationship_if_not_exists(self, from_person_id: int, to_person_id: int,
                                           relationship_type: str, sub_type: str = None) -> bool:
        """如果关系不存在则创建关系（不添加消息）"""
        if self._relationship_exists(from_person_id, to_person_id, relationship_type):
            logger.info(f"Relationship already exists: {from_person_id} → {to_person_id} ({relationship_type})")
            return False

        relationship_data = {
            'from_person_id': from_person_id,
            'to_person_id': to_person_id,
            'relationship_type': relationship_type,
            'sub_type': sub_type
        }

        relationship = Relationship(**relationship_data)
        self.db.add(relationship)
        logger.info(f"✅ Create relationship: {from_person_id} → {to_person_id} ({relationship_type})")
        return True

    def _create_bidirectional_relationship_with_tracking(self, person1_id: int, person2_id: int,
                                                         relationship_type: str, messages: List[str]) -> Tuple[
        bool, bool]:
        """创建双向关系并添加消息"""
        try:
            person1 = self._get_person_or_raise(person1_id)
            person2 = self._get_person_or_raise(person2_id)

            # 创建主要关系
            main_created = False
            if not self._relationship_exists(person1_id, person2_id, relationship_type):
                main_sub_type_en = self.SUB_TYPE_MAP.get(relationship_type, {}).get(person1.gender, '')
                main_sub_type_zh = self.SUB_TYPE_DISPLAY_MAP.get(main_sub_type_en, main_sub_type_en)
                self._create_relationship_if_not_exists(person1_id, person2_id, relationship_type, main_sub_type_en)
                messages.append(f"添加 {person1.name} 为 {person2.name} 的 {main_sub_type_zh}")
                main_created = True

            # 创建相反关系
            opposite_created = False
            opposite_type = self.RELATIONSHIP_TYPE_MAP.get(relationship_type)
            if opposite_type and not self._relationship_exists(person2_id, person1_id, opposite_type):
                opposite_sub_type_en = self.SUB_TYPE_MAP.get(opposite_type, {}).get(person2.gender, '')
                opposite_sub_type_zh = self.SUB_TYPE_DISPLAY_MAP.get(opposite_sub_type_en, opposite_sub_type_en)
                self._create_relationship_if_not_exists(person2_id, person1_id, opposite_type, opposite_sub_type_en)
                messages.append(f"添加 {person2.name} 为 {person1.name} 的 {opposite_sub_type_zh}")
                opposite_created = True

            logger.info(f"✅ Create bidirectional relationship: {person1.name} ↔ {person2.name} ({relationship_type})")
            return main_created, opposite_created

        except Exception as e:
            logger.error(f"Create bidirectional relationship failed: {e}")
            return False, False

    def _validate_relationship(self, from_person_id: int, to_person_id: int, relationship_type: str) -> Tuple[
        bool, str]:
        """验证关系是否有效"""
        try:
            if from_person_id == to_person_id:
                return False, "Cannot establish relationship with oneself"

            from_person = self._get_person_or_raise(from_person_id)
            to_person = self._get_person_or_raise(to_person_id)

            if relationship_type == 'spouse' and from_person.gender == to_person.gender:
                return False, "Spouse relationship must be between different genders"

            # 检查关系是否已存在
            if self._relationship_exists(from_person_id, to_person_id, relationship_type):
                return False, "This relationship already exists"

            return True, ""

        except Exception as e:
            return False, f"Error validating relationship: {e}"

    def get_relationships(self, from_person_id: int = None, to_person_id: int = None,
                          relationship_type: str = None) -> List[Relationship]:
        """获取关系列表"""
        query = self.db.query(Relationship)

        if from_person_id:
            query = query.filter(Relationship.from_person_id == from_person_id)
        if to_person_id:
            query = query.filter(Relationship.to_person_id == to_person_id)
        if relationship_type:
            query = query.filter(Relationship.relationship_type == relationship_type)

        return query.all()

    def create_relationship_with_tracking(self, relationship_data: Dict[str, Any]) -> Tuple[Relationship, List[str]]:
        """创建关系并返回所有自动创建的关系消息"""
        from_person_id = relationship_data['from_person_id']
        to_person_id = relationship_data['to_person_id']
        relationship_type = relationship_data['relationship_type']

        # 存储所有创建的关系消息
        creation_messages = []

        # 验证关系
        valid, message = self._validate_relationship(from_person_id, to_person_id, relationship_type)
        if not valid:
            raise ValueError(message)

        # 获取人员信息用于消息显示
        from_person = self._get_person_or_raise(from_person_id)
        to_person = self._get_person_or_raise(to_person_id)

        # 1. 创建主动添加的关系（用户明确添加的关系）
        creation_messages.append(f"【主动添加】")

        # 创建双向基础关系并记录消息
        main_created, opposite_created = self._create_bidirectional_relationship_with_tracking(
            from_person_id, to_person_id, relationship_type, creation_messages
        )

        # 2. 根据关系类型处理自动创建逻辑并收集消息
        auto_messages = []
        if relationship_type == 'parent':
            auto_messages = self._handle_parent_relationship_with_tracking(from_person_id, to_person_id)
        elif relationship_type == 'child':
            auto_messages = self._handle_child_relationship_with_tracking(from_person_id, to_person_id)
        elif relationship_type == 'spouse':
            auto_messages = self._handle_spouse_relationship_with_tracking(from_person_id, to_person_id)

        if auto_messages:
            creation_messages.extend(auto_messages)

        # 提交事务
        self.db.commit()

        # 返回创建的主要关系和所有消息
        main_relationship = self.db.query(Relationship).filter(
            and_(
                Relationship.from_person_id == from_person_id,
                Relationship.to_person_id == to_person_id,
                Relationship.relationship_type == relationship_type
            )
        ).first()

        return main_relationship, creation_messages

    def _handle_parent_relationship_with_tracking(self, parent_id: int, child_id: int) -> List[str]:
        """处理父母关系自动创建逻辑并返回消息"""
        messages = []
        parent = self._get_person_or_raise(parent_id)
        child = self._get_person_or_raise(child_id)

        auto_created_count = 0

        # 1. 自动为父母的配偶添加子女关系
        spouse_ids = self._get_all_spouses(parent_id)

        for spouse_id in spouse_ids:
            if spouse_id == parent_id:
                continue

            spouse = self._get_person_or_raise(spouse_id)

            # 为配偶添加父母关系（双向）
            if not self._relationship_exists(spouse_id, child_id, 'parent'):
                # 使用带追踪的方法来创建双向关系并添加消息
                spouse_main_created, spouse_opposite_created = self._create_bidirectional_relationship_with_tracking(
                    spouse_id, child_id, 'parent', messages
                )
                if spouse_main_created or spouse_opposite_created:
                    auto_created_count += (1 if spouse_main_created else 0) + (1 if spouse_opposite_created else 0)

        if auto_created_count > 0:
            messages.insert(0, f"【自动添加 - 父母关系逻辑】")

        return messages

    def _handle_child_relationship_with_tracking(self, child_id: int, parent_id: int) -> List[str]:
        """处理子女关系自动创建逻辑并返回消息"""
        # 实际上与父母关系处理逻辑相同，只是方向相反
        return self._handle_parent_relationship_with_tracking(parent_id, child_id)

    def _handle_spouse_relationship_with_tracking(self, person1_id: int, person2_id: int) -> List[str]:
        """处理配偶关系自动创建逻辑并返回消息"""
        messages = []
        person1 = self._get_person_or_raise(person1_id)
        person2 = self._get_person_or_raise(person2_id)

        auto_created_count = 0

        # 1. 自动建立与对方子女的父母关系
        person1_children = self.get_relationships(
            from_person_id=person1_id,
            relationship_type='parent'
        )

        for child_rel in person1_children:
            child_id = child_rel.to_person_id
            if not self._relationship_exists(person2_id, child_id, 'parent'):
                # 使用带追踪的方法来创建双向关系并添加消息
                child_main_created, child_opposite_created = self._create_bidirectional_relationship_with_tracking(
                    person2_id, child_id, 'parent', messages
                )
                if child_main_created or child_opposite_created:
                    auto_created_count += (1 if child_main_created else 0) + (1 if child_opposite_created else 0)

        # 2. 自动建立与对方父母的岳父母/公婆关系
        person1_parents = self.get_relationships(
            from_person_id=person1_id,
            relationship_type='child'
        )

        for parent_rel in person1_parents:
            parent_id = parent_rel.to_person_id
            if not self._relationship_exists(person2_id, parent_id, 'parent'):
                # 使用带追踪的方法来创建双向关系并添加消息
                parent_main_created, parent_opposite_created = self._create_bidirectional_relationship_with_tracking(
                    person2_id, parent_id, 'parent', messages
                )
                if parent_main_created or parent_opposite_created:
                    auto_created_count += (1 if parent_main_created else 0) + (1 if parent_opposite_created else 0)

        if auto_created_count > 0:
            messages.insert(0, f"【自动添加 - 配偶关系逻辑】")

        return messages

    def _get_all_spouses(self, person_id: int) -> List[int]:
        """获取所有配偶ID"""
        spouse_ids = set()

        # 作为发起方的配偶关系
        spouse_relationships_as_from = self.get_relationships(
            from_person_id=person_id,
            relationship_type='spouse'
        )
        for rel in spouse_relationships_as_from:
            spouse_ids.add(rel.to_person_id)

        # 作为接收方的配偶关系
        spouse_relationships_as_to = self.get_relationships(
            to_person_id=person_id,
            relationship_type='spouse'
        )
        for rel in spouse_relationships_as_to:
            spouse_ids.add(rel.from_person_id)

        return list(spouse_ids)

    def get_person_relationships(self, person_id: int) -> Dict[str, List[Person]]:
        """获取指定人员的所有关系"""
        # 查询该人员作为起点的关系
        from_relationships = self.get_relationships(from_person_id=person_id)
        # 查询该人员作为终点的关系
        to_relationships = self.get_relationships(to_person_id=person_id)

        relationships = {
            'parents': [],
            'spouses': [],
            'children': []
        }

        # 用于记录已添加的人员ID，避免重复
        added_person_ids = {
            'parents': set(),
            'spouses': set(),
            'children': set()
        }

        # 处理从该人员出发的关系
        for rel in from_relationships:
            related_person = self._get_person_or_raise(rel.to_person_id)
            if rel.relationship_type == 'parent':
                if related_person.id not in added_person_ids['children']:
                    relationships['children'].append(related_person)
                    added_person_ids['children'].add(related_person.id)
            elif rel.relationship_type == 'child':
                if related_person.id not in added_person_ids['parents']:
                    relationships['parents'].append(related_person)
                    added_person_ids['parents'].add(related_person.id)
            elif rel.relationship_type == 'spouse':
                if related_person.id not in added_person_ids['spouses']:
                    relationships['spouses'].append(related_person)
                    added_person_ids['spouses'].add(related_person.id)

        # 处理指向该人员的关系
        for rel in to_relationships:
            related_person = self._get_person_or_raise(rel.from_person_id)
            if rel.relationship_type == 'parent':
                if related_person.id not in added_person_ids['parents']:
                    relationships['parents'].append(related_person)
                    added_person_ids['parents'].add(related_person.id)
            elif rel.relationship_type == 'child':
                if related_person.id not in added_person_ids['children']:
                    relationships['children'].append(related_person)
                    added_person_ids['children'].add(related_person.id)
            elif rel.relationship_type == 'spouse':
                if related_person.id not in added_person_ids['spouses']:
                    relationships['spouses'].append(related_person)
                    added_person_ids['spouses'].add(related_person.id)

        return relationships

    def get_relationship(self, relationship_id: int) -> Optional[Relationship]:
        """根据ID获取关系"""
        return self.db.query(Relationship).filter(Relationship.id == relationship_id).first()

    def get_all_relationships(self) -> List[Relationship]:
        """获取所有关系"""
        return self.db.query(Relationship).all()

    def delete_relationship_and_opposite(self, relationship_id: int) -> bool:
        """删除关系及其反向关系"""
        try:
            relationship = self.get_relationship(relationship_id)
            if not relationship:
                return False

            # 查找反向关系
            opposite_type = self.RELATIONSHIP_TYPE_MAP.get(relationship.relationship_type)
            opposite_relationship = self.db.query(Relationship).filter(
                and_(
                    Relationship.from_person_id == relationship.to_person_id,
                    Relationship.to_person_id == relationship.from_person_id,
                    Relationship.relationship_type == opposite_type
                )
            ).first()

            # 删除关系
            self.db.delete(relationship)
            if opposite_relationship:
                self.db.delete(opposite_relationship)

            self.db.commit()
            return True

        except Exception as e:
            logger.error(f"Delete relationship failed: {e}")
            self.db.rollback()
            return False

    def count_relationships(self) -> int:
        """统计关系总数"""
        return self.db.query(Relationship).count()