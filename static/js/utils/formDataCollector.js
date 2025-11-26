// static/js/utils/formDataCollector.js
class FormDataCollector {
    static collectPersonAddData(form, isLiving) {
        const formData = new FormData(form);

        const data = {
            name: formData.get('name'),
            gender: formData.get('gender'),
            is_living: isLiving,
            phone: formData.get('phone'),
            email: formData.get('email'),
            birth_place: formData.get('birth_place'),
            biography: formData.get('biography')
        };

        // 收集出生日期数据
        const birthAccuracy = formData.get('birth_date_accuracy');
        data.birth_date = DateDataParser.buildDate(formData, birthAccuracy, 'birth');
        data.birth_date_type = DateDataParser.getDateType(formData, birthAccuracy, 'birth');
        data.birth_date_accuracy = birthAccuracy;

        // 处理逝世日期
        if (!isLiving) {
            const deathAccuracy = formData.get('death_date_accuracy') || 'exact';
            data.death_date = DateDataParser.buildDate(formData, deathAccuracy, 'death');
            data.death_date_type = DateDataParser.getDateType(formData, deathAccuracy, 'death');
            data.death_date_accuracy = deathAccuracy;
        } else {
            data.death_date = null;
            data.death_date_type = null;
            data.death_date_accuracy = null;
        }

        return data;
    }

    static hasFormChanges(originalData, currentForm) {
        if (!originalData || !currentForm) return false;

        const formData = new FormData(currentForm);
        const currentData = Object.fromEntries(formData);

        return Object.keys(currentData).some(key => {
            const originalValue = originalData[key] || '';
            const currentValue = currentData[key] || '';
            return originalValue.toString() !== currentValue.toString();
        });
    }
}

// 修改为浏览器全局导出
window.FormDataCollector = FormDataCollector;