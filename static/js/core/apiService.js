// static/js/core/apiService.js
class ApiService {
    static async request(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || '请求失败');
            }

            return await response.json();
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    }

    // 人员相关API
    static async getPersons(params = {}) {
        const queryParams = new URLSearchParams();

        if (params.keyword) queryParams.append('keyword', params.keyword);
        if (params.gender) queryParams.append('gender', params.gender);
        if (params.skip !== undefined) queryParams.append('skip', params.skip);
        if (params.limit !== undefined) queryParams.append('limit', params.limit);

        return this.request(`/api/persons?${queryParams.toString()}`);
    }

    static async getPerson(personId) {
        return this.request(`/api/persons/${personId}`);
    }

    static async createPerson(data) {
        return this.request('/api/persons', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async updatePerson(personId, data) {
        return this.request(`/api/persons/${personId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deletePerson(personId) {
        return this.request(`/api/persons/${personId}`, {
            method: 'DELETE'
        });
    }

    static async searchPersons(keyword) {
        return this.request(`/api/persons/search?keyword=${encodeURIComponent(keyword)}`);
    }

    // 关系相关API
    static async createRelationship(data) {
        return this.request('/api/relationships', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async deleteRelationship(relId) {
        return this.request(`/api/relationships/${relId}`, {
            method: 'DELETE'
        });
    }
}

// 全局导出
window.ApiService = ApiService;