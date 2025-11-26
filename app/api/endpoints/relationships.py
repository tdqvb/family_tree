#!/usr/bin/env python3
"""关系相关 API 接口"""
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Dict, Optional
from app.services.relationship_service import RelationshipService
from app.models.relationship import Relationship
from app.models.person import Person
from app.api.dependencies import (
    get_relationship_service,
    get_person_service,
    validate_person_exists
)

router = APIRouter(
    prefix="/api/relationships",
    tags=["relationships"],
    responses={404: {"description": "Relationship not found"}}
)


# 1. 获取单个关系详情
@router.get("/{rel_id}", response_model=Dict)
def get_relationship(
        rel_id: int,
        service: RelationshipService = Depends(get_relationship_service)
):
    """根据ID获取关系详情"""
    rel = service.get_relationship(rel_id)
    if not rel:
        raise HTTPException(status_code=404, detail=f"Relationship {rel_id} not found")
    return rel.to_dict()


# 2. 获取所有关系
@router.get("", response_model=List[Dict])
def get_all_relationships(
        service: RelationshipService = Depends(get_relationship_service)
):
    """获取所有关系列表"""
    rels = service.get_all_relationships()
    return [r.to_dict() for r in rels]


# 3. 添加关系（自动创建双向关系）
@router.post("", response_model=Dict, status_code=201)
def create_relationship(
        relationship_data: Dict,
        service: RelationshipService = Depends(get_relationship_service)
):
    """添加关系（支持 parent/child/spouse，自动创建双向关系）"""
    print(f"📥 收到关系创建请求: {relationship_data}")

    required_fields = ["from_person_id", "to_person_id", "relationship_type"]
    for field in required_fields:
        if field not in relationship_data:
            error_msg = f"Missing required field: {field}"
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)

    # 校验关系类型合法
    valid_types = ["parent", "child", "spouse"]
    if relationship_data["relationship_type"] not in valid_types:
        error_msg = f"Invalid relationship type. Must be one of {valid_types}"
        print(f"❌ {error_msg}")
        raise HTTPException(status_code=400, detail=error_msg)

    # 验证人员ID是否为整数
    try:
        from_person_id = int(relationship_data["from_person_id"])
        to_person_id = int(relationship_data["to_person_id"])
    except (ValueError, TypeError) as e:
        error_msg = f"Invalid person ID format: {e}"
        print(f"❌ {error_msg}")
        raise HTTPException(status_code=400, detail=error_msg)

    print(f"✅ 请求数据验证通过")

    try:
        # 使用新的带追踪的方法
        rel, creation_messages = service.create_relationship_with_tracking(relationship_data)

        # 计算实际创建的关系数量（排除分类标题，只计算具体的关系消息）
        actual_created_count = len([msg for msg in creation_messages if not msg.startswith('【')])

        print(f"✅ 关系创建成功，共创建 {actual_created_count} 个关系")

        # 返回结果包含所有创建的关系信息
        return {
            "relationship": rel.to_dict(),
            "creation_messages": creation_messages,
            "total_created": actual_created_count,
            "success": True
        }
    except ValueError as e:
        print(f"❌ 业务逻辑错误: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ 服务器错误: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 4. 删除关系（同时删除双向关系）
@router.delete("/{rel_id}", status_code=204)
def delete_relationship(
        rel_id: int,
        service: RelationshipService = Depends(get_relationship_service)
):
    """删除关系（自动清理反向关系）"""
    success = service.delete_relationship_and_opposite(rel_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Relationship {rel_id} not found or delete failed")
    return None


# 5. 获取指定人员的所有关系
@router.get("/person/{person_id}", response_model=Dict)
def get_person_relationships(
        person: Person = Depends(validate_person_exists),
        service: RelationshipService = Depends(get_relationship_service)
):
    """获取指定人员的所有关系（父母/配偶/子女）"""
    relationships = service.get_person_relationships(person.id)
    # 格式化返回结果（包含关联人员详情）
    return {
        "person_id": person.id,
        "person_name": person.name,
        "relationships": {
            "parents": [p.to_dict() for p in relationships["parents"]],
            "spouses": [p.to_dict() for p in relationships["spouses"]],
            "children": [p.to_dict() for p in relationships["children"]]
        }
    }


# 6. 关系统计
@router.get("/stats", response_model=Dict)
def get_relationship_stats(
        service: RelationshipService = Depends(get_relationship_service)
):
    """获取关系统计信息（总关系数）"""
    total = service.count_relationships()
    return {"total_relationships": total}