// static/js/personEdit.js

class PersonEdit {
    constructor() {
        this.currentPerson = null;
        this.originalData = null;
        this.birthDateManager = null;
        this.deathDateManager = null;
        this.messageManager = null;
        this.formValidator = null;
        this.formSubmitter = null;
        this.init();
    }

    init() {
        this.initializeManagers();
        this.bindEvents();
    }

    initializeManagers() {
        // 初始化消息管理器
        this.messageManager = new MessageManager('#edit-message-container', 'edit-message');

        // 初始化表单验证器
        this.formValidator = new FormValidator({
            name: FormValidator.commonRules.required('姓名是必填字段'),
            gender: FormValidator.commonRules.required('请选择性别'),
            phone: {
                validator: (value) => {
                    if (value && !/^1[3-9]\d{9}$/.test(value)) {
                        return '手机号格式不正确';
                    }
                    return null;
                }
            },
            email: {
                validator: (value) => {
                    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        return '邮箱格式不正确';
                    }
                    return null;
                }
            }
        });

        // 初始化表单提交器
        this.formSubmitter = new FormSubmitter('edit-person-form', {
            method: 'PUT',
            onSuccess: (result) => this.handleSaveSuccess(result),
            onError: (error) => this.handleSaveError(error),
            onValidationError: (errors) => this.handleValidationError(errors)
        });
    }

    initializeDateManagers() {
        // 初始化出生日期管理器
        this.birthDateManager = new DateInputManager('birth', 'edit-birth_date_accuracy', {
            exact: 'edit-birth_date_exact',
            year_month: 'edit-birth_date_month',
            year_only: 'edit-birth_date_year'
        });

        // 初始化逝世日期管理器
        this.deathDateManager = new DateInputManager('death', 'edit-death_date_accuracy', {
            exact: 'edit-death_date_exact',
            year_month: 'edit-death_date_month',
            year_only: 'edit-death_date_year'
        });
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
            DomHelper.showLoading('edit-person-form-container', true, '加载编辑表单中...');

            const person = await PersonApi.getPerson(personId);

            this.currentPerson = person;
            this.originalData = { ...this.currentPerson };
            this.renderEditForm(this.currentPerson);
            this.openModal();

        } catch (error) {
            console.error('获取人员信息错误:', error);
            this.showMessage('获取人员信息失败: ' + error.message, 'error');
        } finally {
            DomHelper.showLoading('edit-person-form-container', false);
        }
    }

    renderEditForm(person) {
        const container = document.getElementById('edit-person-form-container');
        if (!container) return;

        // 解析日期数据
        const birthDateData = DateDataParser.parseDateData(
            person.birth_date,
            person.birth_date_accuracy,
            person.birth_date_type
        );
        const deathDateData = DateDataParser.parseDateData(
            person.death_date,
            person.death_date_accuracy,
            person.death_date_type
        );

        const showDeathInfo = person.is_living === false;

        container.innerHTML = `
            <form id="edit-person-form" class="space-y-6">
                <!-- 基本信息 -->
                <div class="mb-4">
                    <label for="edit-name" class="block text-sm font-medium text-gray-700 mb-1">姓名 <span class="text-red-500">*</span></label>
                    <input type="text" id="edit-name" name="name" value="${DomHelper.escapeHtml(person.name || '')}" required
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="edit-gender" class="block text-sm font-medium text-gray-700 mb-1">性别 <span class="text-red-500">*</span></label>
                        <select id="edit-gender" name="gender" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                            <option value="">请选择</option>
                            <option value="M" ${person.gender === 'M' ? 'selected' : ''}>男</option>
                            <option value="F" ${person.gender === 'F' ? 'selected' : ''}>女</option>
                        </select>
                    </div>

                    <div>
                        <label for="edit-is_living" class="block text-sm font-medium text-gray-700 mb-1">是否在世</label>
                        <select id="edit-is_living" name="is_living"
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
                        <select id="edit-birth_date_accuracy" name="birth_date_accuracy" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                            <option value="exact" ${person.birth_date_accuracy === 'exact' ? 'selected' : ''}>精确到日</option>
                            <option value="year_month" ${person.birth_date_accuracy === 'year_month' ? 'selected' : ''}>精确到月</option>
                            <option value="year_only" ${person.birth_date_accuracy === 'year_only' ? 'selected' : ''}>精确到年</option>
                        </select>
                    </div>
                    <div id="edit-birth_date_container">
                        ${DateInputRenderer.renderDateInputs('birth', birthDateData)}
                    </div>
                </div>

                <!-- 逝世信息 -->
                <div id="edit-death_info" class="mb-4 ${showDeathInfo ? '' : 'hidden'}">
                    <label class="block text-sm font-medium text-gray-700 mb-1">逝世日期 <span class="text-red-500">*</span></label>
                    <div class="mb-2">
                        <select id="edit-death_date_accuracy" name="death_date_accuracy" ${showDeathInfo ? 'required' : ''}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                            <option value="exact" ${person.death_date_accuracy === 'exact' ? 'selected' : ''}>精确到日</option>
                            <option value="year_month" ${person.death_date_accuracy === 'year_month' ? 'selected' : ''}>精确到月</option>
                            <option value="year_only" ${person.death_date_accuracy === 'year_only' ? 'selected' : ''}>精确到年</option>
                        </select>
                    </div>
                    <div id="edit-death_date_container">
                        ${DateInputRenderer.renderDateInputs('death', deathDateData, showDeathInfo)}
                    </div>
                </div>

                <!-- 扩展信息 -->
                <div class="mb-4">
                    <label for="edit-phone" class="block text-sm font-medium text-gray-700 mb-1">电话</label>
                    <input type="text" id="edit-phone" name="phone" value="${DomHelper.escapeHtml(person.phone || '')}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                </div>

                <div class="mb-4">
                    <label for="edit-email" class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                    <input type="email" id="edit-email" name="email" value="${DomHelper.escapeHtml(person.email || '')}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                </div>

                <div class="mb-4">
                    <label for="edit-birth_place" class="block text-sm font-medium text-gray-700 mb-1">出生地</label>
                    <input type="text" id="edit-birth_place" name="birth_place" value="${DomHelper.escapeHtml(person.birth_place || '')}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                </div>

                <div class="mb-6">
                    <label for="edit-biography" class="block text-sm font-medium text-gray-700 mb-1">生平简介</label>
                    <textarea id="edit-biography" name="biography" rows="3"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">${DomHelper.escapeHtml(person.biography || '')}</textarea>
                </div>
            </form>
        `;

        // 初始化日期管理器
        this.initializeDateManagers();
        this.updateSaveButtonState();
        this.bindFormEvents();
    }

    bindFormEvents() {
        const form = document.getElementById('edit-person-form');
        if (!form) return;

        form.addEventListener('input', () => {
            this.updateSaveButtonState();
        });
    }

    toggleDeathInfo(show) {
        DomHelper.showElement('edit-death_info', show);
        DomHelper.setElementRequired('edit-death_date_accuracy', show);
    }

    async savePersonEdit() {
        if (!this.currentPerson) return;

        if (!this.validateForm()) {
            return;
        }

        try {
            const formData = this.collectFormData();
            console.log('提交的数据:', formData);

            this.formSubmitter.setOptions({
                endpoint: `/api/persons/${this.currentPerson.id}`
            });

            const result = await this.formSubmitter.submit(formData, (data) => this.validateFormData(data));

            if (result.success) {
                this.handleSaveSuccess(result.data);
            }

        } catch (error) {
            console.error('更新人员错误:', error);
            this.showMessage('更新失败: ' + error.message, 'error');
        }
    }

    validateForm() {
        const formData = this.collectFormData();
        const validation = this.formValidator.validate(formData);

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

    validateFormData(data) {
        return this.formValidator.validate(data);
    }

    validateDateFields(formData) {
        const errors = [];

        if (!this.birthDateManager.validateDate()) {
            errors.push('请填写完整的出生日期信息');
        }

        if (formData.is_living === false && !this.deathDateManager.validateDate()) {
            errors.push('请填写完整的逝世日期信息');
        }

        return errors;
    }

    collectFormData() {
        const form = document.getElementById('edit-person-form');
        const isLiving = form.querySelector('#edit-is_living')?.value === 'true';

        return FormDataCollector.collectPersonAddData(form, isLiving);
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
        return FormDataCollector.hasFormChanges(this.originalData, form);
    }

    updateSaveButtonState() {
        DomHelper.updateSaveButtonState('edit-save-btn', this.hasChanges());
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
        this.messageManager.clearMessage();
    }

    showMessage(message, type = 'info') {
        this.messageManager[`show${type.charAt(0).toUpperCase() + type.slice(1)}`](message);
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
    console.log('✅ personEdit 重构版本初始化完成 - 使用模块化架构');
});