模块的方法及作用的详细整理：

📁 personApi.js - 人员 API 接口类
作用: 封装所有与人员相关的后端 API 调用

方法列表:
getPersons(params) - 获取人员列表，支持关键词搜索、性别筛选、分页

deletePerson(personId) - 删除指定 ID 的人员

getPerson(personId) - 获取单个人员的详细信息

📊 dataTable.js - 数据表格组件
作用: 渲染和操作人员数据表格

方法列表:
render(data) - 渲染表格数据

generateTableHTML() - 生成表格 HTML 结构

formatDateDisplay(person) - 格式化日期显示（使用 DateFormatter）

generateActionButtons(personId) - 生成操作按钮（查看、编辑、删除）

bindRowEvents() - 绑定行事件处理

disableDeleteButton(button) - 禁用删除按钮并显示加载状态

enableAllDeleteButtons() - 启用所有删除按钮

showLoading() - 显示加载状态

showEmpty() - 显示空数据状态

showError(message, onRetry) - 显示错误状态

destroy() - 清理事件监听器

📅 dateInputManager.js - 日期输入管理器
作用: 管理不同精度的日期输入（精确到日/月/年）

方法列表:
init() - 初始化日期管理器

initAccuracyHandler() - 初始化精度选择处理器

updateDateInputFormat(accuracy) - 根据精度更新日期输入格式

setDateInputsRequired(required) - 设置所有日期输入框必填状态

setContainerInputsRequired(containerId, required) - 设置特定容器输入框必填状态

clearDateInputs(containerId) - 清空日期输入框

initDateInputLimits() - 初始化日期输入限制

limitInputValue(input) - 限制输入值范围

validateDateValidity() - 验证日期有效性

validateExactDate() - 验证精确到日的日期

validateSolarDateDays(year, month, day) - 验证公历日期天数

isLeapYear(year) - 判断是否为闰年

isValidLunarDateBasic(day) - 农历基础验证

validateYearMonth() - 验证精确到年月的日期

validateYearOnly() - 验证精确到年的日期

collectDateData(formData) - 收集日期数据

buildDate(formData, accuracy) - 构建日期字符串

getDateType(formData, accuracy) - 获取日期类型

validateDate() - 验证日期字段

reset() - 重置日期输入

📤 formSubmitter.js - 表单提交器
作用: 处理表单提交逻辑

方法列表:
submit(data, validator) - 提交表单数据

showLoading(show) - 显示/隐藏加载状态

setOptions(newOptions) - 更新配置选项

✅ formValidator.js - 表单验证器
作用: 提供表单数据验证功能

方法列表:
setRules(rules) - 设置验证规则

addRule(field, rule) - 添加字段验证规则

validate(data) - 验证数据

getErrors() - 获取错误信息

clearErrors() - 清除错误信息

static commonRules - 常用验证规则预设（必填、最小长度、最大长度、邮箱、手机号）

💬 messageManager.js - 消息管理器
作用: 管理应用内的消息提示

方法列表:
showMessage(message, type, autoHide, duration) - 显示消息

clearMessage() - 清除消息

showSuccess(message, autoHide, duration) - 显示成功消息

showError(message, autoHide, duration) - 显示错误消息

showWarning(message, autoHide, duration) - 显示警告消息

showInfo(message, autoHide, duration) - 显示信息消息

🔢 pagination.js - 分页组件
作用: 处理数据分页逻辑

方法列表:
update(options) - 更新分页配置

render() - 渲染分页控件

generatePaginationHTML(totalPages) - 生成分页 HTML

bindEvents() - 绑定分页事件

handlePageChange(page) - 处理页码变化

updateButtonStates(totalPages) - 更新按钮状态

getPaginationInfo() - 获取分页信息文本

🗂️ tabManager.js - 标签页管理器
作用: 管理应用内的标签页切换

方法列表:
init() - 初始化标签管理器

switchTab(tabId) - 切换标签页

onTabChange(tabId) - 标签切换回调

showTab(tabId) - 显示指定标签页

getActiveTab() - 获取当前激活的标签页

👤 personDetail.js - 人员详情管理
作用: 显示和管理人员详细信息

方法列表:
init() - 初始化详情管理器

bindGlobalEvents() - 绑定全局事件

isModalOpen() - 检查模态框是否打开

viewPerson(personId) - 查看人员详情

showPersonDetail(personId) - 显示人员详情

renderPersonDetail(person) - 渲染人员详情

openModal() - 打开模态框

closeModal() - 关闭模态框

editCurrentPerson() - 编辑当前人员

showLoading(show) - 显示加载状态

formatDateTime(dateTimeString) - 格式化日期时间

escapeHtml(unsafe) - HTML 转义

showMessage(message, type) - 显示消息

✏️ personEdit.js - 人员编辑管理
作用: 处理人员信息的编辑和更新

方法列表:
init() - 初始化编辑管理器

initializeManagers() - 初始化各管理器

initializeDateManagers() - 初始化日期管理器

bindEvents() - 绑定事件监听器

editPerson(personId) - 编辑人员信息

showEditForm(personId) - 显示编辑表单

renderEditForm(person) - 渲染编辑表单

bindFormEvents() - 绑定表单事件

toggleDeathInfo(show) - 切换逝世信息显示

savePersonEdit() - 保存人员编辑

validateForm() - 验证表单

validateFormData(data) - 验证表单数据

validateDateFields(formData) - 验证日期字段

collectFormData() - 收集表单数据

handleValidationError(errors) - 处理验证错误

handleSaveSuccess(result) - 处理保存成功

handleSaveError(error) - 处理保存错误

hasChanges() - 检查是否有更改

updateSaveButtonState() - 更新保存按钮状态

handleCloseRequest() - 处理关闭请求

openModal() - 打开编辑模态框

closeModal() - 关闭编辑模态框

📝 personAdd.js - 人员表单管理
作用: 处理新增人员的表单逻辑

方法列表:
initEventListeners() - 初始化事件监听器

initRealTimeValidation() - 初始化实时验证

showFieldError(fieldName, errorMessage) - 显示字段错误

clearFieldError(fieldName) - 清除字段错误

getValidationRules() - 获取验证规则

toggleDeathInfo() - 切换逝世信息显示

handleFormSubmit() - 处理表单提交

validateDateFields() - 验证日期字段

validateFormStepByStep(data) - 分步骤验证表单

focusField(fieldName) - 聚焦到指定字段

focusFirstBirthDateField() - 聚焦到第一个出生日期字段

focusFirstDeathDateField() - 聚焦到第一个逝世日期字段

ensureRequiredStates() - 确保必填状态正确

validateBusinessRules(data) - 业务规则验证

showValidationErrors(errors) - 显示验证错误

handleSuccess(result) - 处理成功响应

handleError(error) - 处理错误响应

collectFormData() - 收集表单数据

resetForm() - 重置表单

clearAllFieldErrors() - 清除所有字段错误

destroy() - 销毁实例

👥 personList.js - 人员列表管理
作用: 管理人员列表的显示和操作

方法列表:
init() - 初始化列表管理器

initializeComponents() - 初始化组件

initEventListeners() - 初始化事件监听器

loadPersons() - 加载人员列表

updatePagination() - 更新分页信息

getPaginationInfo() - 获取分页信息文本

handleTableAction(action, personId) - 处理表格操作

handleViewPerson(personId) - 处理查看人员

handleEditPerson(personId) - 处理编辑人员

deletePerson(personId) - 删除人员

handleSearch() - 处理搜索

handlePageChange(page) - 处理页码变化

showMessage(message, type) - 显示消息

destroy() - 清理资源

🔗 relationshipAdd.js - 人员关系管理
作用: 管理人员之间的关系

方法列表:
init() - 初始化关系管理器

bindEvents() - 绑定事件

handlePersonSearch(event, type) - 处理成员搜索

showSearchSuggestions(members, type) - 显示搜索建议

selectPerson(option, type) - 选择成员

clearSourcePerson() - 清空主体成员

clearRelatedPerson() - 清空关联成员

showSuggestions(type) - 显示建议框

hideSuggestions(type) - 隐藏建议框

updateAddButtonState() - 更新添加按钮状态

searchMembers(keyword) - 搜索成员

addRelationship() - 添加关系

validateInput() - 验证输入

isRelationshipExists() - 检查关系是否存在

🔧 dateDataParser.js - 日期数据解析器
作用: 解析和处理日期数据

方法列表:
static parseDateData(dateString, accuracy, dateType) - 解析日期数据

static buildDate(formData, accuracy, type) - 构建日期字符串

static getDateType(formData, accuracy, type) - 获取日期类型

static clampValue(value, min, max) - 限制数值范围

🎨 dateFormatter.js - 日期格式化器
作用: 格式化日期显示（支持公历/农历）

方法列表:
static formatDateDisplay(dateString, dateType, accuracy) - 格式化日期显示（带HTML）

static formatDateText(dateString, dateType, accuracy) - 格式化日期显示（纯文本）

static formatLunarDate(dateString, accuracy) - 格式化农历日期（带HTML）

static formatSolarDate(dateString, accuracy) - 格式化公历日期（带HTML）

static formatLunarDateText(dateString, accuracy) - 格式化农历日期（纯文本）

static formatSolarDateText(dateString, accuracy) - 格式化公历日期（纯文本）

static fixLunarDateDisplay(person) - 修复农历日期显示格式

🎯 dateInputRenderer.js - 日期输入渲染器
作用: 渲染日期输入框

方法列表:
static renderDateInputs(type, dateData, isRequired) - 渲染日期输入框

static clampValue(value, min, max) - 限制数值范围