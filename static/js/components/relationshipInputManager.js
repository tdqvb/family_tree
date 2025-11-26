/**
 * 关系表单组件 - 删除sibling关系版本
 * 只负责收集数据，验证交给后端
 */
class RelationshipInputManager {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`容器元素未找到: ${containerId}`);
        }

        this.options = {
            onRelationshipAdd: null,
            ...options
        };

        this.sourcePersonSearch = null;
        this.targetPersonSearch = null;
        this.selectedRelationshipType = '';

        this.init();
    }

    /**
     * 初始化表单
     */
    init() {
        this.render();
        this.initPersonSearch();
        this.bindEvents();
    }

    /**
     * 渲染表单
     */
    render() {
        this.container.innerHTML = `
            <div class="space-y-4">
                <!-- 主体成员 (A) -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        要添加关系的成员(A) <span class="text-red-500">*</span>
                    </label>
                    <div id="sourcePersonSearchContainer"></div>
                </div>

                <!-- 关系类型 -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        关系类型 <span class="text-red-500">*</span>
                    </label>
                    <select id="relationshipTypeSelect"
                            class="relationshipTypeSelect w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500">
                        <option value="">请选择关系类型</option>
                        <option value="parent">父母（添加A为B的父母）</option>
                        <option value="spouse">配偶（添加A为B的配偶）</option>
                        <option value="child">子女（添加A为B的子女）</option>
                    </select>
                </div>

                <!-- 关联成员 (B) -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        关联成员(B) <span class="text-red-500">*</span>
                    </label>
                    <div id="targetPersonSearchContainer"></div>
                </div>

                <!-- 添加按钮 -->
                <button id="addRelationshipBtn"
                        class="addRelationshipBtn w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed">
                    <i class="fas fa-plus mr-2"></i> 添加关系
                </button>
            </div>
        `;

        // 缓存DOM元素
        this.relationshipTypeSelect = this.container.querySelector('#relationshipTypeSelect');
        this.addRelationshipBtn = this.container.querySelector('#addRelationshipBtn');
    }

    /**
     * 初始化人员搜索组件
     */
    initPersonSearch() {
        // 主体成员搜索
        this.sourcePersonSearch = new PersonSearch('sourcePersonSearchContainer', {
            placeholder: '输入成员姓名搜索...',
            onPersonSelect: () => this.updateAddButtonState(),
            onPersonClear: () => this.updateAddButtonState()
        });

        // 目标成员搜索
        this.targetPersonSearch = new PersonSearch('targetPersonSearchContainer', {
            placeholder: '输入成员姓名搜索...',
            onPersonSelect: () => this.updateAddButtonState(),
            onPersonClear: () => this.updateAddButtonState()
        });
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        this.relationshipTypeSelect.addEventListener('change', (e) => {
            this.selectedRelationshipType = e.target.value;
            this.updateAddButtonState();
        });

        this.addRelationshipBtn.addEventListener('click', () => {
            this.handleAddRelationship();
        });
    }

    /**
     * 更新添加按钮状态
     */
    updateAddButtonState() {
        const sourcePerson = this.sourcePersonSearch.getSelectedPerson();
        const targetPerson = this.targetPersonSearch.getSelectedPerson();
        const hasRelationshipType = !!this.selectedRelationshipType;

        const canAdd = sourcePerson && targetPerson && hasRelationshipType;
        this.addRelationshipBtn.disabled = !canAdd;
    }

    /**
     * 处理添加关系
     */
    async handleAddRelationship() {
        const formData = this.getFormData();

        if (!formData) {
            return;
        }

        try {
            // 禁用按钮
            this.addRelationshipBtn.disabled = true;
            this.addRelationshipBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> 添加中...';

            // 回调函数
            if (this.options.onRelationshipAdd) {
                await this.options.onRelationshipAdd(formData);
            }

            // 重置表单
            this.resetForm();

        } catch (error) {
            console.error('添加关系失败:', error);
        } finally {
            // 恢复按钮状态
            this.addRelationshipBtn.disabled = false;
            this.addRelationshipBtn.innerHTML = '<i class="fas fa-plus mr-2"></i> 添加关系';
        }
    }

    /**
     * 获取表单数据
     */
    getFormData() {
    const sourcePerson = this.sourcePersonSearch.getSelectedPerson();
    const targetPerson = this.targetPersonSearch.getSelectedPerson();

    // 简单的前端验证
    if (!sourcePerson || !targetPerson) {
        alert('请选择完整的人员信息');
        return null;
    }

    if (!sourcePerson.id || !targetPerson.id) {
        alert('人员信息不完整，请重新选择');
        return null;
    }

    if (sourcePerson.id === targetPerson.id) {
        alert('不能选择同一个成员建立关系');
        return null;
    }

    if (!this.selectedRelationshipType) {
        alert('请选择关系类型');
        return null;
    }

    // 构建正确的API数据格式
    return {
        from_person_id: sourcePerson.id,  // 注意：使用下划线格式
        to_person_id: targetPerson.id,    // 注意：使用下划线格式
        relationship_type: this.selectedRelationshipType
    };
}

    /**
     * 重置表单
     */
    resetForm() {
        this.sourcePersonSearch.clearSelection();
        this.targetPersonSearch.clearSelection();
        this.relationshipTypeSelect.value = '';
        this.selectedRelationshipType = '';
        this.updateAddButtonState();
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.sourcePersonSearch) {
            this.sourcePersonSearch.destroy();
        }
        if (this.targetPersonSearch) {
            this.targetPersonSearch.destroy();
        }

        this.container.innerHTML = '';
    }
}