/**
 * 可复用的人员搜索组件
 */
class PersonSearch {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`容器元素未找到: ${containerId}`);
        }

        this.options = {
            placeholder: '输入成员姓名搜索...',
            allowClear: true,
            onPersonSelect: null,
            onPersonClear: null,
            searchOnBlur: true,
            searchOnEnter: true,
            minSearchLength: 1,
            ...options
        };

        this.selectedPerson = null;
        this.searchTimeout = null;
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        this.render();
        this.bindEvents();
    }

    /**
     * 渲染组件
     */
    render() {
        this.container.innerHTML = `
            <div class="relative">
                <input type="text"
                       class="personSearchInput w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                       placeholder="${this.options.placeholder}">
                <div class="personSuggestions absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg hidden max-h-60 overflow-y-auto"></div>
            </div>
            <div class="selectedPersonContainer mt-2 hidden">
                <div class="bg-green-50 border border-green-200 rounded-md p-2 flex justify-between items-center">
                    <span class="text-sm text-green-800">
                        <i class="fas fa-user mr-1"></i>
                        <span class="selectedPersonName"></span>
                    </span>
                    ${this.options.allowClear ? `
                    <button type="button" class="clearPersonBtn text-green-600 hover:text-green-800">
                        <i class="fas fa-times"></i>
                    </button>
                    ` : ''}
                </div>
            </div>
        `;

        // 缓存DOM元素
        this.searchInput = this.container.querySelector('.personSearchInput');
        this.suggestionsContainer = this.container.querySelector('.personSuggestions');
        this.selectedContainer = this.container.querySelector('.selectedPersonContainer');
        this.selectedName = this.container.querySelector('.selectedPersonName');
        this.clearBtn = this.container.querySelector('.clearPersonBtn');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 输入事件
        this.searchInput.addEventListener('input', (e) => {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
        });

        // 失去焦点事件
        if (this.options.searchOnBlur) {
            this.searchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    this.handleSearch(this.searchInput.value.trim());
                }, 200);
            });
        }

        // 回车键事件
        if (this.options.searchOnEnter) {
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSearch(this.searchInput.value.trim());
                }
            });
        }

        // 清除选择事件
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearSelection());
        }

        // 点击外部隐藏建议框
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }

    /**
     * 处理搜索
     */
    async handleSearch(keyword) {
        const searchTerm = keyword.trim();

        if (searchTerm.length < this.options.minSearchLength) {
            if (searchTerm.length > 0) {
                this.showSearchResults([], `请输入至少 ${this.options.minSearchLength} 个字符`);
            } else {
                this.hideSuggestions();
            }
            return;
        }

        try {
            this.showLoading();
            const persons = await this.searchPersons(searchTerm);
            this.showSearchResults(persons);
        } catch (error) {
            console.error('搜索人员失败:', error);
            this.showError('搜索失败，请重试');
        }
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        this.suggestionsContainer.innerHTML = `
            <div class="py-2 px-3 text-gray-500 flex items-center">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                搜索中...
            </div>
        `;
        this.showSuggestions();
    }

    /**
     * 搜索人员
     */
    async searchPersons(keyword) {
        try {
            const response = await fetch(`/api/persons/search?keyword=${encodeURIComponent(keyword)}`);
            if (response.ok) {
                const data = await response.json();
                return data.data || [];
            }
            return [];
        } catch (error) {
            console.error('API调用失败:', error);
            return [];
        }
    }

    /**
     * 显示搜索结果
     */
    showSearchResults(persons, emptyMessage = '未找到匹配的成员') {
        if (persons.length === 0) {
            this.suggestionsContainer.innerHTML = `
                <div class="py-2 px-3 text-gray-500">
                    ${emptyMessage}
                </div>
            `;
        } else {
            this.suggestionsContainer.innerHTML = persons.map(person => `
                <div class="personOption py-2 px-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                     data-id="${person.id}"
                     data-name="${person.name}"
                     data-gender="${person.gender}">
                    <div class="font-medium">${person.name}</div>
                    <div class="text-sm text-gray-500">
                        ${person.gender === 'M' ? '男' : '女'}
                        ${person.birth_date ? `· ${person.birth_date}` : ''}
                        ${person.birth_place ? `· ${person.birth_place}` : ''}
                    </div>
                </div>
            `).join('');

            // 绑定选择事件
            this.suggestionsContainer.querySelectorAll('.personOption').forEach(option => {
                option.addEventListener('click', () => this.selectPerson(option));
            });
        }

        this.showSuggestions();
    }

    /**
     * 选择人员
     */
    selectPerson(option) {
        this.selectedPerson = {
            id: parseInt(option.getAttribute('data-id')),
            name: option.getAttribute('data-name'),
            gender: option.getAttribute('data-gender')
        };

        this.updateSelectedDisplay();
        this.hideSuggestions();
        this.searchInput.value = '';

        // 回调函数
        if (this.options.onPersonSelect) {
            this.options.onPersonSelect(this.selectedPerson);
        }
    }

    /**
     * 更新选中显示
     */
    updateSelectedDisplay() {
        if (this.selectedPerson) {
            this.selectedName.textContent = `${this.selectedPerson.name} (${this.selectedPerson.gender === 'M' ? '男' : '女'})`;
            this.selectedContainer.classList.remove('hidden');
        } else {
            this.selectedContainer.classList.add('hidden');
        }
    }

    /**
     * 清空选择
     */
    clearSelection() {
        this.selectedPerson = null;
        this.updateSelectedDisplay();

        if (this.options.onPersonClear) {
            this.options.onPersonClear();
        }
    }

    /**
     * 显示建议框
     */
    showSuggestions() {
        this.suggestionsContainer.classList.remove('hidden');
    }

    /**
     * 隐藏建议框
     */
    hideSuggestions() {
        this.suggestionsContainer.classList.add('hidden');
    }

    /**
     * 显示错误
     */
    showError(message) {
        this.suggestionsContainer.innerHTML = `<div class="py-2 px-3 text-red-500">${message}</div>`;
        this.showSuggestions();
    }

    /**
     * 获取选中人员
     */
    getSelectedPerson() {
        return this.selectedPerson;
    }

    /**
     * 设置选中人员
     */
    setSelectedPerson(person) {
        this.selectedPerson = person;
        this.updateSelectedDisplay();
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.container.innerHTML = '';
    }
}