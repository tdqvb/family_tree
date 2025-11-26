// static/js/pages/personAdd.js

class PersonAdd {
    constructor() {
        console.log('🔧 初始化 PersonAdd');

        // 初始化日期管理器
        this.birthDateManager = new DateInputManager(
            'birth',
            'birth_date_accuracy',
            {
                exact: 'birth_date_exact',
                year_month: 'birth_date_month',
                year_only: 'birth_date_year'
            }
        );

        this.deathDateManager = new DateInputManager(
            'death',
            'death_date_accuracy',
            {
                exact: 'death_date_exact',
                year_month: 'death_date_month',
                year_only: 'death_date_year'
            }
        );

        // 立即设置逝世日期为非必填（默认在世）
        this.deathDateManager.setDateInputsRequired(false);

        // 使用 body 作为容器，确保消息显示在页面顶部
        this.messageManager = new MessageManager('body', 'person-form-message');

        // 初始化表单提交器
        this.formSubmitter = new FormSubmitter('add-person-form', {
            endpoint: '/api/persons',
            method: 'POST',
            onSuccess: (result) => this.handleSuccess(result),
            onError: (error) => this.handleError(error)
        });

        // 初始化表单验证器 - 只保留非空验证
        this.validator = new FormValidator(this.getValidationRules());

        // 绑定事件监听器
        this.initEventListeners();
        this.toggleDeathInfo();

        console.log('✅ PersonAdd 初始化完成');
    }

    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        console.log('🔧 初始化事件监听器');

        // 是否在世切换事件
        const isLivingSelect = document.getElementById('is_living');
        if (isLivingSelect) {
            isLivingSelect.addEventListener('change', () => {
                this.toggleDeathInfo();
            });
        }

        // 表单提交事件
        const form = document.getElementById('add-person-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // 实时验证 - 只保留非空验证
        this.initRealTimeValidation();
    }

    /**
     * 初始化实时验证 - 只保留非空验证
     */
    initRealTimeValidation() {
        const nameInput = document.getElementById('name');
        const genderSelect = document.getElementById('gender');

        if (nameInput) {
            nameInput.addEventListener('blur', () => {
                if (!nameInput.value.trim()) {
                    this.showFieldError('name', '姓名不能为空');
                } else {
                    this.clearFieldError('name');
                }
            });
        }

        if (genderSelect) {
            genderSelect.addEventListener('change', () => {
                if (!genderSelect.value) {
                    this.showFieldError('gender', '请选择性别');
                } else {
                    this.clearFieldError('gender');
                }
            });
        }
    }

    /**
     * 显示字段错误
     */
    showFieldError(fieldName, errorMessage) {
        this.clearFieldError(fieldName);

        const input = document.getElementById(fieldName);
        if (input) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-red-500 text-sm mt-1 field-error';
            errorDiv.setAttribute('data-field', fieldName);
            errorDiv.textContent = errorMessage;

            input.classList.add('border-red-500');
            input.parentNode.appendChild(errorDiv);
        }
    }

    /**
     * 清除字段错误
     */
    clearFieldError(fieldName) {
        const input = document.getElementById(fieldName);
        if (input) {
            input.classList.remove('border-red-500');
            const existingError = input.parentNode.querySelector(`.field-error[data-field="${fieldName}"]`);
            if (existingError) {
                existingError.remove();
            }
        }
    }

    /**
     * 获取验证规则 - 只保留非空验证
     */
    getValidationRules() {
        return {
            name: {
                minLength: 1,
                minLengthMessage: '姓名不能为空'
            },
            gender: {
                pattern: /^(M|F)$/,
                patternMessage: '请选择性别'
            }
        };
    }

    /**
     * 切换逝世信息显示
     */
    toggleDeathInfo() {
        const isLiving = document.getElementById('is_living').value === 'true';
        const deathInfo = document.getElementById('death_info');

        if (!isLiving) {
            deathInfo.classList.remove('hidden');
            // 设置逝世日期为必填
            this.deathDateManager.setDateInputsRequired(true);
            // 初始化逝世日期格式
            this.deathDateManager.updateDateInputFormat(
                document.getElementById('death_date_accuracy').value
            );
        } else {
            deathInfo.classList.add('hidden');
            // 设置逝世日期为非必填
            this.deathDateManager.setDateInputsRequired(false);
            // 清空逝世日期字段
            this.deathDateManager.reset();
        }
    }

    /**
     * 处理表单提交
     */
    async handleFormSubmit() {
        console.log('📤 开始处理表单提交');

        // 确保所有隐藏字段的必填状态正确
        this.ensureRequiredStates();

        const formData = this.collectFormData();
        console.log('📋 收集的表单数据:', formData);

        // 按照用户填写顺序进行验证 - 只验证必填字段
        if (!this.validateFormStepByStep(formData)) {
            return;
        }

        // 验证日期有效性
        if (!this.validateDateFields()) {
            return;
        }

        // 使用验证器验证其他字段 - 只验证必填字段
        const validation = this.validator.validate(formData);
        if (!validation.isValid) {
            this.showValidationErrors(validation.errors);
            return;
        }

        // 自定义业务逻辑验证
        if (!this.validateBusinessRules(formData)) {
            return;
        }

        // 提交表单
        console.log('🚀 开始提交表单数据');
        await this.formSubmitter.submit(formData);
    }

    /**
     * 验证日期字段
     */
    validateDateFields() {
        // 验证出生日期有效性
        const birthValidation = this.birthDateManager.validateDateValidity();
        if (!birthValidation.isValid) {
            this.messageManager.showError(`出生日期错误: ${birthValidation.message}`);
            this.focusFirstBirthDateField();
            return false;
        }

        // 如果不在世，验证逝世日期有效性
        const isLiving = document.getElementById('is_living').value === 'true';
        if (!isLiving) {
            const deathValidation = this.deathDateManager.validateDateValidity();
            if (!deathValidation.isValid) {
                this.messageManager.showError(`逝世日期错误: ${deathValidation.message}`);
                this.focusFirstDeathDateField();
                return false;
            }
        }

        return true;
    }

    /**
     * 分步骤验证表单 - 只验证必填字段
     */
    validateFormStepByStep(data) {
        // 第一步：验证姓名
        if (!data.name || data.name.trim() === '') {
            this.messageManager.showError('请输入姓名');
            this.focusField('name');
            return false;
        }

        // 第二步：验证性别
        if (!data.gender || (data.gender !== 'M' && data.gender !== 'F')) {
            this.messageManager.showError('请选择性别');
            this.focusField('gender');
            return false;
        }

        // 第三步：验证出生日期
        if (!this.birthDateManager.validateDate()) {
            this.messageManager.showError('请填写完整的出生日期');
            this.focusFirstBirthDateField();
            return false;
        }

        // 第四步：如果不在世，验证逝世日期
        if (!data.is_living) {
            if (!this.deathDateManager.validateDate()) {
                this.messageManager.showError('不在世人员必须填写完整的逝世日期');
                this.focusFirstDeathDateField();
                return false;
            }
        }

        return true;
    }

    /**
     * 聚焦到指定字段
     */
    focusField(fieldName) {
        const field = document.getElementById(fieldName);
        if (field) {
            field.focus();
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * 聚焦到第一个出生日期字段
     */
    focusFirstBirthDateField() {
        const accuracy = document.getElementById('birth_date_accuracy').value;
        let firstField;

        switch (accuracy) {
            case 'exact':
                firstField = document.getElementById('birth_year');
                break;
            case 'year_month':
                firstField = document.getElementById('birth_year_month');
                break;
            case 'year_only':
                firstField = document.getElementById('birth_year_only');
                break;
        }

        if (firstField) {
            firstField.focus();
            firstField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * 聚焦到第一个逝世日期字段
     */
    focusFirstDeathDateField() {
        const accuracy = document.getElementById('death_date_accuracy').value;
        let firstField;

        switch (accuracy) {
            case 'exact':
                firstField = document.getElementById('death_year');
                break;
            case 'year_month':
                firstField = document.getElementById('death_year_month');
                break;
            case 'year_only':
                firstField = document.getElementById('death_year_only');
                break;
        }

        if (firstField) {
            firstField.focus();
            firstField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * 确保必填状态正确
     */
    ensureRequiredStates() {
        const isLiving = document.getElementById('is_living').value === 'true';
        this.deathDateManager.setDateInputsRequired(!isLiving);
    }

    /**
     * 业务规则验证
     */
    validateBusinessRules(data) {
        // 验证逝世日期是否合理（如果填写了）
        if (!data.is_living && data.birth_date && data.death_date) {
            const birthDate = new Date(data.birth_date);
            const deathDate = new Date(data.death_date);
            if (deathDate < birthDate) {
                this.messageManager.showError('逝世日期不能早于出生日期');
                this.focusFirstDeathDateField();
                return false;
            }
        }

        return true;
    }

    /**
     * 显示验证错误
     */
    showValidationErrors(errors) {
        const firstError = Object.values(errors)[0]?.[0];
        if (firstError) {
            this.messageManager.showError(firstError);
        }
    }

    /**
     * 处理成功响应
     */
    handleSuccess(result) {
        console.log('✅ 添加人员成功，开始显示提示:', result);

        // 直接使用收集的表单数据，不需要等待后台返回
        const formData = this.collectFormData();
        console.log('📊 使用表单数据显示提示:', formData);

        // 确保滚动到顶部，让用户看到消息
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 短暂延迟确保滚动完成后再显示消息
        setTimeout(() => {
            this.messageManager.showPersonCreateSuccess(formData);
        }, 300);

        this.resetForm();

        // 刷新人员列表
        if (typeof window.personList !== 'undefined') {
            console.log('🔄 刷新人员列表');
            window.personList.loadPersons();
        }

        console.log('🎉 人员添加流程完成');
    }

    /**
     * 处理错误响应
     */
    handleError(error) {
        console.error('❌ 添加人员失败:', error);
        this.messageManager.showError('添加人员失败: ' + (error.message || '网络错误，请重试'));
    }

    /**
     * 收集表单数据
     */
    collectFormData() {
        const form = document.getElementById('add-person-form');
        const formData = new FormData(form);

        // 使用日期管理器收集日期数据
        const birthDateData = this.birthDateManager.collectDateData(formData);
        const deathDateData = this.deathDateManager.collectDateData(formData);

        // 构建数据对象，并进行数据清理
        const data = {
            name: (formData.get('name') || '').trim(),
            gender: formData.get('gender') || '',
            is_living: formData.get('is_living') === 'true',
            birth_date: birthDateData.date,
            birth_date_type: birthDateData.dateType,
            birth_date_accuracy: birthDateData.accuracy,
            phone: (formData.get('phone') || '').trim() || null,
            email: (formData.get('email') || '').trim() || null,
            birth_place: (formData.get('birth_place') || '').trim() || null,
            biography: (formData.get('biography') || '').trim() || null
        };

        // 处理逝世日期
        if (!data.is_living) {
            data.death_date = deathDateData.date;
            data.death_date_type = deathDateData.dateType;
            data.death_date_accuracy = deathDateData.accuracy;
        } else {
            // 在世人员，确保逝世日期相关字段为 null
            data.death_date = null;
            data.death_date_type = null;
            data.death_date_accuracy = null;
        }

        return data;
    }

    /**
     * 重置表单
     */
    resetForm() {
        console.log('🔄 重置表单');

        const form = document.getElementById('add-person-form');
        if (form) {
            form.reset();
        }

        // 重置日期管理器
        this.birthDateManager.reset();
        this.deathDateManager.reset();

        // 重置逝世信息显示
        this.toggleDeathInfo();

        // 清除所有消息和错误提示
        this.messageManager.clearMessage();
        this.clearAllFieldErrors();

        // 重置提交按钮状态
        const submitButton = form?.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-save mr-2"></i> 保存成员';
            submitButton.classList.remove('opacity-50');
        }
    }

    /**
     * 清除所有字段错误
     */
    clearAllFieldErrors() {
        const errorElements = document.querySelectorAll('.field-error');
        errorElements.forEach(element => element.remove());

        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.classList.remove('border-red-500');
        });
    }

    /**
     * 销毁实例，清理事件监听器
     */
    destroy() {
        // 清理事件监听器
        const isLivingSelect = document.getElementById('is_living');
        const form = document.getElementById('add-person-form');

        if (isLivingSelect) {
            isLivingSelect.replaceWith(isLivingSelect.cloneNode(true));
        }
        if (form) {
            form.replaceWith(form.cloneNode(true));
        }

        // 清理消息
        this.messageManager.clearMessage();
        this.clearAllFieldErrors();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM加载完成，初始化 PersonAdd');

    // 确保表单存在才初始化
    if (document.getElementById('add-person-form')) {
        window.personAdd = new PersonAdd();
        console.log('✅ PersonAdd 页面初始化完成');
    } else {
        console.log('❌ 未找到 add-person-form，跳过 PersonAdd 初始化');
    }
});

// 如果页面被卸载，清理实例
window.addEventListener('beforeunload', function() {
    if (window.personAdd && typeof window.personAdd.destroy === 'function') {
        window.personAdd.destroy();
    }
});