// static/js/formSubmitter.js

class FormSubmitter {
    constructor(formId, options = {}) {
        this.formId = formId;
        this.options = {
            endpoint: '/api/persons',
            method: 'POST',
            contentType: 'application/json',
            onSuccess: null,
            onError: null,
            onValidationError: null,
            ...options
        };
        this.form = document.getElementById(formId);
    }

    async submit(data, validator = null) {
        // 验证数据
        if (validator && typeof validator === 'function') {
            const validationResult = validator(data);
            if (!validationResult.isValid) {
                this.options.onValidationError?.(validationResult.errors);
                return { success: false, errors: validationResult.errors };
            }
        }

        this.showLoading(true);

        try {
            const response = await fetch(this.options.endpoint, {
                method: this.options.method,
                headers: {
                    'Content-Type': this.options.contentType,
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.options.onSuccess?.(result);
                return { success: true, data: result };
            } else {
                const error = new Error(result.error || '提交失败');
                this.options.onError?.(error);
                return { success: false, error: error };
            }
        } catch (error) {
            console.error('表单提交错误:', error);
            this.options.onError?.(error);
            return { success: false, error: error };
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const submitButton = this.form?.querySelector('button[type="submit"]');
        if (submitButton) {
            if (show) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> 提交中...';
                submitButton.classList.add('opacity-50');
            } else {
                submitButton.disabled = false;
                submitButton.innerHTML = submitButton.getAttribute('data-original-text') || '<i class="fas fa-floppy-disk mr-2"></i> 保存';
                submitButton.classList.remove('opacity-50');
            }
        }
    }

    setOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }
}