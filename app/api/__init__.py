#!/usr/bin/env python3
"""API 路由聚合"""
from fastapi import APIRouter
# 新增导入 apiall 路由
from app.api.endpoints import persons, relationships, apiall

api_router = APIRouter()
# 保持原有路由不变
api_router.include_router(persons.router)
api_router.include_router(relationships.router)
# 添加新的 apiall 路由
api_router.include_router(apiall.router)