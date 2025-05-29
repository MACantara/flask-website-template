import dropdownManager from './utils/dropdown-toggle.js';

// Mobile menu toggle
document.addEventListener("DOMContentLoaded", function () {
    // Initialize dropdown manager
    dropdownManager.init();
    
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const mobileMenu = document.getElementById("mobile-menu");

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("hidden");
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener("click", function (event) {
        const mobileMenu = document.getElementById("mobile-menu");
        const mobileMenuButton = document.getElementById("mobile-menu-button");
        
        if (
            mobileMenu &&
            !mobileMenu.contains(event.target) &&
            !mobileMenuButton.contains(event.target)
        ) {
            mobileMenu.classList.add("hidden");
        }
    });

    // Close alert messages
    const closeAlertButtons = document.querySelectorAll(".close-alert");
    closeAlertButtons.forEach((button) => {
        button.addEventListener("click", function () {
            this.parentElement.style.display = "none";
        });
    });

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll(".alert");
    alerts.forEach((alert) => {
        setTimeout(() => {
            alert.style.opacity = "0";
            setTimeout(() => {
                alert.style.display = "none";
            }, 300);
        }, 5000);
    });

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        });
    });

    // Add fade-in animation to elements when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate");
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll(
        ".feature-card, .mission-card"
    );
    animateElements.forEach((el) => observer.observe(el));
    
    // Mobile menu toggle functionality
});

// Utility functions
function showAlert(message, type = "success") {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="close-alert">
            <i class="bi bi-x"></i>
        </button>
    `;

    const container =
        document.querySelector(
            ".max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.mt-4"
        ) || document.body;
    container.insertBefore(alertDiv, container.firstChild);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertDiv.style.opacity = "0";
        setTimeout(() => {
            alertDiv.remove();
        }, 300);
    }, 5000);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Dark mode toggle functionality - Initialize immediately to avoid FOUC
(function () {
    // Function to apply theme
    function applyTheme(theme) {
        document.documentElement.classList.toggle(
            "dark",
            theme === "dark" ||
            (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
        );
    }

    // Function to get theme preference
    function getThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        return 'system'; // Default to system preference
    }

    // Function to save theme preference
    function saveTheme(theme) {
        if (theme === 'system') {
            localStorage.removeItem('theme');
        } else {
            localStorage.setItem('theme', theme);
        }
    }

    // Function to get current effective theme (resolves system to actual theme)
    function getCurrentEffectiveTheme() {
        const preference = getThemePreference();
        if (preference === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return preference;
    }

    // Function to set theme directly
    function setTheme(theme) {
        applyTheme(theme);
        saveTheme(theme);
        updateThemeButtons(theme);
        closeThemeDropdowns();
    }

    // Function to close theme dropdowns
    function closeThemeDropdowns() {
        document.getElementById('theme-menu')?.classList.add('hidden');
        document.getElementById('theme-menu-mobile')?.classList.add('hidden');
    }

    // Function to update theme button states
    function updateThemeButtons(theme) {
        const effectiveTheme = getCurrentEffectiveTheme();
        
        // Update both desktop and mobile toggle buttons
        document.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(button => {
            // Hide all theme icons first
            button.querySelectorAll('.theme-light, .theme-dark, .theme-system').forEach(icon => {
                icon.classList.add('hidden');
            });
            
            // Show the appropriate icon based on current theme preference
            const iconToShow = button.querySelector(`.theme-${theme}`);
            if (iconToShow) {
                iconToShow.classList.remove('hidden');
            }
        });

        // Update dropdown menu items to show current selection
        document.querySelectorAll('[data-theme]').forEach(item => {
            if (item.dataset.theme === theme) {
                item.classList.add('bg-blue-50', 'dark:bg-blue-900/30', 'text-blue-600', 'dark:text-blue-400');
            } else {
                item.classList.remove('bg-blue-50', 'dark:bg-blue-900/30', 'text-blue-600', 'dark:text-blue-400');
            }
        });
    }

    // Initialize theme on page load
    const initialTheme = getThemePreference();
    applyTheme(initialTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Apply system theme change if currently using system preference
        const currentPreference = getThemePreference();
        if (currentPreference === 'system') {
            applyTheme('system');
            updateThemeButtons('system');
        }
    });

    // Wait for DOM to be ready to set up buttons
    document.addEventListener('DOMContentLoaded', function () {
        const themeToggle = document.getElementById('theme-toggle');
        const themeToggleMobile = document.getElementById('theme-toggle-mobile');
        const themeMenu = document.getElementById('theme-menu');
        const themeMenuMobile = document.getElementById('theme-menu-mobile');

        // Set initial button states
        const currentTheme = getThemePreference();
        updateThemeButtons(currentTheme);

        // Handle theme selection
        document.querySelectorAll('[data-theme]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedTheme = button.dataset.theme;
                setTheme(selectedTheme);
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            closeThemeDropdowns();
        });

        // Prevent dropdown from closing when clicking inside
        themeMenu?.addEventListener('click', (e) => e.stopPropagation());
        themeMenuMobile?.addEventListener('click', (e) => e.stopPropagation());
    });
})();

// Dropdown functionality
function toggleDropdown(dropdownId) {
    dropdownManager.toggle(dropdownId);
}
