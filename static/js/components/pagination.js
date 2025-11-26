// static/js/components/pagination.js
class Pagination {
  constructor(container, options = {}) {
    this.container = container;
    this.currentPage = options.currentPage || 1;
    this.pageSize = options.pageSize || 10;
    this.totalItems = options.totalItems || 0;
    this.onPageChange = options.onPageChange;
    this.maxVisiblePages = options.maxVisiblePages || 5;

    // 保存原始的上一页和下一页按钮
    this.originalPrevBtn = container.querySelector('#prev-page');
    this.originalNextBtn = container.querySelector('#next-page');
  }

  update(options) {
    Object.assign(this, options);
    this.render();
  }

  render() {
    const totalPages = Math.ceil(this.totalItems / this.pageSize);

    if (totalPages <= 1) {
      // 只有一页时隐藏分页控件
      this.container.style.display = 'none';
      return;
    } else {
      this.container.style.display = 'inline-flex';
    }

    // 生成页码按钮HTML
    const pagesHTML = this.generatePaginationHTML(totalPages);

    // 找到页码按钮的插入位置（在上一页按钮之后，下一页按钮之前）
    const prevBtn = this.container.querySelector('#prev-page');
    const nextBtn = this.container.querySelector('#next-page');

    if (prevBtn && nextBtn) {
      // 移除现有的页码按钮
      const existingPageButtons = this.container.querySelectorAll('[data-page]');
      existingPageButtons.forEach(btn => btn.remove());

      // 插入新的页码按钮
      prevBtn.insertAdjacentHTML('afterend', pagesHTML);
    }

    this.bindEvents();
    this.updateButtonStates(totalPages);
  }

  generatePaginationHTML(totalPages) {
    const startPage = Math.max(1, this.currentPage - Math.floor(this.maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + this.maxVisiblePages - 1);

    let pagesHTML = '';

    // 页码按钮
    for (let i = startPage; i <= endPage; i++) {
      pagesHTML += `
        <a href="#" data-page="${i}"
           class="relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
             i === this.currentPage
               ? 'bg-blue-600 text-white border-blue-600'
               : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
           }">
          ${i}
        </a>
      `;
    }

    return pagesHTML;
  }

  bindEvents() {
    // 页码点击事件
    this.container.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(link.getAttribute('data-page'));
        this.handlePageChange(page);
      });
    });

    // 上一页事件 - 使用保存的原始按钮
    if (this.originalPrevBtn) {
      this.originalPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.currentPage > 1) {
          this.handlePageChange(this.currentPage - 1);
        }
      });
    }

    // 下一页事件 - 使用保存的原始按钮
    if (this.originalNextBtn) {
      this.originalNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const totalPages = Math.ceil(this.totalItems / this.pageSize);
        if (this.currentPage < totalPages) {
          this.handlePageChange(this.currentPage + 1);
        }
      });
    }
  }

  handlePageChange(page) {
    this.currentPage = page;
    this.onPageChange?.(page);
  }

  updateButtonStates(totalPages) {
    const prevBtn = this.container.querySelector('#prev-page');
    const nextBtn = this.container.querySelector('#next-page');

    if (prevBtn) {
      if (this.currentPage === 1) {
        prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
        prevBtn.classList.remove('hover:bg-gray-50');
      } else {
        prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        prevBtn.classList.add('hover:bg-gray-50');
      }
    }

    if (nextBtn) {
      if (this.currentPage === totalPages || totalPages === 0) {
        nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
        nextBtn.classList.remove('hover:bg-gray-50');
      } else {
        nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        nextBtn.classList.add('hover:bg-gray-50');
      }
    }
  }

  getPaginationInfo() {
    if (this.totalItems === 0) {
      return '暂无数据';
    }

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);

    return `显示第 ${start} 至 ${end} 条，共 ${this.totalItems} 条`;
  }
}