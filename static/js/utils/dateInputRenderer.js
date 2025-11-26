// static/js/utils/dateInputRenderer.js
class DateInputRenderer {
    static renderDateInputs(type, dateData, isRequired = true) {
        const { accuracy, year, month, day, type: dateType } = dateData;

        console.log(`渲染 ${type} 日期输入框:`, { accuracy, year, month, day, dateType });

        const requiredAttr = isRequired ? 'required' : '';

        const exactDisplay = accuracy === 'exact' ? '' : 'hidden';
        const monthDisplay = accuracy === 'year_month' ? '' : 'hidden';
        const yearDisplay = accuracy === 'year_only' ? '' : 'hidden';

        const safeYear = year ? DateInputRenderer.clampValue(parseInt(year), 1900, 2100) : '';
        const safeMonth = month ? DateInputRenderer.clampValue(parseInt(month), 1, 12) : '';
        const safeDay = day ? DateInputRenderer.clampValue(parseInt(day), 1, 31) : '';

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

    static clampValue(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}

// 修改为浏览器全局导出
window.DateInputRenderer = DateInputRenderer;