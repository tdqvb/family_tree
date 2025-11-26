// static/js/pages/personEdit.js
class PersonEdit {
    constructor() {
        this.currentPerson = null;
        this.originalData = null;
        this.birthDateManager = null;
        this.deathDateManager = null;
        this.messageManager = null;
        this.init();
    }

    init() {
        this.initializeManagers();
        this.bindEvents();
    }

    initializeManagers() {
        // 初始化消息管理器
        this.messageManager = new MessageManager('#edit-message-container', 'edit-message');
    }

    initializeDateManagers() {
        console.log('📅 初始化编辑表单日期管理器');
        try {
            // 每次都重新初始化
            this.birthDateManager = new DateInputManager({
                containerId: 'birth_date_container',
                accuracySelectId: 'birth_date_accuracy',
                type: 'birth'
            });

            this.deathDateManager = new DateInputManager({
                containerId: 'death_date_container',
                accuracySelectId: 'death_date_accuracy',
                type: 'death'
            });
        } catch (error) {
            console.error('❌ 初始化日期管理器失败:', error);
        }
    }

    bindEvents() {
        // 关闭按钮事件
        document.getElementById('edit-modal-close')?.addEventListener('click', () => {
            this.handleCloseRequest();
        });

        // 取消按钮事件
        document.getElementById('edit-cancel-btn')?.addEventListener('click', () => {
            this.handleCloseRequest();
        });

        // 保存按钮事件
        document.getElementById('edit-save-btn')?.addEventListener('click', () => {
            this.savePersonEdit();
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                this.handleCloseRequest();
            }
        });

        // 背景点击关闭
        document.addEventListener('click', (e) => {
            if (e.target.id === 'edit-person-modal') {
                this.handleCloseRequest();
            }
        });

        // 是否在世字段变化
        document.addEventListener('change', (e) => {
            if (e.target.name === 'is_living' && e.target.closest('#edit-person-form')) {
                this.toggleDeathInfo(e.target.value === 'false');
            }
        });
    }

    async editPerson(personId) {
        if (this.currentPerson && this.currentPerson.id === personId) {
            this.openModal();
            return;
        }

        await this.showEditForm(personId);
    }

    async showEditForm(personId) {
        try {
            DomUtils.showLoading('edit-person-form-container', true, '加载编辑表单中...');

            const person = await ApiService.getPerson(personId);

            this.currentPerson = person;
            this.originalData = { ...this.currentPerson };
            this.renderEditForm(this.currentPerson);
            this.openModal();

        } catch (error) {
            console.error('获取人员信息错误:', error);
            this.showMessage('获取人员信息失败: ' + error.message, 'error');
        } finally {
            DomUtils.showLoading('edit-person-form-container', false);
        }
    }

    renderEditForm(person) {
    const container = document.getElementById('edit-person-form-container');
    if (!container) return;

    // 解析日期数据
    const birthDateData = DateUtils.parseDateData(
        person.birth_date,
        person.birth_date_accuracy,
        person.birth_date_type
    );
    const deathDateData = DateUtils.parseDateData(
        person.death_date,
        person.death_date_accuracy,
        person.death_date_type
    );

    const showDeathInfo = person.is_living === false;

    container.innerHTML = `
        <form id="edit-person-form" class="space-y-6">
            <!-- 基本信息 -->
            <div class="mb-4">
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">姓名 <span class="text-red-500">*</span></label>
                <input type="text" id="name" name="name" value="${DomUtils.escapeHtml(person.name || '')}" required
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="gender" class="block text-sm font-medium text-gray-700 mb-1">性别 <span class="text-red-500">*</span></label>
                    <select id="gender" name="gender" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                        <option value="">请选择</option>
                        <option value="M" ${person.gender === 'M' ? 'selected' : ''}>男</option>
                        <option value="F" ${person.gender === 'F' ? 'selected' : ''}>女</option>
                    </select>
                </div>

                <div>
                    <label for="is_living" class="block text-sm font-medium text-gray-700 mb-1">是否在世</label>
                    <select id="is_living" name="is_living"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                        <option value="true" ${person.is_living !== false ? 'selected' : ''}>是</option>
                        <option value="false" ${person.is_living === false ? 'selected' : ''}>否</option>
                    </select>
                </div>
            </div>

            <!-- 出生日期信息 -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">出生日期 <span class="text-red-500">*</span></label>
                <div class="mb-2">
                    <select id="birth_date_accuracy" name="birth_date_accuracy" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                        <option value="exact" ${person.birth_date_accuracy === 'exact' ? 'selected' : ''}>精确到日</option>
                        <option value="year_month" ${person.birth_date_accuracy === 'year_month' ? 'selected' : ''}>精确到月</option>
                        <option value="year_only" ${person.birth_date_accuracy === 'year_only' ? 'selected' : ''}>精确到年</option>
                    </select>
                </div>
                <div id="birth_date_container">
                    ${DateUtils.renderDateInputs('birth', birthDateData)}
                </div>
            </div>

            <!-- 逝世信息 -->
            <div id="death_info" class="mb-4 ${showDeathInfo ? '' : 'hidden'}">
                <label class="block text-sm font-medium text-gray-700 mb-1">逝世日期 <span class="text-red-500">*</span></label>
                <div class="mb-2">
                    <select id="death_date_accuracy" name="death_date_accuracy" ${showDeathInfo ? 'required' : ''}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                        <option value="exact" ${person.death_date_accuracy === 'exact' ? 'selected' : ''}>精确到日</option>
                        <option value="year_month" ${person.death_date_accuracy === 'year_month' ? 'selected' : ''}>精确到月</option>
                        <option value="year_only" ${person.death_date_accuracy === 'year_only' ? 'selected' : ''}>精确到年</option>
                    </select>
                </div>
                <div id="death_date_container">
                    ${DateUtils.renderDateInputs('death', deathDateData, showDeathInfo)}
                </div>
            </div>

            <!-- 扩展信息 -->
            <div class="mb-4">
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">电话</label>
                <input type="text" id="phone" name="phone" value="${DomUtils.escapeHtml(person.phone || '')}"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
            </div>

            <div class="mb-4">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input type="email" id="email" name="email" value="${DomUtils.escapeHtml(person.email || '')}"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
            </div>

            <div class="mb-4">
                <label for="birth_place" class="block text-sm font-medium text-gray-700 mb-1">出生地</label>
                <input type="text" id="birth_place" name="birth_place" value="${DomUtils.escapeHtml(person.birth_place || '')}"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
            </div>

            <div class="mb-6">
                <label for="biography" class="block text-sm font-medium text-gray-700 mb-1">生平简介</label>
                <textarea id="biography" name="biography" rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">${DomUtils.escapeHtml(person.biography || '')}</textarea>
            </div>
        </form>
    `;

    // 初始化日期管理器（使用无前缀的ID）
    this.initializeDateManagers();
    this.updateSaveButtonState();
    this.bindFormEvents();
}

    bindFormEvents() {
    const form = document.getElementById('edit-person-form');
    if (!form) return;

    // 使用无前缀的ID
    const isLivingSelect = document.getElementById('is_living');
    if (isLivingSelect) {
        isLivingSelect.addEventListener('change', (e) => {
            this.toggleDeathInfo(e.target.value === 'false');
        });
    }

    // 实时验证
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => this.updateSaveButtonState());
        input.addEventListener('change', () => this.updateSaveButtonState());
    });

    // 保存按钮
    const saveBtn = document.getElementById('edit-save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => this.savePersonEdit());
    }
}

    async savePersonEdit() {
        if (!this.currentPerson) return;

        if (!this.validateForm()) {
            return;
        }

        try {
            const formData = this.collectFormData();
            console.log('提交的数据:', formData);

            await this.submitForm(formData);

        } catch (error) {
            console.error('更新人员错误:', error);
            this.showMessage('更新失败: ' + error.message, 'error');
        }
    }

    validateForm() {
        const formData = this.collectFormData();
        const validation = SimpleValidator.validatePerson(formData);

        const dateErrors = this.validateDateFields(formData);
        if (dateErrors.length > 0) {
            validation.isValid = false;
            validation.errors.dates = dateErrors;
        }

        if (!validation.isValid) {
            this.handleValidationError(validation.errors);
        }

        return validation.isValid;
    }

    validateDateFields(formData) {
        const errors = [];

        if (!this.birthDateManager.validateDate()) {
            errors.push('请填写完整的出生日期信息');
        }

        // 只有当人员不在世时才验证死亡日期
        if (formData.is_living === false) {
            if (!this.deathDateManager.validateDate()) {
                errors.push('请填写完整的逝世日期信息');
            }
        } else {
            // 如果在世，清空死亡日期相关字段
            this.deathDateManager.clearDate();
        }

        return errors;
    }

    async submitForm(formData) {
        this.showLoading(true);

        try {
            const result = await ApiService.updatePerson(this.currentPerson.id, formData);
            this.handleSaveSuccess(result);

        } catch (error) {
            this.handleSaveError(error);
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const saveButton = document.getElementById('edit-save-btn');
        if (saveButton) {
            if (show) {
                saveButton.disabled = true;
                saveButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> 保存中...';
                saveButton.classList.add('opacity-50');
            } else {
                saveButton.disabled = false;
                saveButton.innerHTML = '<i class="fas fa-save mr-2"></i> 保存';
                saveButton.classList.remove('opacity-50');
            }
        }
    }

    collectFormData() {
        const form = document.getElementById('edit-person-form');
        const isLiving = form.querySelector('#is_living')?.value === 'true'; // 去掉 edit- 前缀

        return FormUtils.collectPersonData(form, isLiving);
    }

    // 修复 toggleDeathInfo 方法
    toggleDeathInfo(show) {
        const deathInfo = document.getElementById('death_info');
        const deathAccuracy = document.getElementById('death_date_accuracy');

        if (deathInfo) deathInfo.classList.toggle('hidden', !show);
        if (deathAccuracy) deathAccuracy.required = show;
    }

    handleValidationError(errors) {
        let errorMessages = [];

        Object.values(errors).forEach(errorList => {
            if (Array.isArray(errorList)) {
                errorMessages = errorMessages.concat(errorList);
            }
        });

        this.messageManager.showError(`
            <div class="font-medium">请修正以下错误：</div>
            <ul class="mt-1 list-disc list-inside">
                ${errorMessages.map(error => `<li>${error}</li>`).join('')}
            </ul>
        `, false);
    }

    handleSaveSuccess(result) {
        this.showMessage('人员信息更新成功！', 'success');
        this.closeModal();

        if (window.personList && typeof window.personList.loadPersons === 'function') {
            window.personList.loadPersons();
        }
    }

    handleSaveError(error) {
        this.showMessage('更新失败: ' + error.message, 'error');
    }

    hasChanges() {
        const form = document.getElementById('edit-person-form');
        return FormUtils.hasFormChanges(this.originalData, form);
    }

    updateSaveButtonState() {
        DomUtils.updateSaveButtonState('edit-save-btn', this.hasChanges());
    }

    handleCloseRequest() {
        if (this.hasChanges()) {
            if (confirm('您有未保存的更改，确定要关闭吗？')) {
                this.closeModal();
            }
        } else {
            this.closeModal();
        }
    }

    openModal() {
        const modal = document.getElementById('edit-person-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        const modal = document.getElementById('edit-person-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
        this.currentPerson = null;
        this.originalData = null;
        this.birthDateManager = null;
        this.deathDateManager = null;
        this.messageManager.clearMessage();
    }

    showMessage(message, type = 'info') {
        if (type === 'success') {
            this.messageManager.showSuccess(message);
        } else if (type === 'error') {
            this.messageManager.showError(message);
        } else {
            this.messageManager.showInfo(message);
        }
    }

    isModalOpen() {
        const modal = document.getElementById('edit-person-modal');
        return modal && !modal.classList.contains('hidden');
    }
}

// 全局实例
let personEdit = null;

document.addEventListener('DOMContentLoaded', function() {
    personEdit = new PersonEdit();
    window.personEdit = personEdit;
    console.log('✅ personEdit 初始化完成');
});