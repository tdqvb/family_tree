// static/js/formValidator.js

class FormValidator {
    constructor(rules = {}) {
        this.rules = rules;
        this.errors = {};
    }

    setRules(rules) {
        this.rules = rules;
    }

    addRule(field, rule) {
        this.rules[field] = rule;
    }

    validate(data) {
        this.errors = {};

        for (const [field, rule] of Object.entries(this.rules)) {
            const value = data[field];
            const fieldErrors = [];

            // 必填验证
            if (rule.required && (!value && value !== 0)) {
                fieldErrors.push(rule.requiredMessage || `${field} 是必填字段`);
                continue;
            }

            // 如果字段为空且不是必填，跳过其他验证
            if (!value && !rule.required) {
                continue;
            }

            // 最小长度验证
            if (rule.minLength && value.length < rule.minLength) {
                fieldErrors.push(rule.minLengthMessage || `${field} 长度不能少于 ${rule.minLength} 个字符`);
            }

            // 最大长度验证
            if (rule.maxLength && value.length > rule.maxLength) {
                fieldErrors.push(rule.maxLengthMessage || `${field} 长度不能超过 ${rule.maxLength} 个字符`);
            }

            // 正则表达式验证
            if (rule.pattern && !rule.pattern.test(value)) {
                fieldErrors.push(rule.patternMessage || `${field} 格式不正确`);
            }

            // 自定义验证函数
            if (rule.validator && typeof rule.validator === 'function') {
                const customError = rule.validator(value, data);
                if (customError) {
                    fieldErrors.push(customError);
                }
            }

            if (fieldErrors.length > 0) {
                this.errors[field] = fieldErrors;
            }
        }

        return {
            isValid: Object.keys(this.errors).length === 0,
            errors: this.errors
        };
    }

    getErrors() {
        return this.errors;
    }

    clearErrors() {
        this.errors = {};
    }

    // 常用验证规则预设
    static get commonRules() {
        return {
            required: (message) => ({ required: true, requiredMessage: message }),
            minLength: (length, message) => ({ minLength: length, minLengthMessage: message }),
            maxLength: (length, message) => ({ maxLength: length, maxLengthMessage: message }),
            email: (message) => ({
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                patternMessage: message || '邮箱格式不正确'
            }),
            phone: (message) => ({
                pattern: /^1[3-9]\d{9}$/,
                patternMessage: message || '手机号格式不正确'
            })
        };
    }
}