/**
 * Flash Messages Utility
 * Handles flash message dismissal and auto-hide functionality
 */

export class FlashMessageManager {
    constructor() {
        this.autoHideDelay = 5000; // 5 seconds
        this.animationDuration = 300; // 300ms
    }

    /**
     * Initialize flash message functionality
     */
    init() {
        this.setupDismissHandlers();
        this.setupAutoHide();
    }

    /**
     * Setup dismiss button handlers
     */
    setupDismissHandlers() {
        document.querySelectorAll('[data-dismiss-flash]').forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                this.dismissMessage(button);
            });
        });
    }

    /**
     * Setup auto-hide functionality
     */
    setupAutoHide() {
        document.querySelectorAll('[data-flash-message]').forEach(message => {
            setTimeout(() => {
                if (message.parentNode) {
                    this.dismissMessage(message.querySelector('[data-dismiss-flash]') || message);
                }
            }, this.autoHideDelay);
        });
    }

    /**
     * Dismiss a flash message
     * @param {HTMLElement} element - The dismiss button or message element
     */
    dismissMessage(element) {
        const flashMessage = element.closest('[data-flash-message]');
        if (flashMessage) {
            flashMessage.style.transform = 'translateX(100%)';
            flashMessage.style.opacity = '0';
            flashMessage.style.transition = `all ${this.animationDuration}ms ease-in-out`;
            
            setTimeout(() => {
                flashMessage.remove();
            }, this.animationDuration);
        }
    }

    /**
     * Create and show a new flash message
     * @param {string} message - The message text
     * @param {string} category - The message category (success, error, warning, info)
     */
    showMessage(message, category = 'info') {
        const messageElement = this.createMessageElement(message, category);
        const container = document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.mt-4') || document.body;
        
        container.insertBefore(messageElement, container.firstChild);
        
        // Setup handlers for the new message
        const dismissButton = messageElement.querySelector('[data-dismiss-flash]');
        if (dismissButton) {
            dismissButton.addEventListener('click', (event) => {
                event.preventDefault();
                this.dismissMessage(dismissButton);
            });
        }

        // Auto-hide the new message
        setTimeout(() => {
            if (messageElement.parentNode) {
                this.dismissMessage(dismissButton || messageElement);
            }
        }, this.autoHideDelay);
    }

    /**
     * Create a flash message element
     * @param {string} message - The message text
     * @param {string} category - The message category
     * @returns {HTMLElement} - The created message element
     */
    createMessageElement(message, category) {
        const messageDiv = document.createElement('div');
        
        const categoryClasses = {
            success: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700',
            error: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700',
            warning: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700',
            info: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
        };

        const buttonClasses = {
            success: 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200',
            error: 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200',
            warning: 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200',
            info: 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200'
        };

        messageDiv.className = `flex items-center justify-between p-4 mb-4 text-sm rounded-xl shadow-lg animate-slide-down ${categoryClasses[category] || categoryClasses.info}`;
        messageDiv.setAttribute('data-flash-message', '');

        messageDiv.innerHTML = `
            <span class="font-medium">${message}</span>
            <button type="button" class="ml-4 text-lg font-bold cursor-pointer hover:scale-110 transition-transform duration-200 ${buttonClasses[category] || buttonClasses.info}" data-dismiss-flash>
                <i class="bi bi-x"></i>
            </button>
        `;

        return messageDiv;
    }
}

// Create and export default instance
const flashMessageManager = new FlashMessageManager();

export { flashMessageManager };
export default flashMessageManager;

// Global utility for non-module scripts
if (typeof window !== 'undefined') {
    window.FlashMessageManager = FlashMessageManager;
    window.flashMessageManager = flashMessageManager;
    
    // Global utility function
    window.showFlashMessage = function(message, category = 'info') {
        flashMessageManager.showMessage(message, category);
    };
}
