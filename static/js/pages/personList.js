// static/js/pages/personList.js
class PersonList {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalPersons = 0;
        this.searchKeyword = '';
        this.searchGender = '';

        this.pagination = null;
        this.dataTable = null;
        this.isLoading = false;
    }

    async init() {
        // 确保 DOM 完全加载
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }

        // 添加短暂延迟确保所有元素都已渲染
        await new Promise(resolve => setTimeout(resolve, 100));

        this.initializeComponents();
        await this.loadPersons();
        this.initEventListeners();
    }

    initializeComponents() {
        // 初始化 DataTable 组件
        const tbody = document.getElementById('persons-tbody');
        if (tbody) {
            this.dataTable = new DataTable('persons-tbody', {
                currentPage: this.currentPage,
                pageSize: this.pageSize,
                onAction: (action, personId) => this.handleTableAction(action, personId)
            });
        } else {
            console.error('表格tbody未找到');
            return;
        }

        // 初始化 Pagination 组件
        const paginationContainer = document.querySelector('nav[aria-label="Pagination"]');
        if (paginationContainer) {
            this.pagination = new Pagination(
                paginationContainer,
                {
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    totalItems: this.totalPersons,
                    onPageChange: (page) => this.handlePageChange(page)
                }
            );
        } else {
            console.error('分页容器未找到');
        }
    }

    initEventListeners() {
        // 搜索表单提交事件
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch();
            });
        }

        // 搜索输入框事件
        const searchInput = document.getElementById('search-name');
        if (searchInput) {
            searchInput.addEventListener('blur', () => {
                this.searchKeyword = searchInput.value.trim();
                this.currentPage = 1;
                this.loadPersons();
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchKeyword = searchInput.value.trim();
                    this.currentPage = 1;
                    this.loadPersons();
                }
            });
        }

        // 性别筛选变化
        const genderFilter = document.getElementById('search-gender');
        if (genderFilter) {
            genderFilter.addEventListener('change', () => {
                this.searchGender = genderFilter.value;
                this.currentPage = 1;
                this.loadPersons();
            });
        }
    }

    async loadPersons() {
        if (this.isLoading) return; // 防止重复加载

        try {
            this.isLoading = true;

            // 检查组件是否就绪
            if (!this.dataTable) {
                this.initializeComponents();
            }

            this.dataTable?.showLoading();

            const params = {
                keyword: this.searchKeyword,
                gender: this.searchGender,
                skip: (this.currentPage - 1) * this.pageSize,
                limit: this.pageSize
            };

            const result = await ApiService.getPersons(params);
            const persons = result.data || [];
            this.totalPersons = result.total || 0;

            if (this.dataTable) {
                this.dataTable.render(persons);
                // 确保所有删除按钮都是启用状态
                this.dataTable.enableAllDeleteButtons();
            }

            this.updatePagination();

        } catch (error) {
            console.error('加载人员列表错误:', error);
            this.dataTable?.showError(
                '加载人员列表失败: ' + error.message,
                () => this.loadPersons()
            );
            // 出错时也要恢复按钮状态
            if (this.dataTable) {
                this.dataTable.enableAllDeleteButtons();
            }
        } finally {
            this.isLoading = false;
        }
    }

    updatePagination() {
        // 更新总数显示
        const totalSpan = document.getElementById('total-persons');
        if (totalSpan) {
            totalSpan.textContent = `共 ${this.totalPersons} 位人员`;
        }

        // 更新分页信息
        const rangeElement = document.getElementById('pagination-info');
        if (rangeElement) {
            const info = this.getPaginationInfo();
            rangeElement.textContent = info;
        }

        // 更新分页组件
        if (this.pagination) {
            this.pagination.update({
                currentPage: this.currentPage,
                totalItems: this.totalPersons,
                pageSize: this.pageSize
            });
        }
    }

    getPaginationInfo() {
        if (this.totalPersons === 0) {
            return '暂无数据';
        }

        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, this.totalPersons);

        return `显示第 ${start} 至 ${end} 条，共 ${this.totalPersons} 条`;
    }

    async handleTableAction(action, personId) {
        try {
            switch (action) {
                case 'view':
                    this.handleViewPerson(personId);
                    break;
                case 'edit':
                    this.handleEditPerson(personId);
                    break;
                case 'delete':
                    await this.deletePerson(personId);
                    break;
            }
        } catch (error) {
            console.error('处理表格操作错误:', error);
            // 出错时恢复按钮状态
            if (this.dataTable) {
                this.dataTable.enableAllDeleteButtons();
            }
        }
    }

    handleViewPerson(personId) {
        if (window.personDetail && typeof window.personDetail.viewPerson === 'function') {
            window.personDetail.viewPerson(personId);
        } else {
            this.showMessage('查看功能暂不可用，请刷新页面重试', 'error');
        }
    }

    handleEditPerson(personId) {
        if (window.personEdit && typeof window.personEdit.editPerson === 'function') {
            window.personEdit.editPerson(personId);
        } else {
            this.showMessage('编辑功能暂不可用，请刷新页面重试', 'error');
        }
    }

    async deletePerson(personId) {
        if (!confirm('确定要删除这个人员吗？此操作不可恢复。')) {
            // 如果用户取消，恢复按钮状态
            if (this.dataTable) {
                this.dataTable.enableAllDeleteButtons();
            }
            return;
        }

        try {
            await ApiService.deletePerson(personId);
            this.showMessage('人员删除成功！', 'success');

            // 删除成功后重新加载数据
            await this.loadPersons();

        } catch (error) {
            console.error('删除人员错误:', error);

            if (error.status === 404) {
                // 如果人员已经不存在，直接刷新列表
                this.showMessage('人员已被删除', 'info');
                await this.loadPersons();
            } else {
                this.showMessage('删除失败: ' + error.message, 'error');
                // 出错时恢复按钮状态
                if (this.dataTable) {
                    this.dataTable.enableAllDeleteButtons();
                }
            }
        }
    }

    handleSearch() {
        const searchInput = document.getElementById('search-name');
        const genderFilter = document.getElementById('search-gender');

        this.searchKeyword = searchInput ? searchInput.value.trim() : '';
        this.searchGender = genderFilter ? genderFilter.value : '';
        this.currentPage = 1;

        this.loadPersons();
    }

    handlePageChange(page) {
        this.currentPage = page;
        this.loadPersons();
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
        setTimeout(() => alertDiv.remove(), 3000);
    }

    // 清理方法
    destroy() {
        if (this.dataTable) {
            this.dataTable.destroy();
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.personList = new PersonList();
    window.personList.init().catch(error => {
        console.error('PersonList 初始化失败:', error);
    });
});