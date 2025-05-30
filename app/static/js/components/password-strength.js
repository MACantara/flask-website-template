/**
 * Password strength checker using real-time validation
 */

class PasswordStrengthChecker {
    constructor(passwordInputId, options = {}) {
        this.passwordInput = document.getElementById(passwordInputId);
        this.options = {
            showMeter: true,
            showFeedback: true,
            userInputs: [],
            ...options
        };
        
        if (this.passwordInput) {
            this.init();
        }
    }
    
    init() {
        this.createStrengthMeter();
        this.setupEventListeners();
    }
    
    createStrengthMeter() {
        const container = document.createElement('div');
        container.className = 'password-strength-container mt-2';
        
        if (this.options.showMeter) {
            const meter = document.createElement('div');
            meter.className = 'password-strength-meter mb-2';
            meter.innerHTML = `
                <div class="flex space-x-1 mb-1">
                    <div class="strength-bar flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded" data-level="0"></div>
                    <div class="strength-bar flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded" data-level="1"></div>
                    <div class="strength-bar flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded" data-level="2"></div>
                    <div class="strength-bar flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded" data-level="3"></div>
                    <div class="strength-bar flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded" data-level="4"></div>
                </div>
                <div class="strength-label text-xs text-gray-500 dark:text-gray-400"></div>
            `;
            container.appendChild(meter);
        }
        
        if (this.options.showFeedback) {
            const feedback = document.createElement('div');
            feedback.className = 'password-feedback text-xs space-y-1';
            container.appendChild(feedback);
        }
        
        this.passwordInput.parentNode.insertBefore(container, this.passwordInput.nextSibling);
        this.strengthContainer = container;
    }
    
    setupEventListeners() {
        this.passwordInput.addEventListener('input', (e) => {
            this.checkStrength(e.target.value);
        });
        
        this.passwordInput.addEventListener('focus', () => {
            this.strengthContainer.style.display = 'block';
        });
    }
    
    async checkStrength(password) {
        if (!password) {
            this.updateDisplay(0, 'Enter a password', []);
            return;
        }
        
        try {
            // Make request to backend for strength checking
            const response = await fetch('/api/check-password-strength', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: password,
                    user_inputs: this.options.userInputs
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.updateDisplay(
                    result.score,
                    `${result.strength} - Crack time: ${result.crack_time}`,
                    result.feedback
                );
            } else {
                // Fallback to basic client-side checking
                this.basicStrengthCheck(password);
            }
        } catch (error) {
            // Fallback to basic client-side checking
            this.basicStrengthCheck(password);
        }
    }
    
    basicStrengthCheck(password) {
        let score = 0;
        let feedback = [];
        
        if (password.length >= 8) score++;
        else feedback.push('Use at least 8 characters');
        
        if (/[a-z]/.test(password)) score++;
        else feedback.push('Add lowercase letters');
        
        if (/[A-Z]/.test(password)) score++;
        else feedback.push('Add uppercase letters');
        
        if (/\d/.test(password)) score++;
        else feedback.push('Add numbers');
        
        if (/[^A-Za-z0-9]/.test(password)) score++;
        else feedback.push('Add special characters');
        
        const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Good', 'Very strong'];
        const label = strengthLabels[Math.min(score, 4)] || 'Very weak';
        
        this.updateDisplay(score, label, { suggestions: feedback });
    }
    
    updateDisplay(score, label, feedback) {
        // Update strength meter
        const bars = this.strengthContainer.querySelectorAll('.strength-bar');
        const colors = [
            'bg-red-500',
            'bg-orange-500', 
            'bg-yellow-500',
            'bg-blue-500',
            'bg-purple-500'
        ];
        
        bars.forEach((bar, index) => {
            // Reset classes
            bar.className = 'strength-bar flex-1 h-1 rounded';
            
            if (index < score) {
                bar.classList.add(colors[score - 1] || 'bg-gray-200');
            } else {
                bar.classList.add('bg-gray-200', 'dark:bg-gray-700');
            }
        });
        
        // Update label
        const labelEl = this.strengthContainer.querySelector('.strength-label');
        if (labelEl) {
            labelEl.textContent = label;
            labelEl.className = `strength-label text-xs ${this.getLabelColor(score)}`;
        }
        
        // Update feedback
        const feedbackEl = this.strengthContainer.querySelector('.password-feedback');
        if (feedbackEl && feedback) {
            let feedbackHtml = '';
            
            if (feedback.warning) {
                feedbackHtml += `<div class="text-orange-600 dark:text-orange-400">${feedback.warning}</div>`;
            }
            
            if (feedback.suggestions && feedback.suggestions.length > 0) {
                feedback.suggestions.slice(0, 3).forEach(suggestion => {
                    feedbackHtml += `<div class="text-gray-600 dark:text-gray-400">• ${suggestion}</div>`;
                });
            }
            
            feedbackEl.innerHTML = feedbackHtml;
        }
    }
    
    getLabelColor(score) {
        const colors = [
            'text-red-600 dark:text-red-400',
            'text-orange-600 dark:text-orange-400',
            'text-yellow-600 dark:text-yellow-400', 
            'text-blue-600 dark:text-blue-400',
            'text-purple-600 dark:text-purple-400'
        ];
        return colors[score] || colors[0];
    }
    
    setUserInputs(inputs) {
        this.options.userInputs = inputs;
    }
}

// Export for use in other modules
export default PasswordStrengthChecker;

// Global utility
if (typeof window !== 'undefined') {
    window.PasswordStrengthChecker = PasswordStrengthChecker;
}
