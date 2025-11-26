// static/js/main.js
/**
 * 应用主入口文件
 * 负责初始化所有核心模块和页面组件
 */

class App {
    constructor() {
        this.initialized = false;
        this.modules = new Map();
    }

    /**
     * 初始化应用
     */
    async init() {
        if (this.initialized) {
            console.log('⚠️ 应用已经初始化过');
            return;
        }

        console.log('🚀 开始初始化应用...');

        try {
            // 等待DOM完全加载
            if (document.readyState === 'loading') {
                await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
            }

            // 初始化核心模块
            await this.initCoreModules();

            // 初始化页面组件
            await this.initPageComponents();

            this.initialized = true;
            console.log('✅ 应用初始化完成');

        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            this.showGlobalError('应用初始化失败，请刷新页面重试');
        }
    }

    /**
     * 初始化核心模块
     */
    async initCoreModules() {
        console.log('🔧 初始化核心模块...');

        // 检查核心模块是否已加载
        if (!window.DateUtils || !window.ApiService || !window.SimpleValidator || !window.MessageManager) {
            console.warn('⚠️ 核心模块未完全加载，等待中...');
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 验证核心模块
        const coreModules = [
            'DateUtils', 'FormUtils', 'DomUtils', 'ApiService', 'SimpleValidator', 'MessageManager'
        ];

        for (const moduleName of coreModules) {
            if (!window[moduleName]) {
                throw new Error(`核心模块 ${moduleName} 未加载`);
            }
        }

        console.log('✅ 核心模块初始化完成');
    }

    /**
     * 初始化页面组件
     */
    async initPageComponents() {
        console.log('📄 初始化页面组件...');

        // 根据当前页面初始化相应的组件
        const path = window.location.pathname;

        if (path.includes('/persons') || path === '/') {
            await this.initPersonPages();
        } else if (path.includes('/relationships')) {
            await this.initRelationshipPages();
        } else if (path.includes('/add')) {
            await this.initAddPages();
        }

        console.log('✅ 页面组件初始化完成');
    }

    /**
     * 初始化人员相关页面
     */
    async initPersonPages() {
        // 人员列表页面
        if (document.getElementById('persons-tbody')) {
            console.log('👥 初始化人员列表页面');
            await this.loadModule('personList', () => {
                window.personList = new PersonList();
                return window.personList.init();
            });
        }

        // 添加这行代码 - 初始化标签管理器
        if (document.getElementById('tab-add-person')) {
            console.log('🏷️ 初始化标签管理器');
            await this.loadModule('tabManager', () => {
                window.tabManager = new TabManager();
            });
        }

        // 人员详情模态框（如果存在）
        if (document.getElementById('view-person-modal')) {
            console.log('👤 初始化人员详情组件');
            await this.loadModule('personDetail', () => {
                window.personDetail = new PersonDetail();
            });
        }

        // 人员编辑模态框（如果存在）
        if (document.getElementById('edit-person-modal')) {
            console.log('✏️ 初始化人员编辑组件');
            await this.loadModule('personEdit', () => {
                window.personEdit = new PersonEdit();
            });
        }
    }

    /**
     * 初始化关系相关页面
     */
    async initRelationshipPages() {
        // 关系添加页面
        if (document.getElementById('relationshipInputManagerContainer')) {
            console.log('🔗 初始化关系添加页面');
            await this.loadModule('relationshipAdd', () => {
                window.relationshipAdd = new RelationshipAdd();
            });
        }

        // 标签管理器（如果存在）
        if (document.getElementById('tab-add-person')) {
            console.log('🏷️ 初始化标签管理器');
            await this.loadModule('tabManager', () => {
                window.tabManager = new TabManager();
            });
        }
    }

    /**
     * 初始化添加页面
     */
    async initAddPages() {
        // 人员添加页面
        if (document.getElementById('add-person-form')) {
            console.log('➕ 初始化人员添加页面');
            await this.loadModule('personAdd', () => {
                window.personAdd = new PersonAdd();
            });
        }

        // 关系添加页面
        if (document.getElementById('relationshipInputManagerContainer')) {
            console.log('🔗 初始化关系添加页面');
            await this.loadModule('relationshipAdd', () => {
                window.relationshipAdd = new RelationshipAdd();
            });
        }

        // 标签管理器（如果存在）
        if (document.getElementById('tab-add-person')) {
            console.log('🏷️ 初始化标签管理器');
            await this.loadModule('tabManager', () => {
                window.tabManager = new TabManager();
            });
        }
    }

    /**
     * 动态加载模块
     */
    async loadModule(moduleName, initFunction) {
        try {
            if (this.modules.has(moduleName)) {
                console.log(`⚠️ 模块 ${moduleName} 已经加载`);
                return;
            }

            console.log(`📦 加载模块: ${moduleName}`);
            await initFunction();
            this.modules.set(moduleName, true);
            console.log(`✅ 模块 ${moduleName} 加载成功`);

        } catch (error) {
            console.error(`❌ 模块 ${moduleName} 加载失败:`, error);
            throw error;
        }
    }

    /**
     * 显示全局错误
     */
    showGlobalError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed inset-0 bg-red-500 text-white flex items-center justify-center z-50';
        errorDiv.innerHTML = `
            <div class="text-center p-8">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <h2 class="text-2xl font-bold mb-2">应用错误</h2>
                <p class="mb-4">${message}</p>
                <button onclick="location.reload()"
                        class="bg-white text-red-500 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                    刷新页面
                </button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }

    /**
     * 获取应用状态
     */
    getStatus() {
        return {
            initialized: this.initialized,
            modules: Array.from(this.modules.keys()),
            coreModules: {
                DateUtils: !!window.DateUtils,
                ApiService: !!window.ApiService,
                SimpleValidator: !!window.SimpleValidator,
                MessageManager: !!window.MessageManager,
                DomUtils: !!window.DomUtils,
                FormUtils: !!window.FormUtils
            },
            pageComponents: {
                personList: !!window.personList,
                personDetail: !!window.personDetail,
                personEdit: !!window.personEdit,
                personAdd: !!window.personAdd,
                relationshipAdd: !!window.relationshipAdd,
                tabManager: !!window.tabManager
            }
        };
    }

    /**
     * 重新初始化应用
     */
    async reinit() {
        console.log('🔄 重新初始化应用...');
        this.initialized = false;
        this.modules.clear();
        await this.init();
    }

    /**
     * 销毁应用
     */
    destroy() {
        console.log('🧹 清理应用资源...');

        // 清理页面组件
        if (window.personList && typeof window.personList.destroy === 'function') {
            window.personList.destroy();
        }
        if (window.personAdd && typeof window.personAdd.destroy === 'function') {
            window.personAdd.destroy();
        }
        if (window.relationshipAdd && typeof window.relationshipAdd.destroy === 'function') {
            window.relationshipAdd.destroy();
        }

        this.initialized = false;
        this.modules.clear();
        console.log('✅ 应用资源清理完成');
    }
}

// 创建全局应用实例
window.App = new App();

// 页面加载完成后初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.App.init().catch(error => {
            console.error('应用初始化失败:', error);
        });
    });
} else {
    // DOM已经加载完成，直接初始化
    window.App.init().catch(error => {
        console.error('应用初始化失败:', error);
    });
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}