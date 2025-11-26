#!/usr/bin/env python3
"""人员相关 API 接口"""
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional, Dict
from datetime import date
from sqlalchemy import and_, or_
from app.services.person_service import PersonService
from app.models.person import Person
from app.api.dependencies import get_person_service, validate_person_exists

router = APIRouter(
    prefix="/api/persons",
    tags=["persons"],
    responses={404: {"description": "Person not found"}}
)


# ========== 具体路由在前 ==========

# 1. 搜索人员（模糊匹配姓名/电话/邮箱/出生地）- 添加分页
@router.get("/search", response_model=Dict)
def search_persons(
        keyword: str = Query(..., description="搜索关键词", min_length=1),
        service: PersonService = Depends(get_person_service),
        skip: int = Query(0, ge=0, description="跳过条数"),
        limit: int = Query(10, ge=1, le=1000, description="每页条数")
):
    """模糊搜索人员（支持姓名、电话、邮箱、出生地）"""
    # 添加调试信息
    print(f"🔍 搜索关键词: '{keyword}', skip: {skip}, limit: {limit}")

    persons = service.search_persons(keyword, skip=skip, limit=limit)
    total = service.count_search_persons(keyword)

    return {
        "data": [p.to_dict() for p in persons],
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": skip + limit < total
    }


# 2. 按性别筛选人员 - 添加分页
@router.get("/filter/gender", response_model=Dict)
def get_persons_by_gender(
        gender: str = Query(..., pattern="^[MF]$", description="性别（M=男，F=女）"),
        service: PersonService = Depends(get_person_service),
        skip: int = Query(0, ge=0, description="跳过条数"),
        limit: int = Query(10, ge=1, le=1000, description="每页条数")
):
    """按性别筛选人员"""
    persons = service.get_persons_by_gender(gender, skip=skip, limit=limit)
    total = service.count_persons_by_gender(gender)

    return {
        "data": [p.to_dict() for p in persons],
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": skip + limit < total
    }


# 2.5 组合查询人员（支持关键词搜索和性别筛选）
@router.get("/filter/combined", response_model=Dict)
def filter_persons_combined(
        keyword: Optional[str] = Query(None, description="搜索关键词"),
        gender: Optional[str] = Query(None, pattern="^[MF]$", description="性别筛选"),
        service: PersonService = Depends(get_person_service),
        skip: int = Query(0, ge=0, description="跳过条数"),
        limit: int = Query(10, ge=1, le=1000, description="每页条数")
):
    """组合筛选人员（支持关键词搜索和性别筛选）"""
    try:
        # 调试信息
        print(f"🔍 组合查询 - 关键词: '{keyword}', 性别: '{gender}', skip: {skip}, limit: {limit}")

        persons, total = service.filter_persons_combined(keyword, gender, skip, limit)

        return {
            "data": [p.to_dict() for p in persons],
            "total": total,
            "skip": skip,
            "limit": limit,
            "has_more": skip + limit < total
        }

    except Exception as e:
        print(f"❌ 组合查询失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"组合查询失败: {str(e)}")


# 3. 获取在世人员 - 添加分页
@router.get("/filter/living", response_model=Dict)
def get_living_persons(
        service: PersonService = Depends(get_person_service),
        skip: int = Query(0, ge=0, description="跳过条数"),
        limit: int = Query(10, ge=1, le=1000, description="每页条数")
):
    """获取所有在世人员"""
    persons = service.get_living_persons(skip=skip, limit=limit)
    total = service.count_living_persons()

    return {
        "data": [p.to_dict() for p in persons],
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": skip + limit < total
    }


# 4. 人员统计
@router.get("/stats", response_model=Dict)
def get_person_stats(
        service: PersonService = Depends(get_person_service)
):
    """获取人员统计信息（总数、男女比例、在世人数）"""
    total = service.count_persons()
    male = service.count_persons_by_gender("M")
    female = service.count_persons_by_gender("F")
    living = service.count_living_persons()
    return {
        "total": total,
        "male": male,
        "female": female,
        "living": living,
        "living_rate": round(living / total * 100, 2) if total > 0 else 0
    }


# 5. 获取所有人员（支持分页、排序）
@router.get("", response_model=Dict)
def get_all_persons(
        service: PersonService = Depends(get_person_service),
        skip: int = Query(0, ge=0, description="跳过条数"),
        limit: int = Query(10, ge=1, le=1000, description="每页条数"),
        order_by: str = Query("id", description="排序字段（name/birth_date/id）")
):
    """获取人员列表（支持分页和排序）"""
    persons = service.get_all_persons(skip=skip, limit=limit, order_by=order_by)
    total = service.count_persons()

    return {
        "data": [p.to_dict() for p in persons],
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": skip + limit < total
    }


# ========== 参数路由在最后 ==========

# 6. 获取单个人员详情
@router.get("/{person_id}", response_model=Dict)
def get_person(
        person: Person = Depends(validate_person_exists)
):
    """根据ID获取人员详情"""
    return person.to_dict()


# 7. 添加人员
@router.post("", response_model=Dict, status_code=201)
def create_person(
        person_data: Dict,  # 实际项目可使用 Pydantic 模型校验字段
        service: PersonService = Depends(get_person_service)
):
    """添加新人员"""
    # 基础字段校验（实际可用 Pydantic 替代）
    required_fields = ["name", "gender", "birth_date", "birth_date_type"]  # 修改：date_type -> birth_date_type
    for field in required_fields:
        if field not in person_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    # 处理 death_date_accuracy 逻辑
    # 只有在填写了 death_date 时才需要 death_date_accuracy
    if 'death_date' not in person_data or not person_data.get('death_date'):
        # 如果没有逝世日期，确保 death_date_accuracy 为 None
        person_data.pop('death_date_accuracy', None)
    elif 'death_date_accuracy' not in person_data:
        # 如果有逝世日期但没有填写精确度，设置默认值
        person_data['death_date_accuracy'] = 'exact'

    try:
        person = service.create_person(person_data)
        return person.to_dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# 8. 更新人员信息
@router.put("/{person_id}", response_model=Dict)
def update_person(
        person_id: int,
        update_data: Dict,
        service: PersonService = Depends(get_person_service),
        _: Person = Depends(validate_person_exists)  # 先验证人员存在
):
    """更新人员信息（仅传需要修改的字段）"""
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    # 处理 death_date_accuracy 逻辑
    if 'death_date' in update_data:
        if not update_data['death_date']:
            # 如果清空了逝世日期，也清空精确度
            update_data['death_date_accuracy'] = None
        elif 'death_date_accuracy' not in update_data:
            # 如果设置了逝世日期但没有精确度，设置默认值
            update_data['death_date_accuracy'] = 'exact'

    person = service.update_person(person_id, update_data)
    return person.to_dict()


# 9. 删除人员
@router.delete("/{person_id}", status_code=204)
def delete_person(
        person_id: int,
        service: PersonService = Depends(get_person_service),
        _: Person = Depends(validate_person_exists)
):
    """删除人员（同时会删除关联关系）"""
    success = service.delete_person(person_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete person")
    return None