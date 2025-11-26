// static/js/utils/dateFormatter.js
class DateFormatter {
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

    /**
     * 格式化日期显示（带HTML标签，用于详情页）
     * @param {string} dateString - 日期字符串 (YYYY-MM-DD)
     * @param {string} dateType - 日期类型 (solar/lunar)
     * @param {string} accuracy - 精度 (exact/year_month/year_only)
     * @returns {string} 格式化后的日期字符串
     */
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

    /**
     * 格式化日期显示（纯文本，用于表格）
     * @param {string} dateString - 日期字符串
     * @param {string} dateType - 日期类型
     * @param {string} accuracy - 精度
     * @returns {string} 纯文本日期
     */
    static formatDateText(dateString, dateType, accuracy = 'exact') {
        if (!dateString) return '未知';

        try {
            if (dateType === 'lunar') {
                return this.formatLunarDateText(dateString, accuracy);
            } else {
                return this.formatSolarDateText(dateString, accuracy);
            }
        } catch (e) {
            return '日期格式错误';
        }
    }

    /**
     * 格式化农历日期（带HTML标签）
     */
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

    /**
     * 格式化公历日期（带HTML标签）
     */
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

    /**
     * 格式化农历日期（纯文本）
     */
    static formatLunarDateText(dateString, accuracy) {
        const dateParts = dateString.split('-');
        if (dateParts.length !== 3) return `${dateString}`;

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

    /**
     * 格式化公历日期（纯文本）
     */
    static formatSolarDateText(dateString, accuracy) {
        const dateParts = dateString.split('-');
        if (dateParts.length !== 3) return `${dateString}`;

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

    /**
     * 修复农历日期显示格式（处理数据库中的不一致数据）
     * @param {Object} person - 人员对象
     * @returns {string} 修复后的日期显示
     */
    static fixLunarDateDisplay(person) {
        if (!person.birth_date) return '未知';

        try {
            // 处理农历日期格式不一致的问题
            if (person.birth_date_type === 'lunar') {
                const dateParts = person.birth_date.split('-');
                if (dateParts.length === 3) {
                    const [year, month, day] = dateParts;

                    // 根据精度显示
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

            // 默认使用标准格式化
            return this.formatDateText(person.birth_date, person.birth_date_type, person.birth_date_accuracy);

        } catch (e) {
            return '日期格式错误';
        }
    }
}

// 浏览器全局导出
window.DateFormatter = DateFormatter;