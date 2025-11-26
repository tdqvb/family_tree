"""
人员相关业务逻辑服务
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
from datetime import date
from app.models.person import Person
from app.models.relationship import Relationship


class PersonService:
    """人员服务类"""

    def __init__(self, db: Session):
        self.db = db

    def create_person(self, person_data: Dict[str, Any]) -> Person:
        """创建人员"""
        # 处理 death_date_accuracy 字段逻辑
        # 只有在填写了 death_date 时才需要 death_date_accuracy
        if 'death_date' not in person_data or not person_data.get('death_date'):
            # 如果没有逝世日期，确保 death_date_accuracy 为 None
            person_data.pop('death_date_accuracy', None)
        elif 'death_date_accuracy' not in person_data:
            # 如果有逝世日期但没有填写精确度，设置默认值
            person_data['death_date_accuracy'] = 'exact'

        person = Person(**person_data)
        self.db.add(person)
        self.db.commit()
        self.db.refresh(person)
        return person

    def get_person(self, person_id: int) -> Optional[Person]:
        """根据ID获取人员"""
        return self.db.query(Person).filter(Person.id == person_id).first()

    def get_person_by_name(self, name: str) -> List[Person]:
        """根据姓名获取人员（精确匹配）"""
        return self.db.query(Person).filter(Person.name == name).all()

    def get_all_persons(self, skip: int = 0, limit: int = 100, order_by: str = "id") -> List[Person]:
        """获取所有人员（带分页）"""
        # 处理排序字段
        order_column = getattr(Person, order_by, Person.id)
        return self.db.query(Person).order_by(asc(order_column)).offset(skip).limit(limit).all()

    def update_person(self, person_id: int, update_data: Dict[str, Any]) -> Optional[Person]:
        """更新人员信息"""
        person = self.get_person(person_id)
        if person:
            # 处理 death_date_accuracy 逻辑
            if 'death_date' in update_data:
                if not update_data['death_date']:
                    # 如果清空了逝世日期，也清空精确度
                    update_data['death_date_accuracy'] = None
                elif 'death_date_accuracy' not in update_data:
                    # 如果设置了逝世日期但没有精确度，设置默认值
                    update_data['death_date_accuracy'] = 'exact'

            for key, value in update_data.items():
                if hasattr(person, key):
                    setattr(person, key, value)
            self.db.commit()
            self.db.refresh(person)
        return person

    def delete_person(self, person_id: int) -> bool:
        """删除人员"""
        person = self.get_person(person_id)
        if person:
            self.db.delete(person)
            self.db.commit()
            return True
        return False

    def search_persons(self, search_term: str, skip: int = 0, limit: int = 100) -> List[Person]:
        """搜索人员（模糊匹配，带分页）"""
        query = self.db.query(Person).filter(
            or_(
                Person.name.like(f"%{search_term}%"),
                Person.phone.like(f"%{search_term}%"),
                Person.email.like(f"%{search_term}%"),
                Person.birth_place.like(f"%{search_term}%")
            )
        )
        return query.offset(skip).limit(limit).all()

    def search_persons_all(self, search_term: str) -> List[Person]:
        """搜索人员（模糊匹配，不分页）"""
        return self.db.query(Person).filter(
            or_(
                Person.name.like(f"%{search_term}%"),
                Person.phone.like(f"%{search_term}%"),
                Person.email.like(f"%{search_term}%"),
                Person.birth_place.like(f"%{search_term}%")
            )
        ).all()

    def get_persons_by_birth_date_range(self, start_date: date, end_date: date) -> List[Person]:
        """根据出生日期范围查询人员"""
        return self.db.query(Person).filter(
            and_(
                Person.birth_date >= start_date,
                Person.birth_date <= end_date
            )
        ).all()

    def get_persons_by_gender(self, gender: str, skip: int = 0, limit: int = 100) -> List[Person]:
        """根据性别查询人员（带分页）"""
        return self.db.query(Person).filter(Person.gender == gender).offset(skip).limit(limit).all()

    def get_persons_by_gender_all(self, gender: str) -> List[Person]:
        """根据性别查询人员（不分页）"""
        return self.db.query(Person).filter(Person.gender == gender).all()

    def get_living_persons(self, skip: int = 0, limit: int = 100) -> List[Person]:
        """获取在世人员（带分页）"""
        return self.db.query(Person).filter(Person.is_living == True).offset(skip).limit(limit).all()

    def get_living_persons_all(self) -> List[Person]:
        """获取在世人员（不分页）"""
        return self.db.query(Person).filter(Person.is_living == True).all()

    def get_family_members(self, person_id: int) -> Dict[str, List[Person]]:
        """获取家庭成员"""
        relationships = self.db.query(Relationship).filter(
            Relationship.from_person_id == person_id
        ).all()

        family = {
            'parents': [],
            'spouses': [],
            'children': [],
            'siblings': []
        }

        for rel in relationships:
            if rel.relationship_type == 'parent':
                family['parents'].append(rel.to_person)
            elif rel.relationship_type == 'spouse':
                family['spouses'].append(rel.to_person)
            elif rel.relationship_type == 'child':
                family['children'].append(rel.to_person)

        return family

    def count_persons(self) -> int:
        """统计人员总数"""
        return self.db.query(Person).count()

    def count_search_persons(self, search_term: str) -> int:
        """统计搜索结果总数"""
        return self.db.query(Person).filter(
            or_(
                Person.name.like(f"%{search_term}%"),
                Person.phone.like(f"%{search_term}%"),
                Person.email.like(f"%{search_term}%"),
                Person.birth_place.like(f"%{search_term}%")
            )
        ).count()

    def count_persons_by_gender(self, gender: str) -> int:
        """按性别统计人员总数"""
        return self.db.query(Person).filter(Person.gender == gender).count()

    def count_living_persons(self) -> int:
        """统计在世人员总数"""
        return self.db.query(Person).filter(Person.is_living == True).count()

    def filter_persons_combined(
            self,
            keyword: Optional[str] = None,
            gender: Optional[str] = None,
            skip: int = 0,
            limit: int = 100
    ) -> tuple[List[Person], int]:
        """组合筛选人员（支持关键词搜索和性别筛选）"""
        try:
            # 构建查询条件
            query_conditions = []

            # 关键词搜索条件
            if keyword and keyword.strip():
                query_conditions.append(
                    or_(
                        Person.name.like(f"%{keyword.strip()}%"),
                        Person.phone.like(f"%{keyword.strip()}%"),
                        Person.email.like(f"%{keyword.strip()}%"),
                        Person.birth_place.like(f"%{keyword.strip()}%"),
                        Person.biography.like(f"%{keyword.strip()}%")
                    )
                )

            # 性别筛选条件
            if gender and gender in ['M', 'F']:
                query_conditions.append(Person.gender == gender)

            # 总数查询
            count_query = self.db.query(func.count(Person.id))
            if query_conditions:
                count_query = count_query.filter(and_(*query_conditions))
            total = count_query.scalar()

            # 数据查询
            data_query = self.db.query(Person)
            if query_conditions:
                data_query = data_query.filter(and_(*query_conditions))

            persons = data_query.order_by(Person.id).offset(skip).limit(limit).all()

            return persons, total

        except Exception as e:
            print(f"❌ 组合查询失败: {str(e)}")
            raise e