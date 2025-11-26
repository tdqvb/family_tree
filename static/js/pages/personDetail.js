// static/js/pages/personDetail.js
class PersonDetail {
    constructor() {
        this.currentPerson = null;
        this.init();
    }

    init() {
        this.bindGlobalEvents();
    }

    bindGlobalEvents() {
        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                this.closeModal();
            }
        });

        // 点击模态框背景关闭
        document.addEventListener('click', (e) => {
            if (e.target.id === 'view-person-modal') {
                this.closeModal();
            }
        });
    }

    isModalOpen() {
        const modal = document.getElementById('view-person-modal');
        return modal && !modal.classList.contains('hidden');
    }

    async viewPerson(personId) {
        // 如果已经有当前人员数据且ID相同，直接打开模态框
        if (this.currentPerson && this.currentPerson.id === personId) {
            this.openModal();
            return;
        }

        await this.showPersonDetail(personId);
    }

    async showPersonDetail(personId) {
        try {
            this.showLoading(true);
            const response = await ApiService.getPerson(personId);
            this.currentPerson = response;
            this.renderPersonDetail(this.currentPerson);
            this.openModal();
        } catch (error) {
            console.error('获取人员详情错误:', error);
            this.showMessage('获取人员详情失败: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderPersonDetail(person) {
        const content = document.getElementById('person-detail-content');
        const updateTime = document.getElementById('person-update-time');

        if (!content) return;

        // 更新最后修改时间
        if (updateTime && person.updated_at) {
            updateTime.textContent = `最后更新: ${this.formatDateTime(person.updated_at)}`;
        }

        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label class="text-sm font-medium text-blue-700 flex items-center">
                            <i class="fas fa-id-card mr-2"></i>基本信息
                        </label>
                        <div class="mt-3 space-y-3">
                            <div class="flex justify-between items-center py-2 border-b border-blue-100">
                                <span class="text-sm text-gray-600">姓名:</span>
                                <p class="text-lg font-semibold text-gray-900">${DomUtils.escapeHtml(person.name) || '未填写'}</p>
                            </div>
                            <div class="flex justify-between items-center py-2 border-b border-blue-100">
                                <span class="text-sm text-gray-600">性别:</span>
                                <p class="text-lg font-medium">${person.gender === 'M' ? '<span class="text-blue-600">👨 男</span>' : '<span class="text-pink-600">👩 女</span>'}</p>
                            </div>
                            <div class="flex justify-between items-center py-2">
                                <span class="text-sm text-gray-600">状态:</span>
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${person.is_living ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}">
                                    ${person.is_living ? '💚 在世' : '💔 已故'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-green-50 p-4 rounded-lg border border-green-100">
                        <label class="text-sm font-medium text-green-700 flex items-center">
                            <i class="fas fa-cake-candles mr-2"></i>出生信息
                        </label>
                        <div class="mt-3 space-y-3">
                            <div class="flex justify-between items-center py-2 border-b border-green-100">
                                <span class="text-sm text-gray-600">出生日期:</span>
                                <p class="font-medium">${DateUtils.formatDateDisplay(person.birth_date, person.birth_date_type, person.birth_date_accuracy)}
                                </p>
                            </div>
                            ${person.birth_place ? `
                            <div class="flex justify-between items-center py-2">
                                <span class="text-sm text-gray-600">出生地:</span>
                                <p class="font-medium text-right max-w-xs">${DomUtils.escapeHtml(person.birth_place)}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    ${!person.is_living ? `
                    <div class="bg-red-50 p-4 rounded-lg border border-red-100">
                        <label class="text-sm font-medium text-red-700 flex items-center">
                            <i class="fas fa-cross mr-2"></i>逝世信息
                        </label>
                        <div class="mt-3">
                            <div class="flex justify-between items-center py-2">
                                <span class="text-sm text-gray-600">逝世日期:</span>
                                <p class="font-medium">${DateUtils.formatDateDisplay(person.death_date, person.death_date_type, person.death_date_accuracy)}
                                </p>
                            </div>
                        </div>
                    </div>
                    ` : ''}

                    <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <label class="text-sm font-medium text-purple-700 flex items-center">
                            <i class="fas fa-address-book mr-2"></i>联系信息
                        </label>
                        <div class="mt-3 space-y-3">
                            ${person.phone ? `
                            <div class="flex justify-between items-center py-2 border-b border-purple-100">
                                <span class="text-sm text-gray-600">电话:</span>
                                <p class="font-medium">
                                    <a href="tel:${person.phone}" class="text-blue-600 hover:text-blue-800 transition-colors">
                                        📞 ${DomUtils.escapeHtml(person.phone)}
                                    </a>
                                </p>
                            </div>
                            ` : ''}
                            ${person.email ? `
                            <div class="flex justify-between items-center py-2">
                                <span class="text-sm text-gray-600">邮箱:</span>
                                <p class="font-medium">
                                    <a href="mailto:${person.email}" class="text-blue-600 hover:text-blue-800 transition-colors">
                                        📧 ${DomUtils.escapeHtml(person.email)}
                                    </a>
                                </p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                ${person.biography ? `
                <div class="md:col-span-2">
                    <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <label class="text-sm font-medium text-yellow-700 flex items-center">
                            <i class="fas fa-book mr-2"></i>生平简介
                        </label>
                        <p class="mt-3 text-gray-700 leading-relaxed whitespace-pre-wrap">${DomUtils.escapeHtml(person.biography)}</p>
                    </div>
                </div>
                ` : ''}

                <!-- 系统信息 -->
                <div class="md:col-span-2">
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label class="text-sm font-medium text-gray-700 flex items-center">
                            <i class="fas fa-circle-info mr-2"></i>系统信息
                        </label>
                        <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">创建时间:</span>
                                <span class="text-gray-800">${this.formatDateTime(person.created_at)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">更新时间:</span>
                                <span class="text-gray-800">${this.formatDateTime(person.updated_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    openModal() {
        const modal = document.getElementById('view-person-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        const modal = document.getElementById('view-person-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
        this.currentPerson = null;
    }

    editCurrentPerson() {
        if (this.currentPerson && window.personEdit) {
            this.closeModal();
            setTimeout(() => {
                window.personEdit.editPerson(this.currentPerson.id);
            }, 300);
        }
    }

    showLoading(show) {
        const content = document.getElementById('person-detail-content');
        if (!content) return;

        if (show) {
            content.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12">
                    <i class="fas fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
                    <p class="text-gray-500">加载人员详情中...</p>
                </div>
            `;
        }
    }

    // 工具方法
    formatDateTime(dateTimeString) {
        if (!dateTimeString) return '未知';
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleString('zh-CN');
        } catch (e) {
            return '时间格式错误';
        }
    }

    showMessage(message, type = 'info') {
        // 创建简单消息提示
        const alertDiv = document.createElement('div');
        alertDiv.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        alertDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 4000);
    }
}

// 全局实例
let personDetail = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    personDetail = new PersonDetail();
    window.personDetail = personDetail;

    console.log('✅ personDetail 初始化完成');
});