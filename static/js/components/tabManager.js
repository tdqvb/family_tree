// static/js/components/tabManager.js
class TabManager {
    constructor() {
        this.tabs = [
            {
                id: 'add-person',
                button: 'tab-add-person',
                content: 'tab-content-add-person'
            },
            {
                id: 'add-relationship',
                button: 'tab-add-relationship',
                content: 'tab-content-add-relationship'
            }
        ];
        this.init();
    }

    init() {
        this.tabs.forEach(tab => {
            const button = document.getElementById(tab.button);
            const content = document.getElementById(tab.content);

            if (button && content) {
                button.addEventListener('click', () => {
                    this.switchTab(tab.id);
                });
            }
        });

        // 默认激活第一个标签
        this.switchTab('add-person');
    }

    switchTab(tabId) {
        this.tabs.forEach(tab => {
            const button = document.getElementById(tab.button);
            const content = document.getElementById(tab.content);

            if (button && content) {
                if (tab.id === tabId) {
                    // 激活当前标签
                    button.classList.add('active', 'text-blue-600', 'border-blue-600', 'bg-blue-50');
                    button.classList.remove('text-gray-500', 'hover:text-gray-700', 'hover:bg-gray-50');
                    content.classList.remove('hidden');
                } else {
                    // 隐藏其他标签
                    button.classList.remove('active', 'text-blue-600', 'border-blue-600', 'bg-blue-50');
                    button.classList.add('text-gray-500', 'hover:text-gray-700', 'hover:bg-gray-50');
                    content.classList.add('hidden');
                }
            }
        });

        // 触发自定义事件，通知标签切换
        this.onTabChange(tabId);
    }

    onTabChange(tabId) {
        // 可以在这里添加标签切换后的回调逻辑
        console.log(`切换到标签: ${tabId}`);

        // 如果是亲属关系标签，确保关系管理器已初始化
        if (tabId === 'add-relationship' && window.relationshipManager) {
            // 重新加载成员列表
            window.relationshipManager.loadExistingMembers();
        }
    }

    // 外部调用的方法，用于切换到特定标签
    showTab(tabId) {
        this.switchTab(tabId);
    }

    // 获取当前激活的标签ID
    getActiveTab() {
        return this.tabs.find(tab => {
            const button = document.getElementById(tab.button);
            return button && button.classList.contains('active');
        })?.id;
    }
}

// 初始化标签管理器
let tabManager;

document.addEventListener('DOMContentLoaded', function() {
    tabManager = new TabManager();
});