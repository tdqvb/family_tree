"""
人员数据模型
"""

from sqlalchemy import Column, Integer, String, Date, Enum, Boolean, Text, TIMESTAMP, Index
from sqlalchemy.sql import func
from .base import Base


class Person(Base):
    __tablename__ = "persons"

    # 主键和基本身份信息
    id = Column(Integer, primary_key=True, autoincrement=True, comment="人员ID")
    name = Column(String(100), nullable=False, comment="姓名")
    gender = Column(Enum('M', 'F'), nullable=False, comment="性别")

    # 出生日期信息
    birth_date = Column(Date, nullable=False, comment="出生日期")
    birth_date_type = Column(Enum('solar', 'lunar'), nullable=False, comment="出生日期类型")  # 修改：date_type -> birth_date_type
    birth_date_accuracy = Column(Enum('exact', 'year_month', 'year_only'), default='exact', comment="出生日期精确度")  # 修改：date_accuracy -> birth_date_accuracy

    # 逝世日期信息
    death_date = Column(Date, comment="逝世日期")
    death_date_type = Column(Enum('solar', 'lunar'), comment="逝世日期类型")
    death_date_accuracy = Column(Enum('exact', 'year_month', 'year_only'), comment="逝世日期精确度")

    # 扩展信息
    phone = Column(String(20), comment="电话")
    email = Column(String(100), comment="邮箱")
    birth_place = Column(String(200), comment="出生地")
    avatar_path = Column(String(500), comment="头像路径")
    is_living = Column(Boolean, default=True, comment="是否在世")
    biography = Column(Text, comment="生平简介")

    # 时间戳
    created_at = Column(TIMESTAMP, default=func.now(), comment="创建时间")
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now(), comment="更新时间")

    def __repr__(self):
        return f"<Person(id={self.id}, name='{self.name}', gender='{self.gender}')>"

    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'name': self.name,
            'gender': self.gender,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'birth_date_type': self.birth_date_type,  # 修改：date_type -> birth_date_type
            'birth_date_accuracy': self.birth_date_accuracy,  # 修改：date_accuracy -> birth_date_accuracy
            'death_date': self.death_date.isoformat() if self.death_date else None,
            'death_date_type': self.death_date_type,
            'death_date_accuracy': self.death_date_accuracy,
            'phone': self.phone,
            'email': self.email,
            'birth_place': self.birth_place,
            'avatar_path': self.avatar_path,
            'is_living': self.is_living,
            'biography': self.biography,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }