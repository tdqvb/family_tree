// static/js/components/dateInputManager.js
class DateInputManager {
    constructor(prefix, accuracySelectId, containers) {
        this.prefix = prefix;
        this.accuracySelectId = accuracySelectId;
        this.containers = containers; // {exact: 'id', year_month: 'id', year_only: 'id'}
        this.init();
    }

    init() {
        this.initAccuracyHandler();
        this.initDateInputLimits();
        // 初始化显示
        const accuracySelect = document.getElementById(this.accuracySelectId);
        if (accuracySelect) {
            this.updateDateInputFormat(accuracySelect.value);
        }
    }

    initAccuracyHandler() {
        const accuracySelect = document.getElementById(this.accuracySelectId);
        if (accuracySelect) {
            accuracySelect.addEventListener('change', () => {
                this.updateDateInputFormat(accuracySelect.value);
            });
        }
    }

    updateDateInputFormat(accuracy) {
        // 隐藏所有日期输入组
        Object.values(this.containers).forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.classList.add('hidden');
                // 清除非活动输入框的值和必填属性
                this.clearDateInputs(containerId);
            }
        });

        // 显示对应的日期输入组
        const activeContainer = document.getElementById(this.containers[accuracy]);
        if (activeContainer) {
            activeContainer.classList.remove('hidden');
            // 设置活动输入框为必填
            this.setContainerInputsRequired(this.containers[accuracy], true);
        }
    }

    /**
     * 设置所有日期输入框的必填状态
     */
    setDateInputsRequired(required) {
        Object.values(this.containers).forEach(containerId => {
            this.setContainerInputsRequired(containerId, required);
        });
    }

    /**
     * 设置特定容器的输入框必填状态
     */
    setContainerInputsRequired(containerId, required) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const inputs = container.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.required = required;
        });

        const selects = container.querySelectorAll('select');
        selects.forEach(select => {
            select.required = required;
        });
    }

    clearDateInputs(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const inputs = container.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.value = '';
            input.required = false;
        });

        const selects = container.querySelectorAll('select');
        selects.forEach(select => {
            select.selectedIndex = 0;
            select.required = false;
        });
    }

    initDateInputLimits() {
        // 为所有日期输入框添加限制
        const dateInputs = document.querySelectorAll('input[type="number"]');
        dateInputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.limitInputValue(input);
            });
            input.addEventListener('change', () => {
                this.limitInputValue(input);
            });
        });
    }

    limitInputValue(input) {
        if (!input.value) return;

        let value = parseInt(input.value);
        if (isNaN(value)) {
            input.value = '';
            return;
        }

        const id = input.id;

        // 年份范围：1900-2100
        if (id.includes('year')) {
            if (value < 1900) {
                input.value = '1900';
            } else if (value > 2100) {
                input.value = '2100';
            }
        }
        // 月份范围：1-12
        else if (id.includes('month')) {
            if (value < 1) {
                input.value = '1';
            } else if (value > 12) {
                input.value = '12';
            }
        }
        // 日期范围：1-31
        else if (id.includes('day')) {
            if (value < 1) {
                input.value = '1';
            } else if (value > 31) {
                input.value = '31';
            }
        }
    }

    /**
     * 验证日期有效性（基础范围验证）
     */
    validateDateValidity() {
        const accuracySelect = document.getElementById(this.accuracySelectId);
        const accuracy = accuracySelect ? accuracySelect.value : 'exact';

        switch(accuracy) {
            case 'exact':
                return this.validateExactDate();
            case 'year_month':
                return this.validateYearMonth();
            case 'year_only':
                return this.validateYearOnly();
            default:
                return { isValid: true };
        }
    }

    /**
     * 验证精确到日的日期
     */
    validateExactDate() {
        const yearInput = document.getElementById(`${this.prefix}_year`);
        const monthInput = document.getElementById(`${this.prefix}_month`);
        const dayInput = document.getElementById(`${this.prefix}_day`);

        if (!yearInput || !monthInput || !dayInput) {
            return { isValid: false, message: '日期输入框未找到' };
        }

        const year = yearInput.value ? parseInt(yearInput.value) : null;
        const month = monthInput.value ? parseInt(monthInput.value) : null;
        const day = dayInput.value ? parseInt(dayInput.value) : null;

        // 基本范围验证
        if (year !== null && (year < 1900 || year > 2100)) {
            return { isValid: false, message: '年份必须在1900-2100之间' };
        }

        if (month !== null && (month < 1 || month > 12)) {
            return { isValid: false, message: '月份必须在1-12之间' };
        }

        if (day !== null && (day < 1 || day > 31)) {
            return { isValid: false, message: '日期必须在1-31之间' };
        }

        return { isValid: true };
    }

    /**
     * 验证精确到年月的日期
     */
    validateYearMonth() {
        const yearInput = document.getElementById(`${this.prefix}_year_month`);
        const monthInput = document.getElementById(`${this.prefix}_month_only`);

        if (!yearInput || !monthInput) {
            return { isValid: false, message: '日期输入框未找到' };
        }

        const year = yearInput.value ? parseInt(yearInput.value) : null;
        const month = monthInput.value ? parseInt(monthInput.value) : null;

        if (year !== null && (year < 1900 || year > 2100)) {
            return { isValid: false, message: '年份必须在1900-2100之间' };
        }

        if (month !== null && (month < 1 || month > 12)) {
            return { isValid: false, message: '月份必须在1-12之间' };
        }

        return { isValid: true };
    }

    /**
     * 验证精确到年的日期
     */
    validateYearOnly() {
        const yearInput = document.getElementById(`${this.prefix}_year_only`);

        if (!yearInput) {
            return { isValid: false, message: '年份输入框未找到' };
        }

        const year = yearInput.value ? parseInt(yearInput.value) : null;

        if (year !== null && (year < 1900 || year > 2100)) {
            return { isValid: false, message: '年份必须在1900-2100之间' };
        }

        return { isValid: true };
    }

    collectDateData(formData) {
        const accuracy = formData.get(`${this.prefix}_date_accuracy`) || 'exact';

        return {
            date: this.buildDate(formData, accuracy),
            dateType: this.getDateType(formData, accuracy),
            accuracy: accuracy
        };
    }

    buildDate(formData, accuracy) {
        switch(accuracy) {
            case 'exact':
                const year = formData.get(`${this.prefix}_year`);
                const month = formData.get(`${this.prefix}_month`);
                const day = formData.get(`${this.prefix}_day`);
                if (year && month && day) {
                    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
                break;

            case 'year_month':
                const yearMonth = formData.get(`${this.prefix}_year_month`);
                const monthOnly = formData.get(`${this.prefix}_month_only`);
                if (yearMonth && monthOnly) {
                    return `${yearMonth}-${monthOnly.padStart(2, '0')}-01`;
                }
                break;

            case 'year_only':
                const yearOnly = formData.get(`${this.prefix}_year_only`);
                if (yearOnly) {
                    return `${yearOnly}-01-01`;
                }
                break;
        }
        return null;
    }

    getDateType(formData, accuracy) {
        switch(accuracy) {
            case 'exact':
                return formData.get(`${this.prefix}_date_type`);
            case 'year_month':
                return formData.get(`${this.prefix}_date_type_month`);
            case 'year_only':
                return formData.get(`${this.prefix}_date_type_year`);
            default:
                return 'solar';
        }
    }

    validateDate() {
        const accuracySelect = document.getElementById(this.accuracySelectId);
        const accuracy = accuracySelect ? accuracySelect.value : 'exact';
        const activeContainer = document.getElementById(this.containers[accuracy]);

        if (!activeContainer) return false;

        // 检查必填字段是否已填写
        const inputs = activeContainer.querySelectorAll('input[type="number"][required]');
        for (let input of inputs) {
            if (!input.value) return false;
        }

        const selects = activeContainer.querySelectorAll('select[required]');
        for (let select of selects) {
            if (!select.value) return false;
        }

        return true;
    }

    reset() {
        // 清空所有日期输入框
        Object.values(this.containers).forEach(containerId => {
            this.clearDateInputs(containerId);
        });

        // 重置精确度选择
        const accuracySelect = document.getElementById(this.accuracySelectId);
        if (accuracySelect) {
            accuracySelect.value = 'exact';
            this.updateDateInputFormat('exact');
        }
    }
}

// 全局导出
window.DateInputManager = DateInputManager;