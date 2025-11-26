/**
 * 关系API服务 - 修复错误处理
 */
class RelationshipApi {
    constructor() {
        this.baseURL = '/api/relationships';
    }

    /**
     * 创建单个关系
     */
    async createRelationship(relationshipData) {
        try {
            console.log('📤 发送API请求:', relationshipData);

            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(relationshipData)
            });

            console.log('📥 API响应状态:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ API错误详情:', errorData);
                throw new Error(errorData.detail || `API请求失败: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ API返回结果:', result);
            return result;
        } catch (error) {
            console.error('创建关系失败:', error);
            throw error;
        }
    }

    /**
     * 删除关系
     */
    async deleteRelationship(relId) {
        try {
            const response = await fetch(`${this.baseURL}/${relId}`, {
                method: 'DELETE'
            });

            if (!response.ok && response.status !== 204) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `删除失败: ${response.status}`);
            }

            return { success: true };
        } catch (error) {
            console.error('删除关系失败:', error);
            throw error;
        }
    }
}

// 创建单例实例
window.RelationshipApi = new RelationshipApi();