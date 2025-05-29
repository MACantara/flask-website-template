import dropdownManager from './utils/dropdown-toggle.js';
import flashMessageManager from './utils/flash-messages.js';
import themeManager from './utils/theme-manager.js';

// Mobile menu toggle
document.addEventListener("DOMContentLoaded", function () {
    // Initialize all managers
    dropdownManager.init();
    flashMessageManager.init();
    themeManager.init();
    
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

// Dropdown functionality
function toggleDropdown(dropdownId) {
    dropdownManager.toggle(dropdownId);
}
