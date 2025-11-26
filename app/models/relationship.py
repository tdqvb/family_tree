"""
关系数据模型 - 修复双向关系显示版本
"""

from sqlalchemy import Column, Integer, String, ForeignKey, Index
from sqlalchemy.orm import relationship
from .base import Base


class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, autoincrement=True, comment="Relationship ID")
    from_person_id = Column(Integer, ForeignKey('persons.id'), nullable=False, comment="Source person ID")
    to_person_id = Column(Integer, ForeignKey('persons.id'), nullable=False, comment="Target person ID")
    relationship_type = Column(String(20), nullable=False, comment="Relationship type: parent, child, spouse")
    sub_type = Column(String(20), comment="Relationship sub-type: father, mother, son, daughter, husband, wife")

    # 关系引用
    from_person = relationship("Person", foreign_keys=[from_person_id], backref="outgoing_relationships")
    to_person = relationship("Person", foreign_keys=[to_person_id], backref="incoming_relationships")

    # 创建索引
    __table_args__ = (
        Index('idx_relationship_from_to', 'from_person_id', 'to_person_id'),
        Index('idx_relationship_type', 'relationship_type'),
    )

    def __repr__(self):
        return f"<Relationship(id={self.id}, {self.from_person_id}->{self.to_person_id}, {self.relationship_type})>"

    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'from_person_id': self.from_person_id,
            'to_person_id': self.to_person_id,
            'relationship_type': self.relationship_type,
            'sub_type': self.sub_type
        }