// static/js/core/utils.js
class DateUtils {
    static parseDateData(dateString, accuracy, dateType) {
        console.log('解析日期数据 - 输入:', { dateString, accuracy, dateType });

        const defaultData = {
            accuracy: accuracy || 'exact',
            type: dateType || 'solar',
            year: '',
            month: '',
            day: ''
        };

        if (!dateString) {
            console.log('无日期字符串，返回默认数据:', defaultData);
            return defaultData;
        }

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return defaultData;
            }

            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();

            const safeYear = this.clampValue(year, 1900, 2100);
            const safeMonth = this.clampValue(month, 1, 12);
            const safeDay = this.clampValue(day, 1, 31);

            if (accuracy === 'year_only') {
                return { ...defaultData, year: safeYear };
            }

            if (accuracy === 'year_month') {
                return { ...defaultData, year: safeYear, month: safeMonth };
            }

            return {
                ...defaultData,
                year: safeYear,
                month: safeMonth,
                day: safeDay
            };

        } catch (error) {
            console.error('日期解析错误:', error);
            return defaultData;
        }
    }

    static buildDate(formData, accuracy, type) {
        switch(accuracy) {
            case 'exact':
                const year = formData.get(`${type}_year`);
                const month = formData.get(`${type}_month`);
                const day = formData.get(`${type}_day`);
                if (year && month && day) {
                    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
                break;

            case 'year_month':
                const yearMonth = formData.get(`${type}_year_month`);
                const monthOnly = formData.get(`${type}_month_only`);
                if (yearMonth && monthOnly) {
                    return `${yearMonth}-${monthOnly.padStart(2, '0')}-01`;
                }
                break;

            case 'year_only':
                const yearOnly = formData.get(`${type}_year_only`);
                if (yearOnly) {
                    return `${yearOnly}-01-01`;
                }
                break;
        }
        return null;
    }

    static getDateType(formData, accuracy, type) {
        switch(accuracy) {
            case 'exact':
                return formData.get(`${type}_date_type`);
            case 'year_month':
                return formData.get(`${type}_date_type_month`);
            case 'year_only':
                return formData.get(`${type}_date_type_year`);
            default:
                return 'solar';
        }
    }

    static clampValue(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // 农历月份映射
    static lunarMonths = {
        '01': '正月', '02': '二月', '03': '三月', '04': '四月',
        '05': '五月', '06': '六月', '07': '七月', '08': '八月',
        '09': '九月', '10': '十月', '11': '冬月', '12': '腊月'
    };

    // 农历日期映射
    static lunarDays = {
        '01': '初一', '02': '初二', '03': '初三', '04': '初四', '05': '初五',
        '06': '初六', '07': '初七', '08': '初八', '09': '初九', '10': '初十',
        '11': '十一', '12': '十二', '13': '十三', '14': '十四', '15': '十五',
        '16': '十六', '17': '十七', '18': '十八', '19': '十九', '20': '二十',
        '21': '廿一', '22': '廿二', '23': '廿三', '24': '廿四', '25': '廿五',
        '26': '廿六', '27': '廿七', '28': '廿八', '29': '廿九', '30': '三十'
    };

    static formatDateDisplay(dateString, dateType, accuracy = 'exact') {
        if (!dateString) return '未知';

        try {
            if (dateType === 'lunar') {
                return this.formatLunarDate(dateString, accuracy);
            } else {
                return this.formatSolarDate(dateString, accuracy);
            }
        } catch (e) {
            console.error('日期格式化错误:', e);
            return '日期格式错误';
        }
    }

    static formatLunarDate(dateString, accuracy) {
        const dateParts = dateString.split('-');
        if (dateParts.length !== 3) {
            return `${dateString}`;
        }

        const [year, month, day] = dateParts;
        let displayDate = '';

        switch (accuracy) {
            case 'year_only':
                displayDate = `${year}年`;
                break;
            case 'year_month':
                displayDate = `${year}年${this.lunarMonths[month] || month}`;
                break;
            case 'exact':
            default:
                displayDate = `${year}年${this.lunarMonths[month] || month}${this.lunarDays[day] || day}`;
                break;
        }

        return displayDate;
    }

    static formatSolarDate(dateString, accuracy) {
        const dateParts = dateString.split('-');
        if (dateParts.length !== 3) {
            return `${dateString}`;
        }

        const [year, month, day] = dateParts;
        let displayDate = '';

        switch (accuracy) {
            case 'year_only':
                displayDate = `${year}年`;
                break;
            case 'year_month':
                displayDate = `${year}年${parseInt(month)}月`;
                break;
            case 'exact':
            default:
                displayDate = `${year}年${parseInt(month)}月${parseInt(day)}日`;
                break;
        }

        return displayDate;
    }

    static fixLunarDateDisplay(person) {
        if (!person.birth_date) return '未知';

        try {
            if (person.birth_date_type === 'lunar') {
                const dateParts = person.birth_date.split('-');
                if (dateParts.length === 3) {
                    const [year, month, day] = dateParts;

                    switch (person.birth_date_accuracy) {
                        case 'year_only':
                            return `${year}年`;
                        case 'year_month':
                            return `${year}年${this.lunarMonths[month] || month}`;
                        case 'exact':
                        default:
                            return `${year}年${this.lunarMonths[month] || month}${this.lunarDays[day] || day}`;
                    }
                }
            }

            return this.formatDateDisplay(person.birth_date, person.birth_date_type, person.birth_date_accuracy);

        } catch (e) {
            return '日期格式错误';
        }
    }

    static renderDateInputs(type, dateData, isRequired = true) {
        const { accuracy, year, month, day, type: dateType } = dateData;

        console.log(`渲染 ${type} 日期输入框:`, { accuracy, year, month, day, dateType });

        const requiredAttr = isRequired ? 'required' : '';

        const exactDisplay = accuracy === 'exact' ? '' : 'hidden';
        const monthDisplay = accuracy === 'year_month' ? '' : 'hidden';
        const yearDisplay = accuracy === 'year_only' ? '' : 'hidden';

        const safeYear = year ? this.clampValue(parseInt(year), 1900, 2100) : '';
        const safeMonth = month ? this.clampValue(parseInt(month), 1, 12) : '';
        const safeDay = day ? this.clampValue(parseInt(day), 1, 31) : '';

        return `
            <!-- 精确到日的输入框 -->
            <div id="edit-${type}_date_exact" class="date-input-group ${exactDisplay}">
                <div class="grid grid-cols-4 gap-2">
                    <div>
                        <input type="number" id="edit-${type}_year" name="${type}_year" placeholder="年" min="1900" max="2100"
                               value="${safeYear || ''}" ${requiredAttr}
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                    </div>
                    <div>
                        <input type="number" id="edit-${type}_month" name="${type}_month" placeholder="月" min="1" max="12"
                               value="${safeMonth || ''}" ${requiredAttr}
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                    </div>
                    <div>
                        <input type="number" id="edit-${type}_day" name="${type}_day" placeholder="日" min="1" max="31"
                               value="${safeDay || ''}" ${requiredAttr}
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                    </div>
                    <div>
                        <select id="edit-${type}_date_type" name="${type}_date_type" ${requiredAttr}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                            <option value="solar" ${dateType === 'solar' ? 'selected' : ''}>公历</option>
                            <option value="lunar" ${dateType === 'lunar' ? 'selected' : ''}>农历</option>
                        </select>
                    </div>
                </div>
                <p class="date-format-hint text-xs text-gray-500 mt-1">请填写完整的年、月、日信息</p>
            </div>

            <!-- 精确到月的输入框 -->
            <div id="edit-${type}_date_month" class="date-input-group ${monthDisplay}">
                <div class="grid grid-cols-3 gap-2">
                    <div>
                        <input type="number" id="edit-${type}_year_month" name="${type}_year_month" placeholder="年" min="1900" max="2100"
                               value="${safeYear || ''}" ${requiredAttr}
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                    </div>
                    <div>
                        <input type="number" id="edit-${type}_month_only" name="${type}_month_only" placeholder="月" min="1" max="12"
                               value="${safeMonth || ''}" ${requiredAttr}
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                    </div>
                    <div>
                        <select id="edit-${type}_date_type_month" name="${type}_date_type_month" ${requiredAttr}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                            <option value="solar" ${dateType === 'solar' ? 'selected' : ''}>公历</option>
                            <option value="lunar" ${dateType === 'lunar' ? 'selected' : ''}>农历</option>
                        </select>
                    </div>
                </div>
                <p class="date-format-hint text-xs text-gray-500 mt-1">请填写年和月信息</p>
            </div>

            <!-- 精确到年的输入框 -->
            <div id="edit-${type}_date_year" class="date-input-group ${yearDisplay}">
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <input type="number" id="edit-${type}_year_only" name="${type}_year_only" placeholder="年" min="1900" max="2100"
                               value="${safeYear || ''}" ${requiredAttr}
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                    </div>
                    <div>
                        <select id="edit-${type}_date_type_year" name="${type}_date_type_year" ${requiredAttr}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                            <option value="solar" ${dateType === 'solar' ? 'selected' : ''}>公历</option>
                            <option value="lunar" ${dateType === 'lunar' ? 'selected' : ''}>农历</option>
                        </select>
                    </div>
                </div>
                <p class="date-format-hint text-xs text-gray-500 mt-1">请填写年份信息</p>
            </div>
        `;
    }
}

class FormUtils {
    static collectPersonData(form, isLiving) {
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
        data.birth_date = DateUtils.buildDate(formData, birthAccuracy, 'birth');
        data.birth_date_type = DateUtils.getDateType(formData, birthAccuracy, 'birth');
        data.birth_date_accuracy = birthAccuracy;

        // 处理逝世日期
        if (!isLiving) {
            const deathAccuracy = formData.get('death_date_accuracy') || 'exact';
            data.death_date = DateUtils.buildDate(formData, deathAccuracy, 'death');
            data.death_date_type = DateUtils.getDateType(formData, deathAccuracy, 'death');
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

class DomUtils {
    static escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static showElement(elementId, show = true) {
        const element = document.getElementById(elementId);
        if (element) {
            if (show) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    }

    static setElementRequired(elementId, required = true) {
        const element = document.getElementById(elementId);
        if (element) {
            element.required = required;
        }
    }

    static updateSaveButtonState(buttonId, hasChanges) {
        const saveButton = document.getElementById(buttonId);
        if (!saveButton) return;

        if (hasChanges) {
            saveButton.disabled = false;
            saveButton.classList.remove('opacity-50', 'cursor-not-allowed');
            saveButton.classList.add('hover:bg-green-700');
        } else {
            saveButton.disabled = true;
            saveButton.classList.add('opacity-50', 'cursor-not-allowed');
            saveButton.classList.remove('hover:bg-green-700');
        }
    }

    static showLoading(containerId, show = true, message = '加载中...') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (show) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12">
                    <i class="fas fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
                    <p class="text-gray-500">${message}</p>
                </div>
            `;
        }
    }
}

// 全局导出
window.DateUtils = DateUtils;
window.FormUtils = FormUtils;
window.DomUtils = DomUtils;