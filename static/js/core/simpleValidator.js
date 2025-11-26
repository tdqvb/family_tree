// static/js/core/simpleValidator.js
class SimpleValidator {
    static validatePerson(data) {
        const errors = [];

        // 基础非空验证
        if (!data.name?.trim()) {
            errors.push('姓名不能为空');
        }

        if (!data.gender) {
            errors.push('请选择性别');
        }

        if (!data.birth_date) {
            errors.push('请填写出生日期');
        }

        // 如果不在世，验证逝世日期
        if (!data.is_living && !data.death_date) {
            errors.push('不在世人员必须填写逝世日期');
        }

        // 简单格式验证
        if (data.phone && !/^1[3-9]\d{9}$/.test(data.phone)) {
            errors.push('手机号格式不正确');
        }

        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('邮箱格式不正确');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validateRelationship(data) {
        const errors = [];

        if (!data.from_person_id) {
            errors.push('请选择主体成员');
        }

        if (!data.to_person_id) {
            errors.push('请选择关联成员');
        }

        if (!data.relationship_type) {
            errors.push('请选择关系类型');
        }

        if (data.from_person_id && data.to_person_id && data.from_person_id === data.to_person_id) {
            errors.push('不能选择同一个成员建立关系');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validateRequired(value, fieldName) {
        if (!value || value.toString().trim() === '') {
            return `${fieldName}不能为空`;
        }
        return null;
    }

    static validateEmail(email) {
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return '邮箱格式不正确';
        }
        return null;
    }

    static validatePhone(phone) {
        if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
            return '手机号格式不正确';
        }
        return null;
    }
}

// 全局导出
window.SimpleValidator = SimpleValidator;