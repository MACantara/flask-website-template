document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin functionality
    initializeConfirmationDialogs();
    initializeTabSwitching();
    initializeLogTypeChange();
    initializePagination();
});

/**
 * Initialize confirmation dialogs for destructive actions
 */
function initializeConfirmationDialogs() {
    // Handle cleanup logs confirmation
    const cleanupForm = document.querySelector('form[action*="cleanup"]');
    if (cleanupForm) {
        const submitButton = cleanupForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.addEventListener('click', function(e) {
                if (!confirm('Are you sure you want to clean up old logs? This action cannot be undone.')) {
                    e.preventDefault();
                }
            });
        }
    }

    // Handle user status toggle confirmations
    const statusToggleForms = document.querySelectorAll('form[action*="toggle-status"]');
    statusToggleForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const button = form.querySelector('button[type="submit"]');
            const action = button.textContent.trim();
            if (!confirm(`Are you sure you want to ${action.toLowerCase()}?`)) {
                e.preventDefault();
            }
        });
    });

    // Handle admin privilege toggle confirmations
    const adminToggleForms = document.querySelectorAll('form[action*="toggle-admin"]');
    adminToggleForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const button = form.querySelector('button[type="submit"]');
            const action = button.textContent.trim();
            if (!confirm(`Are you sure you want to ${action.toLowerCase()}?`)) {
                e.preventDefault();
            }
        });
    });
}

/**
 * Initialize tab switching functionality for user detail pages
 */
function initializeTabSwitching() {
    // Add event listeners to tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.id.replace('tab-', '');
            switchTab(tabName);
        });
    });

    // Initialize first tab as active if tabs exist
    if (tabButtons.length > 0) {
        const firstTabId = tabButtons[0].id.replace('tab-', '');
        switchTab(firstTabId);
    }
}

/**
 * Switch between tabs in user detail view
 * @param {string} tabName - The name of the tab to switch to
 */
function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.add('hidden');
    });
    
    // Remove active styles from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('border-blue-500', 'text-blue-600', 'dark:text-blue-400');
        button.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300', 'dark:text-gray-400', 'dark:hover:text-gray-300');
    });
    
    // Show selected tab content
    const selectedContent = document.getElementById('content-' + tabName);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }
    
    // Add active styles to selected tab button
    const selectedButton = document.getElementById('tab-' + tabName);
    if (selectedButton) {
        selectedButton.classList.add('border-blue-500', 'text-blue-600', 'dark:text-blue-400');
        selectedButton.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300', 'dark:text-gray-400', 'dark:hover:text-gray-300');
    }
}

/**
 * Initialize log type change functionality
 */
function initializeLogTypeChange() {
    const logTypeSelect = document.getElementById('logType');
    if (logTypeSelect) {
        logTypeSelect.addEventListener('change', function() {
            changeLogType();
        });
        
        // Add focus and blur effects for better UX
        logTypeSelect.addEventListener('focus', function() {
            this.parentElement.classList.add('ring-2', 'ring-blue-500', 'dark:ring-blue-400');
        });
        
        logTypeSelect.addEventListener('blur', function() {
            this.parentElement.classList.remove('ring-2', 'ring-blue-500', 'dark:ring-blue-400');
        });
    }
}

/**
 * Handle log type filter change
 */
function changeLogType() {
    const select = document.getElementById('logType');
    if (select) {
        const selectedType = select.value;
        // Get the current URL and update the type parameter
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set('type', selectedType);
        currentUrl.searchParams.delete('page'); // Reset to first page when changing type
        window.location.href = currentUrl.toString();
    }
}

/**
 * Initialize pagination functionality
 */
function initializePagination() {
    // Handle items per page change
    const perPageSelect = document.getElementById('perPage');
    if (perPageSelect) {
        perPageSelect.addEventListener('change', function() {
            changeItemsPerPage(this.value);
        });
    }
    
    // Handle page jump functionality
    const jumpToPageInput = document.getElementById('jumpToPage');
    const jumpButton = document.getElementById('jumpButton');
    
    if (jumpToPageInput && jumpButton) {
        jumpButton.addEventListener('click', function() {
            jumpToPage();
        });
        
        jumpToPageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                jumpToPage();
            }
        });
    }
}

/**
 * Change items per page
 * @param {string} perPage - Number of items per page
 */
function changeItemsPerPage(perPage) {
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set('per_page', perPage);
    currentUrl.searchParams.delete('page'); // Reset to first page when changing items per page
    window.location.href = currentUrl.toString();
}

/**
 * Jump to specific page
 */
function jumpToPage() {
    const jumpToPageInput = document.getElementById('jumpToPage');
    if (!jumpToPageInput) return;
    
    const pageNumber = parseInt(jumpToPageInput.value);
    if (isNaN(pageNumber) || pageNumber < 1) {
        showAdminAlert('Please enter a valid page number.', 'error');
        return;
    }
    
    // Get max pages from the pagination info
    const paginationInfo = document.querySelector('.text-sm.text-gray-500');
    if (paginationInfo) {
        const maxPages = parseInt(jumpToPageInput.getAttribute('max'));
        if (pageNumber > maxPages) {
            showAdminAlert(`Page number cannot exceed ${maxPages}.`, 'error');
            return;
        }
    }
    
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set('page', pageNumber);
    window.location.href = currentUrl.toString();
}

/**
 * Utility function to show admin alerts
 * @param {string} message - The message to display
 * @param {string} type - The type of alert (success, error, warning, info)
 */
function showAdminAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md alert-${type}`;
    
    // Set colors based on type
    const colorClasses = {
        success: 'bg-green-100 border border-green-400 text-green-700',
        error: 'bg-red-100 border border-red-400 text-red-700',
        warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700',
        info: 'bg-blue-100 border border-blue-400 text-blue-700'
    };
    
    alertDiv.className += ` ${colorClasses[type] || colorClasses.info}`;
    
    alertDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button type="button" class="ml-4 text-lg font-bold hover:opacity-70" onclick="this.parentElement.parentElement.remove()">
                ×
            </button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

/**
 * Handle AJAX requests for admin actions
 * @param {string} url - The URL to send the request to
 * @param {string} method - The HTTP method (GET, POST, etc.)
 * @param {Object} data - The data to send with the request
 * @returns {Promise} - Promise that resolves with the response
 */
async function adminAjaxRequest(url, method = 'GET', data = null) {
    const config = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    };
    
    if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Admin AJAX request failed:', error);
        showAdminAlert('An error occurred while processing your request.', 'error');
        throw error;
    }
}

/**
 * Export functions for use in other scripts if needed
 */
window.adminJS = {
    switchTab,
    changeLogType,
    showAdminAlert,
    adminAjaxRequest
};
