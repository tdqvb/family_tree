/**
 * 关系页面主控制器 - 修复错误处理版本
 */
class RelationshipAdd {
    constructor() {
        this.relationshipInputManager = null;
        this.init();
    }

    /**
     * 初始化页面
     */
    init() {
        console.log('🔧 初始化人员关系页面 - 修复错误处理版本');
        this.initializeComponents();
    }

    /**
     * 初始化组件
     */
    initializeComponents() {
        // 只初始化关系表单，移除复杂的关系列表和自动推导
        if (document.getElementById('relationshipInputManagerContainer')) {
            this.relationshipInputManager = new RelationshipInputManager('relationshipInputManagerContainer', {
                onRelationshipAdd: (formData) => this.handleAddRelationship(formData)
            });
        }

        // 简化界面：隐藏复杂的关系列表容器
        const listContainer = document.getElementById('relationshipsListContainer');
        if (listContainer) {
            listContainer.style.display = 'none';
        }
    }

    /**
     * 处理添加关系 - 显示所有创建的关系
     */
    async handleAddRelationship(formData) {
        try {
            console.log('🔄 添加关系 - 表单数据:', formData);

            // 基础验证
            if (!formData) {
                throw new Error('表单数据为空');
            }

            if (!formData.from_person_id || !formData.to_person_id || !formData.relationship_type) {
                throw new Error('请完整填写关系信息');
            }

            if (formData.from_person_id === formData.to_person_id) {
                throw new Error('不能选择同一个成员建立关系');
            }

            console.log('📤 发送API请求:', formData);

            // 调用后端API
            const result = await window.RelationshipApi.createRelationship(formData);

            console.log('✅ 关系创建成功:', result);
            console.log('📊 消息列表:', result.creation_messages);
            console.log('🔢 总计关系数:', result.total_created);

            // 显示所有创建的关系信息
            this.showCreationMessages(result.creation_messages, result.total_created);

            // 重置表单
            if (this.relationshipInputManager) {
                this.relationshipInputManager.resetForm();
            }

        } catch (error) {
            console.error('❌ 添加关系失败:', error);
            this.showMessage(`添加失败: ${error.message}`, 'error');
        }
    }

    /**
     * 显示所有创建的关系消息
     */
    showCreationMessages(messages, totalCount) {
        // 创建消息弹窗
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-hidden">
                <div class="bg-green-600 text-white p-4 rounded-t-lg">
                    <h3 class="text-lg font-semibold flex items-center">
                        <i class="fas fa-check-circle mr-2"></i>
                        关系创建成功
                    </h3>
                    <p class="text-sm opacity-90 mt-1">共创建了 ${totalCount} 个关系</p>
                </div>
                <div class="p-4 max-h-64 overflow-y-auto">
                    <div class="space-y-3">
                        ${this.formatCreationMessages(messages)}
                    </div>
                </div>
                <div class="border-t border-gray-200 p-4 flex justify-end">
                    <button onclick="this.closest('.fixed').remove()"
                            class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-medium">
                        确定
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * 格式化创建消息
     */
    formatCreationMessages(messages) {
        let formattedHTML = '';
        let currentSection = '';

        messages.forEach(message => {
            if (message.startsWith('【')) {
                // 这是分类标题
                if (currentSection) {
                    formattedHTML += `</div>`;
                }
                currentSection = message.replace('【', '').replace('】', '');
                formattedHTML += `
                    <div class="mb-2">
                        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            ${currentSection}
                        </div>
                `;
            } else {
                // 这是具体的关系消息
                formattedHTML += `
                    <div class="flex items-start text-sm p-2 bg-green-50 rounded border border-green-200">
                        <i class="fas fa-link text-green-600 mt-0.5 mr-2 text-xs"></i>
                        <span class="text-green-800">${message}</span>
                    </div>
                `;
            }
        });

        if (currentSection) {
            formattedHTML += `</div>`;
        }

        return formattedHTML;
    }

    /**
     * 显示简单消息
     */
    showMessage(message, type = 'info') {
        // 使用简单的alert提示
        alert(`${type === 'error' ? '错误' : '成功'}: ${message}`);
    }

    /**
     * 销毁页面
     */
    destroy() {
        if (this.relationshipInputManager) {
            this.relationshipInputManager.destroy();
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM加载完成，初始化修复错误处理版关系页面');
    try {
        window.relationshipAdd = new RelationshipAdd();
        console.log('✅ 修复错误处理版关系页面初始化成功');
    } catch (error) {
        console.error('❌ 关系页面初始化失败:', error);
    }
});