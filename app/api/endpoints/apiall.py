from fastapi import APIRouter, Request, Response
import json
from typing import Dict, List, Any

router = APIRouter(tags=["API 信息"])


@router.get("/apiall", summary="Get All Api Endpoints")
def get_all_api_endpoints(request: Request) -> Response:
    """获取系统中所有 API 的路径、请求方法和摘要信息，返回格式化的 JSON"""
    openapi_schema = request.app.openapi()
    endpoints = []

    # 提取所有接口信息（排除自身）
    for path, methods in openapi_schema.get("paths", {}).items():
        for method, details in methods.items():
            if path != "/apiall":
                endpoints.append({
                    "path": path,
                    "method": method.upper(),
                    "summary": details.get("summary", "无摘要信息")
                })

    # 按路径前缀分组
    groups = {
        "人员相关接口": [],
        "关系相关接口": [],
        "全局接口": []
    }

    for endpoint in endpoints:
        path = endpoint["path"]
        if "/api/persons" in path:
            groups["人员相关接口"].append(endpoint)
        elif "/api/relationships" in path:
            groups["关系相关接口"].append(endpoint)
        else:
            groups["全局接口"].append(endpoint)

    # 构建响应数据
    response_data = {
        "total": len(endpoints),
        "group_counts": {name: len(items) for name, items in groups.items()},
        "groups": groups
    }

    # 返回带缩进的 JSON 响应（关键修改）
    return Response(
        content=json.dumps(response_data, ensure_ascii=False, indent=2),
        media_type="application/json"
    )