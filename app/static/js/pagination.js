/**
 * Pagination JavaScript Module
 * Handles pagination dropdown functionality and page navigation
 */

import dropdownManager from './utils/dropdown-toggle.js';
import paginationHelper from './utils/pagination-helper.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dropdown manager
    dropdownManager.init();
    
    initializePaginationDropdown();
    initializePageJump();
    initializePaginationContainers();
});

/**
 * Initialize pagination containers using the helper utility
 */
function initializePaginationContainers() {
    const paginationContainers = document.querySelectorAll('.pagination-container');
    paginationContainers.forEach(container => {
        paginationHelper.initializePagination(container);
    });
}

/**
 * Initialize pagination dropdown functionality
 */
function initializePaginationDropdown() {
    // Register pagination-specific dropdowns with the dropdown manager
    const paginationDropdowns = document.querySelectorAll('[id^="page-dropdown-"]');
    paginationDropdowns.forEach(button => {
        const dropdownId = button.getAttribute('data-dropdown-toggle');
        const dropdown = document.getElementById(dropdownId);
        
        if (dropdown) {
            // Register with dropdown manager
            dropdownManager.register(dropdownId, button, dropdown);
        }
    });

    // Listen for dropdown events if needed for pagination-specific logic
    document.addEventListener('dropdown:open', function(event) {
        const { dropdownId } = event.detail;
        if (dropdownId && dropdownId.includes('page-menu')) {
            // Pagination-specific logic when dropdown opens
            console.log('Pagination dropdown opened:', dropdownId);
        }
    });
}

/**
 * Toggle pagination dropdown (legacy support)
 * @param {string} dropdownId - The ID of the dropdown to toggle
 */
function togglePaginationDropdown(dropdownId) {
    dropdownManager.toggle(dropdownId);
}

/**
 * Initialize page jump functionality
 */
function initializePageJump() {
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
        
        // Add input validation
        jumpToPageInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            const max = parseInt(this.getAttribute('max'));
            const min = parseInt(this.getAttribute('min'));
            
            if (value > max) {
                this.value = max;
            } else if (value < min) {
                this.value = min;
            }
        });
    }
}

/**
 * Jump to specific page
 */
function jumpToPage() {
    const jumpToPageInput = document.getElementById('jumpToPage');
    if (!jumpToPageInput) return;
    
    const pageNumber = parseInt(jumpToPageInput.value);
    if (isNaN(pageNumber) || pageNumber < 1) {
        showPaginationAlert('Please enter a valid page number.', 'error');
        jumpToPageInput.focus();
        return;
    }
    
    // Get max pages from the pagination info
    const maxPages = parseInt(jumpToPageInput.getAttribute('max'));
    if (pageNumber > maxPages) {
        showPaginationAlert(`Page number cannot exceed ${maxPages}.`, 'error');
        jumpToPageInput.value = maxPages;
        jumpToPageInput.focus();
        return;
    }
    
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set('page', pageNumber);
    
    // Show loading state
    showPaginationLoadingState(`Jumping to page ${pageNumber}...`);
    
    window.location.href = currentUrl.toString();
}

/**
 * Change items per page (generic function for any paginated content)
 * @param {string} perPage - Number of items per page
 * @param {string} pageParam - The page parameter name (default: 'page')
 * @param {string} perPageParam - The per page parameter name (default: 'per_page')
 */
function changeItemsPerPage(perPage, pageParam = 'page', perPageParam = 'per_page') {
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set(perPageParam, perPage);
    currentUrl.searchParams.delete(pageParam); // Reset to first page when changing items per page
    
    // Show loading state
    showPaginationLoadingState('Updating page size...');
    
    window.location.href = currentUrl.toString();
}

/**
 * Navigate to specific page (generic function for any paginated content)
 * @param {number} pageNumber - The page number to navigate to
 * @param {string} pageParam - The page parameter name (default: 'page')
 */
function navigateToPage(pageNumber, pageParam = 'page') {
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set(pageParam, pageNumber);
    
    // Show loading state
    showPaginationLoadingState(`Loading page ${pageNumber}...`);
    
    window.location.href = currentUrl.toString();
}

/**
 * Show loading state for pagination operations
 * @param {string} message - Loading message to display
 */
function showPaginationLoadingState(message = 'Loading...') {
    // Create or update loading overlay
    let loadingOverlay = document.getElementById('pagination-loading-overlay');
    
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'pagination-loading-overlay';
        loadingOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        loadingOverlay.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                <div class="flex items-center space-x-3">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span class="text-gray-900 dark:text-white font-medium" id="pagination-loading-message">${message}</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(loadingOverlay);
    } else {
        document.getElementById('pagination-loading-message').textContent = message;
        loadingOverlay.classList.remove('hidden');
    }
}

/**
 * Hide loading state
 */
function hidePaginationLoadingState() {
    const loadingOverlay = document.getElementById('pagination-loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

/**
 * Show pagination-specific alerts
 * @param {string} message - The message to display
 * @param {string} type - The type of alert (success, error, warning, info)
 */
function showPaginationAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md pagination-alert-${type}`;
    
    // Set colors based on type
    const colorClasses = {
        success: 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/90 dark:border-green-600 dark:text-green-300',
        error: 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/90 dark:border-red-600 dark:text-red-300',
        warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700 dark:bg-yellow-900/90 dark:border-yellow-600 dark:text-yellow-300',
        info: 'bg-blue-100 border border-blue-400 text-blue-700 dark:bg-blue-900/90 dark:border-blue-600 dark:text-blue-300'
    };
    
    alertDiv.className += ` ${colorClasses[type] || colorClasses.info}`;
    
    // Add icon based on type
    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-exclamation-triangle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill'
    };
    
    alertDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <i class="bi ${icons[type] || icons.info} mr-2"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="ml-4 text-lg font-bold hover:opacity-70 transition-opacity duration-200" onclick="this.parentElement.parentElement.remove()">
                ×
            </button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Add entrance animation
    setTimeout(() => {
        alertDiv.classList.add('animate-fade-in-right');
    }, 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.style.opacity = '0';
            alertDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                alertDiv.remove();
            }, 300);
        }
    }, 5000);
}

/**
 * Handle keyboard shortcuts for pagination
 */
function initializePaginationKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + J to focus on page jump
        if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
            e.preventDefault();
            const jumpToPageInput = document.getElementById('jumpToPage');
            if (jumpToPageInput) {
                jumpToPageInput.focus();
                showPaginationAlert('Page jump focused. Enter page number and press Enter.', 'info');
            }
        }
        
        // Arrow key navigation for pagination
        if (e.key === 'ArrowLeft' && e.ctrlKey) {
            e.preventDefault();
            // Navigate to previous page
            const prevLink = document.querySelector('a[href*="page="]:contains("Previous")');
            if (prevLink) {
                prevLink.click();
            }
        }
        
        if (e.key === 'ArrowRight' && e.ctrlKey) {
            e.preventDefault();
            // Navigate to next page
            const nextLink = document.querySelector('a[href*="page="]:contains("Next")');
            if (nextLink) {
                nextLink.click();
            }
        }
    });
}

/**
 * Initialize all pagination functionality
 */
function initializePaginationFunctionality() {
    initializePaginationDropdown();
    initializePageJump();
    initializePaginationKeyboardShortcuts();
}

// Auto-initialize pagination functionality
if (document.querySelector('[id^="page-dropdown-"], #jumpToPage')) {
    document.addEventListener('DOMContentLoaded', initializePaginationFunctionality);
}

/**
 * Export functions for use in other scripts
 */
export {
    togglePaginationDropdown,
    jumpToPage,
    changeItemsPerPage,
    navigateToPage,
    showPaginationAlert,
    showPaginationLoadingState,
    hidePaginationLoadingState,
    initializePaginationDropdown,
    initializePageJump
};

// Legacy global export
window.paginationJS = {
    togglePaginationDropdown,
    jumpToPage,
    changeItemsPerPage,
    navigateToPage,
    showPaginationAlert,
    showPaginationLoadingState,
    hidePaginationLoadingState,
    initializePaginationDropdown,
    initializePageJump
};
