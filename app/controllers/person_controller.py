"""
人员控制器 - 直接调用已有的 FastAPI 接口
"""
import requests
from flask import Blueprint, jsonify, request

# 创建人员相关的蓝图
person_bp = Blueprint('person', __name__, url_prefix='/api/persons')

# FastAPI 服务地址
API_BASE_URL = "http://localhost:8000"


class APIClient:
    """API 客户端工具类"""

    @staticmethod
    def _request(method, url_path, data=None, params=None):
        """统一的请求方法"""
        try:
            url = f"{API_BASE_URL}{url_path}"
            print(f"🌐 API调用: {method} {url}, 参数: {params}")

            if method.upper() == 'GET':
                response = requests.get(url, params=params, timeout=10)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, timeout=10)
            elif method.upper() == 'PUT':
                response = requests.put(url, json=data, timeout=10)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, timeout=10)
            else:
                return {"success": False, "error": f"不支持的HTTP方法: {method}"}

            print(f"📡 API响应状态: {response.status_code}")

            # 处理响应
            if response.status_code == 204:  # No Content
                return {"success": True}
            elif response.status_code == 201:  # Created
                try:
                    result = response.json()
                    result["success"] = True
                    return result
                except:
                    return {"success": True}
            elif 200 <= response.status_code < 300:
                result = response.json()
                result["success"] = True
                return result
            else:
                error_msg = f"API请求失败: {response.status_code} - {response.text}"
                print(f"❌ {error_msg}")
                return {
                    "success": False,
                    "error": error_msg
                }

        except requests.exceptions.RequestException as e:
            error_msg = f"API请求异常: {str(e)}"
            print(f"❌ {error_msg}")
            return {"success": False, "error": error_msg}
        except Exception as e:
            error_msg = f"处理响应时发生错误: {str(e)}"
            print(f"❌ {error_msg}")
            return {"success": False, "error": error_msg}


def handle_api_response(result):
    """统一处理API响应格式"""
    if isinstance(result, dict):
        if 'data' in result:
            # 新格式的响应
            return jsonify({
                "success": True,
                "data": result.get('data', []),
                "total": result.get('total', 0),
                "skip": result.get('skip', 0),
                "limit": result.get('limit', 10),
                "has_more": result.get('has_more', False)
            })
        elif 'success' in result and not result['success']:
            # 错误响应
            return jsonify(result)

    # 其他情况，假设成功
    return jsonify({
        "success": True,
        "data": result if isinstance(result, list) else [],
        "total": len(result) if isinstance(result, list) else 0,
        "skip": 0,
        "limit": 10,
        "has_more": False
    })


# 人员相关路由
@person_bp.route('', methods=['GET'])
def get_all_persons():
    """获取所有人员 - 支持组合筛选"""
    try:
        # 获取查询参数
        keyword = request.args.get('keyword', '').strip()
        gender = request.args.get('gender', '')
        skip = request.args.get('skip', 0, type=int)
        limit = request.args.get('limit', 10, type=int)
        order_by = request.args.get('order_by', 'id')

        # 调试信息
        print(f"🎯 Flask路由 - 关键词: '{keyword}', 性别: '{gender}', skip: {skip}, limit: {limit}")

        # 使用新的组合查询端点处理所有筛选情况
        params = {
            'skip': skip,
            'limit': limit
        }

        # 添加可选参数
        if keyword:
            params['keyword'] = keyword
        if gender:
            params['gender'] = gender

        # 调用组合查询端点
        result = APIClient._request('GET', '/api/persons/filter/combined', params=params)

        return handle_api_response(result)

    except Exception as e:
        print(f"❌ Flask路由错误: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"获取人员列表失败: {str(e)}"
        })


@person_bp.route('', methods=['POST'])
def create_person():
    """添加新人员 - 调用 POST /api/persons"""
    person_data = request.get_json()
    if not person_data:
        return jsonify({"success": False, "error": "请求体不能为空"})

    # 处理 death_date_accuracy 逻辑
    # 只有在填写了 death_date 时才需要 death_date_accuracy
    if 'death_date' not in person_data or not person_data.get('death_date'):
        # 如果没有逝世日期，确保 death_date_accuracy 为 None
        person_data.pop('death_date_accuracy', None)
    elif 'death_date_accuracy' not in person_data:
        # 如果有逝世日期但没有填写精确度，设置默认值
        person_data['death_date_accuracy'] = 'exact'

    result = APIClient._request('POST', '/api/persons', person_data)

    print(f"📊 FastAPI返回结果: {result}")

    # 修复响应格式处理
    if isinstance(result, dict):
        if 'id' in result:
            # FastAPI 返回了创建的人员数据（直接是人员对象）
            return jsonify({
                "success": True,
                "data": result,  # 人员数据放在 data 字段
                "message": "人员添加成功"
            })
        elif 'success' in result and not result['success']:
            # 错误响应
            return jsonify(result)
        elif 'data' in result:
            # 如果已经有 data 字段（某些情况下）
            result["success"] = True
            return jsonify(result)

    # 其他情况，假设成功
    return jsonify({
        "success": True,
        "data": result if isinstance(result, dict) else {},
        "message": "人员添加成功"
    })


@person_bp.route('/<int:person_id>', methods=['GET'])
def get_person(person_id):
    """获取人员详情 - 调用 GET /api/persons/{person_id}"""
    result = APIClient._request('GET', f'/api/persons/{person_id}')
    return jsonify(result)


@person_bp.route('/<int:person_id>', methods=['PUT'])
def update_person(person_id):
    """更新人员信息 - 调用 PUT /api/persons/{person_id}"""
    update_data = request.get_json()
    if not update_data:
        return jsonify({"success": False, "error": "更新数据不能为空"})

    # 处理 death_date_accuracy 逻辑
    if 'death_date' in update_data:
        if not update_data['death_date']:
            # 如果清空了逝世日期，也清空精确度
            update_data['death_date_accuracy'] = None
        elif 'death_date_accuracy' not in update_data:
            # 如果设置了逝世日期但没有精确度，设置默认值
            update_data['death_date_accuracy'] = 'exact'

    result = APIClient._request('PUT', f'/api/persons/{person_id}', update_data)
    return jsonify(result)


@person_bp.route('/<int:person_id>', methods=['DELETE'])
def delete_person(person_id):
    """删除人员 - 调用 DELETE /api/persons/{person_id}"""
    result = APIClient._request('DELETE', f'/api/persons/{person_id}')
    return jsonify(result)


@person_bp.route('/search', methods=['GET'])
def search_persons():
    """搜索人员 - 调用组合查询端点"""
    keyword = request.args.get('keyword', '').strip()
    if not keyword:
        return jsonify({"success": False, "error": "搜索关键词不能为空"})

    # 添加分页参数
    skip = request.args.get('skip', 0, type=int)
    limit = request.args.get('limit', 10, type=int)

    params = {
        'keyword': keyword,
        'skip': skip,
        'limit': limit
    }

    # 使用组合查询端点
    result = APIClient._request('GET', '/api/persons/filter/combined', params=params)
    return handle_api_response(result)


@person_bp.route('/filter/gender', methods=['GET'])
def get_persons_by_gender():
    """按性别筛选人员 - 调用组合查询端点"""
    gender = request.args.get('gender', '')
    if gender not in ['M', 'F']:
        return jsonify({"success": False, "error": "性别参数必须是 M 或 F"})

    # 添加分页参数
    skip = request.args.get('skip', 0, type=int)
    limit = request.args.get('limit', 10, type=int)

    params = {
        'gender': gender,
        'skip': skip,
        'limit': limit
    }

    # 使用组合查询端点
    result = APIClient._request('GET', '/api/persons/filter/combined', params=params)
    return handle_api_response(result)


@person_bp.route('/filter/living', methods=['GET'])
def get_living_persons():
    """获取在世人员 - 调用 GET /api/persons/filter/living"""
    # 添加分页参数
    skip = request.args.get('skip', 0, type=int)
    limit = request.args.get('limit', 10, type=int)

    params = {
        'skip': skip,
        'limit': limit
    }

    result = APIClient._request('GET', '/api/persons/filter/living', params=params)

    # 处理响应
    if isinstance(result, dict) and 'data' in result:
        return jsonify({
            "success": True,
            "data": result.get('data', []),
            "total": result.get('total', 0)
        })
    elif isinstance(result, dict) and 'success' in result:
        return jsonify(result)
    else:
        return jsonify({
            "success": True,
            "data": result if isinstance(result, list) else [],
            "total": len(result) if isinstance(result, list) else 0
        })


@person_bp.route('/stats', methods=['GET'])
def get_person_stats():
    """获取人员统计 - 调用 GET /api/persons/stats"""
    result = APIClient._request('GET', '/api/persons/stats')
    return jsonify(result)