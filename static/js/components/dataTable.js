// static/js/components/dataTable.js
class DataTable {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      columns: [],
      actions: ['view', 'edit', 'delete'],
      onAction: null,
      emptyMessage: '暂无人员数据',
      loadingMessage: '加载中...',
      ...options
    };
    this.data = [];
    this.isProcessing = false;
  }

  render(data) {
    this.data = data || [];

    if (this.data.length === 0) {
      this.showEmpty();
      return;
    }

    this.container.innerHTML = this.generateTableHTML();
    this.bindRowEvents();
  }

  generateTableHTML() {
    const startIndex = (this.options.currentPage - 1) * this.options.pageSize + 1;

    return this.data.map((person, index) => `
      <tr class="hover:bg-gray-50 transition-colors duration-200">
        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500 text-center">${startIndex + index}</td>
        <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-center">${person.name || ''}</td>
        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500 text-center">${person.gender === 'M' ? '男' : '女'}</td>
        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
          ${this.formatDateDisplay(person)}
        </td>
        <td class="px-6 py-2 whitespace-nowrap text-sm font-medium ${person.is_living ? 'text-green-600' : 'text-red-600'} text-center">
          ${person.is_living ? '在世' : '已故'}
        </td>
        <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-center">
          <div class="flex items-center justify-center space-x-3">
            ${this.generateActionButtons(person.id)}
          </div>
        </td>
      </tr>
    `).join('');
  }

  // 专门用于日期显示的方法
  formatDateDisplay(person) {
    if (!person.birth_date) return '未知';

    try {
      // 使用修复后的农历日期显示方法
      return DateFormatter.fixLunarDateDisplay(person);
    } catch (e) {
      return '日期错误';
    }
  }

  generateActionButtons(personId) {
    const buttons = [];

    if (this.options.actions.includes('view')) {
      buttons.push(`
        <button data-action="view" data-person-id="${personId}"
                class="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 rounded-md transition-all duration-200 border border-blue-200 hover:border-blue-300">
          <i class="fas fa-eye mr-1.5"></i>查看
        </button>
      `);
    }

    if (this.options.actions.includes('edit')) {
      buttons.push(`
        <button data-action="edit" data-person-id="${personId}"
                class="inline-flex items-center px-3 py-1.5 text-sm text-yellow-600 hover:text-yellow-800 rounded-md transition-all duration-200 border border-yellow-200 hover:border-yellow-300">
          <i class="fas fa-pen mr-1.5"></i>编辑
        </button>
      `);
    }

    if (this.options.actions.includes('delete')) {
      buttons.push(`
        <button data-action="delete" data-person-id="${personId}"
                class="inline-flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-800 rounded-md transition-all duration-200 border border-red-200 hover:border-red-300 delete-btn">
          <i class="fas fa-trash mr-1.5"></i>删除
        </button>
      `);
    }

    return buttons.join('');
  }

  bindRowEvents() {
    // 移除之前的事件监听器，避免重复绑定
    this.container.removeEventListener('click', this.handleActionClick);

    // 使用箭头函数绑定，确保正确的this上下文
    this.handleActionClick = (e) => {
      if (this.isProcessing) return; // 如果正在处理，忽略点击

      const button = e.target.closest('button');
      if (!button) return;

      const action = button.getAttribute('data-action');
      const personId = button.getAttribute('data-person-id');

      if (!personId) return;

      // 如果是删除操作，立即禁用按钮并显示加载状态
      if (action === 'delete') {
        this.disableDeleteButton(button);
      }

      // 设置处理状态
      this.isProcessing = true;

      // 执行操作
      this.options.onAction?.(action, parseInt(personId));

      // 恢复处理状态（但删除按钮保持禁用直到页面刷新）
      if (action !== 'delete') {
        setTimeout(() => {
          this.isProcessing = false;
        }, 1000);
      }
    };

    this.container.addEventListener('click', this.handleActionClick);
  }

  // 禁用删除按钮并显示加载状态
  disableDeleteButton(button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1.5"></i>删除中';
    button.classList.add('opacity-50', 'cursor-not-allowed');
    button.classList.remove('hover:text-red-800', 'hover:border-red-300');
  }

  // 启用所有删除按钮（在重新渲染时调用）
  enableAllDeleteButtons() {
    const deleteButtons = this.container.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-trash mr-1.5"></i>删除';
      button.classList.remove('opacity-50', 'cursor-not-allowed');
      button.classList.add('hover:text-red-800', 'hover:border-red-300');
    });
    this.isProcessing = false;
  }

  showLoading() {
    this.container.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-8 text-center">
          <i class="fas fa-spinner fa-spin text-2xl text-blue-500 mb-2"></i>
          <p class="text-gray-500">${this.options.loadingMessage}</p>
        </td>
      </tr>
    `;
  }

  showEmpty() {
    this.container.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-8 text-center text-gray-500">
          <i class="fas fa-users text-4xl mb-2 opacity-50"></i>
          <p>${this.options.emptyMessage}</p>
        </td>
      </tr>
    `;
  }

  showError(message, onRetry) {
    this.container.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-8 text-center text-red-500">
          <i class="fas fa-triangle-exclamation text-2xl mb-2"></i>
          <p>${message}</p>
          ${onRetry ? `
            <button onclick="(${onRetry})()"
                    class="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
              重试
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }

  // 清理方法
  destroy() {
    if (this.handleActionClick) {
      this.container.removeEventListener('click', this.handleActionClick);
    }
  }

  // 保留原有的 formatDate 方法用于其他用途
  formatDate(dateString) {
    if (!dateString) return '未知';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    } catch (e) {
      return '日期错误';
    }
  }
}