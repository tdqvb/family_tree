// static/js/api/personApi.js
class PersonApi {
  static async getPersons(params = {}) {
    const queryParams = new URLSearchParams();

    // 添加查询参数
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.gender) queryParams.append('gender', params.gender);
    if (params.skip !== undefined) queryParams.append('skip', params.skip);
    if (params.limit !== undefined) queryParams.append('limit', params.limit);

    const response = await fetch(`/api/persons?${queryParams.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '加载人员列表失败');
    }

    return await response.json();
  }

  static async deletePerson(personId) {
    const response = await fetch(`/api/persons/${personId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '删除失败');
    }

    return await response.json();
  }

  static async getPerson(personId) {
    const response = await fetch(`/api/persons/${personId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '获取人员详情失败');
    }

    return await response.json();
  }
}