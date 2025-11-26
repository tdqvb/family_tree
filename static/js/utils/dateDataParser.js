// static/js/utils/dateDataParser.js
class DateDataParser {
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
}

// 修改为浏览器全局导出
window.DateDataParser = DateDataParser;