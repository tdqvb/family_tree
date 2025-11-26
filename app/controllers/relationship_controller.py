"""
关系控制器 - 直接调用已有的 FastAPI 接口
"""
import requests
from flask import Blueprint, jsonify, request

# 创建关系相关的蓝图
relationship_bp = Blueprint('relationship', __name__, url_prefix='/api')

# FastAPI 服务地址
API_BASE_URL = "http://localhost:8000"


class APIClient:
    """API 客户端工具类"""

    @staticmethod
    def _request(method, url_path, data=None):
        """统一的请求方法"""
        try:
            url = f"{API_BASE_URL}{url_path}"
            if method.upper() == 'GET':
                response = requests.get(url, timeout=10)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, timeout=10)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, timeout=10)
            else:
                return {"success": False, "error": f"不支持的HTTP方法: {method}"}

            # 处理响应
            if response.status_code == 204:  # No Content
                return {"success": True}
            elif 200 <= response.status_code < 300:
                return response.json()
            else:
                return {
                    "success": False,
                    "error": f"API请求失败: {response.status_code} - {response.text}"
                }

        except requests.exceptions.RequestException as e:
            return {"success": False, "error": f"API请求异常: {str(e)}"}
        except Exception as e:
            return {"success": False, "error": f"处理响应时发生错误: {str(e)}"}


# 关系相关路由
@relationship_bp.route('/relationships', methods=['GET'])
def get_all_relationships():
    """获取所有关系 - 调用 GET /api/relationships"""
    result = APIClient._request('GET', '/api/relationships')
    return jsonify(result)


@relationship_bp.route('/relationships', methods=['POST'])
def create_relationship():
    """创建关系 - 调用 POST /api/relationships"""
    relationship_data = request.get_json()
    if not relationship_data:
        return jsonify({"success": False, "error": "请求体不能为空"})

    # 验证必需字段
    required_fields = ['from_person_id', 'to_person_id', 'relationship_type']
    for field in required_fields:
        if field not in relationship_data:
            return jsonify({"success": False, "error": f"缺少必需字段: {field}"})

    result = APIClient._request('POST', '/api/relationships', relationship_data)
    return jsonify(result)


@relationship_bp.route('/relationships/<int:relationship_id>', methods=['GET'])
def get_relationship(relationship_id):
    """获取关系详情 - 调用 GET /api/relationships/{rel_id}"""
    result = APIClient._request('GET', f'/api/relationships/{relationship_id}')
    return jsonify(result)


@relationship_bp.route('/relationships/<int:relationship_id>', methods=['DELETE'])
def delete_relationship(relationship_id):
    """删除关系 - 调用 DELETE /api/relationships/{rel_id}"""
    result = APIClient._request('DELETE', f'/api/relationships/{relationship_id}')
    return jsonify(result)


@relationship_bp.route('/relationships/person/<int:person_id>', methods=['GET'])
def get_person_relationships(person_id):
    """获取人员关系 - 调用 GET /api/relationships/person/{person_id}"""
    result = APIClient._request('GET', f'/api/relationships/person/{person_id}')
    return jsonify(result)


@relationship_bp.route('/relationships/stats', methods=['GET'])
def get_relationship_stats():
    """获取关系统计 - 调用 GET /api/relationships/stats"""
    result = APIClient._request('GET', '/api/relationships/stats')
    return jsonify(result)