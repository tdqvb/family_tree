// static/js/utils/domHelper.js
class DomHelper {
    static escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static showElement(elementId, show = true) {
        const element = document.getElementById(elementId);
        if (element) {
            if (show) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    }

    static setElementRequired(elementId, required = true) {
        const element = document.getElementById(elementId);
        if (element) {
            element.required = required;
        }
    }

    static updateSaveButtonState(buttonId, hasChanges) {
        const saveButton = document.getElementById(buttonId);
        if (!saveButton) return;

        if (hasChanges) {
            saveButton.disabled = false;
            saveButton.classList.remove('opacity-50', 'cursor-not-allowed');
            saveButton.classList.add('hover:bg-green-700');
        } else {
            saveButton.disabled = true;
            saveButton.classList.add('opacity-50', 'cursor-not-allowed');
            saveButton.classList.remove('hover:bg-green-700');
        }
    }

    static showLoading(containerId, show = true, message = '加载中...') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (show) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12">
                    <i class="fas fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
                    <p class="text-gray-500">${message}</p>
                </div>
            `;
        }
    }
}

// 修改为浏览器全局导出
window.DomHelper = DomHelper;