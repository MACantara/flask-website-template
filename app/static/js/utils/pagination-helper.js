/**
 * Pagination Helper Utility
 * Shared pagination functionality for generating pagination HTML and handling interactions
 */

export class PaginationHelper {
    constructor(options = {}) {
        this.options = {
            pageParam: 'page',
            perPageParam: 'per_page',
            defaultPerPage: 25,
            maxPagesVisible: 5,
            showJumpToPage: true,
            jumpToPageThreshold: 10,
            ...options
        };
    }

    /**
     * Generate pagination HTML
     * @param {Object} paginationData - Pagination data from backend
     * @param {string} baseUrl - Base URL for pagination links
     * @param {Object} extraParams - Extra URL parameters to maintain
     * @param {string} position - Position of pagination (top/bottom)
     * @returns {string} HTML string for pagination
     */
    generatePaginationHTML(paginationData, baseUrl, extraParams = {}, position = 'main') {
        const { pagination } = paginationData;
        
        if (!pagination || pagination.total === 0) {
            return '';
        }

        const buildUrl = (page, perPage = null) => {
            const url = new URL(baseUrl, window.location.origin);
            
            // Add extra parameters
            Object.entries(extraParams).forEach(([key, value]) => {
                if (value) url.searchParams.set(key, value);
            });
            
            // Add pagination parameters
            if (page) url.searchParams.set(this.options.pageParam, page);
            if (perPage) url.searchParams.set(this.options.perPageParam, perPage);
            else if (extraParams[this.options.perPageParam]) {
                url.searchParams.set(this.options.perPageParam, extraParams[this.options.perPageParam]);
            }
            
            return url.toString();
        };

        return `
            <div class="bg-gray-50 dark:bg-gray-700 px-6 py-${position === 'top' ? '4' : '3'} border ${position === 'top' ? 'border-gray-200 dark:border-gray-600' : 'border-t border-gray-200 dark:border-gray-600'} ${position === 'top' ? 'rounded-t-lg' : 'rounded-b-lg'}">
                <div class="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                    <!-- Results info -->
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                        Showing
                        <span class="font-medium text-gray-900 dark:text-white">${pagination.per_page * (pagination.page - 1) + 1}</span>
                        to
                        <span class="font-medium text-gray-900 dark:text-white">${pagination.page < pagination.pages ? pagination.per_page * pagination.page : pagination.total}</span>
                        of
                        <span class="font-medium text-gray-900 dark:text-white">${pagination.total}</span>
                        entries
                    </div>

                    ${pagination.pages > 1 ? this.generatePaginationControls(pagination, buildUrl, position) : this.generateSinglePageIndicator()}
                </div>

                ${this.shouldShowJumpToPage(pagination, position) ? this.generateJumpToPage(pagination) : ''}
            </div>
        `;
    }

    /**
     * Generate pagination controls
     */
    generatePaginationControls(pagination, buildUrl, position) {
        return `
            <div class="flex items-center">
                ${this.generatePreviousButton(pagination, buildUrl)}
                ${this.generatePageNumbers(pagination, buildUrl, position)}
                ${this.generateMobilePageInfo(pagination)}
                ${this.generateNextButton(pagination, buildUrl)}
            </div>
        `;
    }

    /**
     * Generate previous button
     */
    generatePreviousButton(pagination, buildUrl) {
        if (pagination.has_prev) {
            return `
                <a href="${buildUrl(pagination.prev_num)}" 
                   class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-l-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
                    <i class="bi bi-chevron-left mr-1"></i>
                    Previous
                </a>
            `;
        } else {
            return `
                <span class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-lg cursor-not-allowed">
                    <i class="bi bi-chevron-left mr-1"></i>
                    Previous
                </span>
            `;
        }
    }

    /**
     * Generate page numbers
     */
    generatePageNumbers(pagination, buildUrl, position) {
        const maxVisible = this.options.maxPagesVisible;
        
        if (pagination.pages <= maxVisible) {
            return this.generateAllPageNumbers(pagination, buildUrl);
        } else {
            return this.generateTruncatedPageNumbers(pagination, buildUrl, position);
        }
    }

    /**
     * Generate all page numbers (when total pages <= maxVisible)
     */
    generateAllPageNumbers(pagination, buildUrl) {
        let html = '<div class="hidden sm:flex">';
        
        for (let page = 1; page <= pagination.pages; page++) {
            if (page === pagination.page) {
                html += `
                    <span class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-t border-b border-blue-300 dark:border-blue-600 z-10">
                        ${page}
                    </span>
                `;
            } else {
                html += `
                    <a href="${buildUrl(page)}" 
                       class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border-t border-b border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
                        ${page}
                    </a>
                `;
            }
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Generate truncated page numbers with dropdown
     */
    generateTruncatedPageNumbers(pagination, buildUrl, position) {
        let html = '<div class="hidden sm:flex">';
        
        // First 2 pages
        for (let page = 1; page <= 2; page++) {
            if (page === pagination.page) {
                html += `
                    <span class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-t border-b border-blue-300 dark:border-blue-600 z-10">
                        ${page}
                    </span>
                `;
            } else {
                html += `
                    <a href="${buildUrl(page)}" 
                       class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border-t border-b border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
                        ${page}
                    </a>
                `;
            }
        }

        // Middle section
        if (pagination.page <= 2 || pagination.page >= pagination.pages - 1) {
            // Show dropdown for middle pages
            html += this.generateMiddleDropdown(pagination, buildUrl, position);
        } else {
            // Show current page
            html += `
                <span class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-t border-b border-blue-300 dark:border-blue-600 z-10">
                    ${pagination.page}
                </span>
            `;
        }

        // Last 2 pages
        for (let page = pagination.pages - 1; page <= pagination.pages; page++) {
            if (page === pagination.page) {
                html += `
                    <span class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-t border-b border-blue-300 dark:border-blue-600 z-10">
                        ${page}
                    </span>
                `;
            } else {
                html += `
                    <a href="${buildUrl(page)}" 
                       class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border-t border-b border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
                        ${page}
                    </a>
                `;
            }
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Generate middle dropdown for page selection
     */
    generateMiddleDropdown(pagination, buildUrl, position) {
        const dropdownId = `page-menu-${position}`;
        const buttonId = `page-dropdown-${position}`;
        
        let dropdownItems = '';
        for (let page = 3; page < pagination.pages - 1; page++) {
            dropdownItems += `
                <a href="${buildUrl(page)}"
                   class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                    Page ${page}
                </a>
            `;
        }

        return `
            <div class="relative inline-block">
                <button type="button" id="${buttonId}" 
                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border-t border-b border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 cursor-pointer"
                        data-dropdown-toggle="${dropdownId}">
                    <i class="bi bi-three-dots"></i>
                </button>
                <div id="${dropdownId}" class="hidden absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-48 overflow-y-auto">
                    <div class="py-1">
                        ${dropdownItems}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate mobile page info
     */
    generateMobilePageInfo(pagination) {
        return `
            <div class="sm:hidden">
                <span class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-t border-b border-gray-300 dark:border-gray-600">
                    ${pagination.page} of ${pagination.pages}
                </span>
            </div>
        `;
    }

    /**
     * Generate next button
     */
    generateNextButton(pagination, buildUrl) {
        if (pagination.has_next) {
            return `
                <a href="${buildUrl(pagination.next_num)}" 
                   class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-r-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
                    Next
                    <i class="bi bi-chevron-right ml-1"></i>
                </a>
            `;
        } else {
            return `
                <span class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg cursor-not-allowed">
                    Next
                    <i class="bi bi-chevron-right ml-1"></i>
                </span>
            `;
        }
    }

    /**
     * Generate single page indicator
     */
    generateSinglePageIndicator() {
        return `
            <div class="text-sm text-gray-500 dark:text-gray-400">
                Page 1 of 1
            </div>
        `;
    }

    /**
     * Check if jump to page should be shown
     */
    shouldShowJumpToPage(pagination, position) {
        return this.options.showJumpToPage && 
               pagination.pages > this.options.jumpToPageThreshold && 
               position === 'bottom';
    }

    /**
     * Generate jump to page section
     */
    generateJumpToPage(pagination) {
        return `
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div class="flex items-center justify-center space-x-2">
                    <label for="jumpToPage" class="text-sm text-gray-500 dark:text-gray-400">Jump to page:</label>
                    <input type="number" id="jumpToPage" min="1" max="${pagination.pages}"
                        placeholder="${pagination.page}"
                        class="w-20 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-center">
                    <button id="jumpButton"
                        class="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200">
                        Go
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Initialize pagination functionality
     */
    initializePagination(container) {
        // Initialize dropdown functionality for pagination dropdowns
        if (window.dropdownManager) {
            const dropdowns = container.querySelectorAll('[id^="page-dropdown-"]');
            dropdowns.forEach(button => {
                const dropdownId = button.getAttribute('data-dropdown-toggle');
                const dropdown = document.getElementById(dropdownId);
                if (dropdown) {
                    window.dropdownManager.register(dropdownId, button, dropdown);
                }
            });
        }

        // Initialize jump to page functionality
        this.initializeJumpToPage(container);
    }

    /**
     * Initialize jump to page functionality
     */
    initializeJumpToPage(container) {
        const jumpInput = container.querySelector('#jumpToPage');
        const jumpButton = container.querySelector('#jumpButton');

        if (jumpInput && jumpButton) {
            jumpButton.addEventListener('click', () => {
                this.handleJumpToPage(jumpInput);
            });

            jumpInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleJumpToPage(jumpInput);
                }
            });

            // Input validation
            jumpInput.addEventListener('input', function() {
                const value = parseInt(this.value);
                const max = parseInt(this.getAttribute('max'));
                const min = parseInt(this.getAttribute('min'));
                
                if (value > max) this.value = max;
                else if (value < min) this.value = min;
            });
        }
    }

    /**
     * Handle jump to page action
     */
    handleJumpToPage(input) {
        const pageNumber = parseInt(input.value);
        const maxPages = parseInt(input.getAttribute('max'));

        if (isNaN(pageNumber) || pageNumber < 1) {
            this.showAlert('Please enter a valid page number.', 'error');
            input.focus();
            return;
        }

        if (pageNumber > maxPages) {
            this.showAlert(`Page number cannot exceed ${maxPages}.`, 'error');
            input.value = maxPages;
            input.focus();
            return;
        }

        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set(this.options.pageParam, pageNumber);
        
        this.showLoadingState(`Jumping to page ${pageNumber}...`);
        window.location.href = currentUrl.toString();
    }

    /**
     * Show alert message
     */
    showAlert(message, type = 'info') {
        // Use existing alert functions if available
        if (window.showPaginationAlert) {
            window.showPaginationAlert(message, type);
        } else if (window.showAlert) {
            window.showAlert(message, type);
        } else {
            alert(message);
        }
    }

    /**
     * Show loading state
     */
    showLoadingState(message = 'Loading...') {
        // Use existing loading functions if available
        if (window.showPaginationLoadingState) {
            window.showPaginationLoadingState(message);
        }
    }
}

// Create and export a default instance
const paginationHelper = new PaginationHelper();

export { paginationHelper };
export default paginationHelper;

// Global utility for non-module scripts
if (typeof window !== 'undefined') {
    window.PaginationHelper = PaginationHelper;
    window.paginationHelper = paginationHelper;
}
