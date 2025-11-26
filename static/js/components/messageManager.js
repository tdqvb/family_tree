// static/js/components/messageManager.js

class MessageManager {
    constructor(containerSelector = 'body', messageId = 'form-message') {
        this.containerSelector = containerSelector;
        this.messageId = messageId;
        this.autoHideTimeouts = new Map();
    }

    showMessage(message, type = 'info', autoHide = false, duration = 0) {
        // 清除现有消息
        this.clearMessage();

        // 创建新消息
        const messageDiv = document.createElement('div');
        messageDiv.id = this.messageId;
        messageDiv.className = `message-alert p-4 rounded-md mb-4 shadow-sm ${
            type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
        }`;

        messageDiv.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <i class="fas ${
                        type === 'success' ? 'fa-circle-check text-green-500' :
                        type === 'error' ? 'fa-circle-exclamation text-red-500' :
                        type === 'warning' ? 'fa-triangle-exclamation text-yellow-500' :
                        'fa-circle-info text-blue-500'
                    } mr-3"></i>
                    <span class="font-medium">${message}</span>
                </div>
                <button type="button" class="message-close text-gray-400 hover:text-gray-600 transition-colors">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // 插入到容器
        const container = document.querySelector(this.containerSelector);
        if (container) {
            if (container.firstChild) {
                container.insertBefore(messageDiv, container.firstChild);
            } else {
                container.appendChild(messageDiv);
            }
        } else {
            document.body.insertBefore(messageDiv, document.body.firstChild);
        }

        // 添加关闭事件
        const closeBtn = messageDiv.querySelector('.message-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.clearMessage();
            });
        }

        // 自动隐藏
        if (autoHide) {
            const timeoutId = setTimeout(() => {
                this.clearMessage();
            }, duration);
            this.autoHideTimeouts.set(type, timeoutId);
        }

        return messageDiv;
    }

    clearMessage() {
        const message = document.getElementById(this.messageId);
        if (message) {
            message.classList.add('fade-out');
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 200);
        }

        this.autoHideTimeouts.forEach((timeoutId, type) => {
            clearTimeout(timeoutId);
        });
        this.autoHideTimeouts.clear();
    }

    showSuccess(message, autoHide = false, duration = 0) {
        return this.showMessage(message, 'success', autoHide, duration);
    }

    showError(message, autoHide = false, duration = 0) {
        return this.showMessage(message, 'error', autoHide, duration);
    }

    showWarning(message, autoHide = false, duration = 0) {
        return this.showMessage(message, 'warning', autoHide, duration);
    }

    showInfo(message, autoHide = false, duration = 0) {
        return this.showMessage(message, 'info', autoHide, duration);
    }

    /**
     * 显示新增人员成功消息
     */
    showPersonCreateSuccess(formData) {
        console.log('🎯 开始创建人员成功提示:', formData);

        this.clearMessage();

        const { name, gender, birth_date, birth_date_type, birth_date_accuracy,
                death_date, death_date_type, death_date_accuracy, is_living, birth_place, phone, email, biography } = formData;

        // 格式化日期显示
        const formatDateForDisplay = (dateStr, accuracy, dateType) => {
            if (!dateStr) return '未填写';

            const date = new Date(dateStr);
            let formatted = '';

            switch (accuracy) {
                case 'exact':
                    formatted = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
                    break;
                case 'year_month':
                    formatted = `${date.getFullYear()}/${date.getMonth() + 1}`;
                    break;
                case 'year_only':
                    formatted = `${date.getFullYear()}`;
                    break;
                default:
                    formatted = date.toLocaleDateString();
            }

            return `${formatted}（${dateType === 'solar' ? '公历' : '农历'}）`;
        };

        const messageHTML = `
            <div class="success-modal bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <!-- 标题 -->
                <div class="modal-header bg-green-600 text-white px-6 py-4 rounded-t-lg">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <i class="fas fa-user-plus text-xl mr-3"></i>
                            <h2 class="text-xl font-bold">成员添加成功</h2>
                        </div>
                        <button type="button" class="modal-close text-white hover:text-gray-200 transition-transform transform hover:scale-110">
                            <i class="fas fa-times text-lg"></i>
                        </button>
                    </div>
                </div>

                <!-- 内容区域 -->
                <div class="modal-content px-6 py-4">
                    <!-- 姓名和性别 -->
                    <div class="person-header mb-4">
                        <h3 class="text-2xl font-bold text-gray-800 mb-2">${name || '未填写'}</h3>
                        <div class="flex items-center">
                            <span class="gender-badge ${gender === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'} px-3 py-1 rounded-full text-sm font-medium">
                                ${gender === 'M' ? '👦 男' : gender === 'F' ? '👧 女' : '未设置'}
                            </span>
                        </div>
                    </div>

                    <!-- 信息列表 -->
                    <div class="info-list space-y-3">
                        <!-- 出生信息 -->
                        <div class="info-item flex items-start">
                            <i class="fas fa-birthday-cake text-gray-400 mt-1 mr-3 flex-shrink-0"></i>
                            <div class="flex-1">
                                <div class="text-sm text-gray-600">出生信息</div>
                                <div class="text-gray-800">
                                    ${formatDateForDisplay(birth_date, birth_date_accuracy, birth_date_type)}
                                    ${birth_place ? ` · ${birth_place}` : ''}
                                </div>
                            </div>
                        </div>

                        <!-- 在世状态 -->
                        <div class="info-item flex items-start">
                            <i class="fas fa-heart text-gray-400 mt-1 mr-3 flex-shrink-0"></i>
                            <div class="flex-1">
                                <div class="text-sm text-gray-600">在世状态</div>
                                <div class="flex items-center">
                                    <span class="${is_living ? 'text-green-600' : 'text-gray-600'} font-medium">
                                        ${is_living ? '💚 在世' : '💤 已故'}
                                    </span>
                                    ${!is_living && death_date ? `
                                        <span class="text-gray-500 text-sm ml-2">
                                            ${formatDateForDisplay(death_date, death_date_accuracy, death_date_type)}
                                        </span>
                                    ` : ''}
                                </div>
                            </div>
                        </div>

                        <!-- 联系方式 -->
                        ${(phone || email) ? `
                        <div class="info-item flex items-start">
                            <i class="fas fa-address-book text-gray-400 mt-1 mr-3 flex-shrink-0"></i>
                            <div class="flex-1">
                                <div class="text-sm text-gray-600">联系方式</div>
                                <div class="space-y-1">
                                    ${phone ? `
                                    <div class="flex items-center text-gray-800">
                                        <i class="fas fa-phone text-xs mr-2 text-gray-400 flex-shrink-0"></i>
                                        <span class="truncate">${phone}</span>
                                    </div>
                                    ` : ''}
                                    ${email ? `
                                    <div class="flex items-center text-gray-800">
                                        <i class="fas fa-envelope text-xs mr-2 text-gray-400 flex-shrink-0"></i>
                                        <span class="truncate">${email}</span>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        ` : ''}

                        <!-- 生平简介 -->
                        ${biography ? `
                        <div class="info-item flex items-start">
                            <i class="fas fa-file-alt text-gray-400 mt-1 mr-3 flex-shrink-0"></i>
                            <div class="flex-1">
                                <div class="text-sm text-gray-600">生平简介</div>
                                <div class="text-gray-800 text-sm mt-1 leading-relaxed max-h-20 overflow-y-auto">
                                    ${biography}
                                </div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <!-- 分隔线 -->
                <div class="border-t border-gray-200"></div>

                <!-- 操作按钮 -->
                <div class="modal-actions px-6 py-4 flex justify-end">
                    <button type="button" class="confirm-btn bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-all duration-200 font-medium transform hover:scale-105 active:scale-95">
                        确定
                    </button>
                </div>
            </div>
        `;

        // 创建模态框容器
        const modalContainer = document.createElement('div');
        modalContainer.id = this.messageId;
        modalContainer.className = 'fixed-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modalContainer.innerHTML = messageHTML;

        // 插入到页面
        document.body.appendChild(modalContainer);

        // 添加关闭事件
        const closeBtn = modalContainer.querySelector('.modal-close');
        const confirmBtn = modalContainer.querySelector('.confirm-btn');

        const closeModal = () => {
            modalContainer.classList.add('fade-out');
            setTimeout(() => {
                if (modalContainer.parentNode) {
                    modalContainer.remove();
                }
            }, 200);
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', closeModal);
        }

        // 点击背景关闭
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                closeModal();
            }
        });

        // ESC键关闭
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscKey);
            }
        };
        document.addEventListener('keydown', handleEscKey);

        console.log('✅ 人员成功提示创建完成');
        return modalContainer;
    }

    /**
     * 显示人员更新成功消息
     */
    showPersonUpdateSuccess(formData) {
        this.clearMessage();

        const { name } = formData;

        const messageHTML = `
            <div class="success-modal bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="modal-header bg-green-600 text-white px-6 py-4 rounded-t-lg">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <i class="fas fa-user-edit text-xl mr-3"></i>
                            <h2 class="text-xl font-bold">信息更新成功</h2>
                        </div>
                        <button type="button" class="modal-close text-white hover:text-gray-200 transition-transform transform hover:scale-110">
                            <i class="fas fa-times text-lg"></i>
                        </button>
                    </div>
                </div>

                <div class="modal-content px-6 py-6 text-center">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-check text-green-600 text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">${name} 的信息已更新</h3>
                    <p class="text-gray-600">所有修改已保存到数据库</p>
                </div>

                <div class="modal-actions px-6 py-4 flex justify-end border-t border-gray-200">
                    <button type="button" class="confirm-btn bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-all duration-200 font-medium transform hover:scale-105 active:scale-95">
                        确定
                    </button>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.id = this.messageId;
        modalContainer.className = 'fixed-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modalContainer.innerHTML = messageHTML;

        document.body.appendChild(modalContainer);

        const closeBtn = modalContainer.querySelector('.modal-close');
        const confirmBtn = modalContainer.querySelector('.confirm-btn');

        const closeModal = () => {
            modalContainer.classList.add('fade-out');
            setTimeout(() => {
                if (modalContainer.parentNode) {
                    modalContainer.remove();
                }
            }, 200);
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (confirmBtn) confirmBtn.addEventListener('click', closeModal);

        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) closeModal();
        });

        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscKey);
            }
        };
        document.addEventListener('keydown', handleEscKey);

        return modalContainer;
    }
}

// 添加优化的CSS动画
const style = document.createElement('style');
style.textContent = `
    /* 使用transform和opacity优化动画性能 */
    .message-alert {
        transform: translateZ(0);
        will-change: transform, opacity;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .message-alert.fade-out {
        opacity: 0;
        transform: translateY(-10px);
    }

    .fixed-modal {
        transform: translateZ(0);
        will-change: transform, opacity;
        opacity: 1;
        transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .fixed-modal.fade-out {
        opacity: 0;
    }

    .success-modal {
        transform: translateZ(0);
        will-change: transform;
        animation: modalSlideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    .modal-header {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .gender-badge {
        font-size: 0.75rem;
    }

    .info-item {
        padding: 8px 0;
    }

    .info-item:not(:last-child) {
        border-bottom: 1px solid #f3f4f6;
    }

    .confirm-btn {
        transform: translateZ(0);
        will-change: transform;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* 优化滚动性能 */
    .modal-content {
        transform: translateZ(0);
    }

    /* 优化图标动画 */
    .modal-close, .confirm-btn {
        transform: translateZ(0);
        will-change: transform;
    }

    /* 移动端优化 */
    @media (max-width: 640px) {
        .success-modal {
            margin: 0;
            border-radius: 0;
            max-height: 100vh;
            height: 100vh;
        }

        .fixed-modal {
            padding: 0;
            align-items: flex-end;
        }
    }
`;
document.head.appendChild(style);