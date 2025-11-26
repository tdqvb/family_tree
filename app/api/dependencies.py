#!/usr/bin/env python3
"""API 依赖项配置：数据库会话、服务实例、权限校验等"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.services.database import DatabaseManager
from app.services.person_service import PersonService
from app.services.relationship_service import RelationshipService
from app.models.person import Person
from config import Config

# 初始化数据库管理器（复用项目配置）
db_manager = DatabaseManager(Config.SQLALCHEMY_DATABASE_URL)

def get_db() -> Session:
    """获取数据库会话（请求结束后自动关闭）"""
    db = db_manager.get_session()
    try:
        yield db
    finally:
        db.close()

def get_person_service(db: Session = Depends(get_db)) -> PersonService:
    """获取人员服务实例"""
    return PersonService(db)

def get_relationship_service(db: Session = Depends(get_db)) -> RelationshipService:
    """获取关系服务实例"""
    return RelationshipService(db)

def validate_person_exists(person_id: int, service: PersonService = Depends(get_person_service)) -> Person:
    """校验人员ID是否存在，不存在则抛出404异常"""
    person = service.get_person(person_id)
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Person with ID {person_id} not found"
        )
    return person

def validate_relationship_exists(rel_id: int, service: RelationshipService = Depends(get_relationship_service)):
    """校验关系ID是否存在，不存在则抛出404异常"""
    rel = service.get_relationship(rel_id)
    if not rel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Relationship with ID {rel_id} not found"
        )
    return rel