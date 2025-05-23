// Contact page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    const submitButton = contactForm?.querySelector('button[type="submit"]');
    
    if (contactForm) {
        // Real-time form validation
        const formInputs = contactForm.querySelectorAll('input, textarea');
        
        formInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
        
        // Form submission handling
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            formInputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            if (isValid) {
                submitForm();
            }
        });
    }
    
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Remove existing error messages
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Required field validation
        if (!value) {
            isValid = false;
            errorMessage = 'This field is required.';
        }
        
        // Email validation
        if (field.type === 'email' && value && !validateEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address.';
        }
        
        // Message length validation
        if (field.name === 'message' && value && value.length < 10) {
            isValid = false;
            errorMessage = 'Message must be at least 10 characters long.';
        }
        
        // Update field appearance
        if (isValid) {
            field.classList.remove('error');
            field.classList.add('success');
        } else {
            field.classList.remove('success');
            field.classList.add('error');
            
            // Add error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message text-red-500 text-sm mt-1';
            errorDiv.textContent = errorMessage;
            field.parentNode.appendChild(errorDiv);
        }
        
        return isValid;
    }
    
    function submitForm() {
        if (!submitButton) return;
        
        // Show loading state
        submitButton.classList.add('btn-loading');
        submitButton.disabled = true;
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        
        // Create FormData
        const formData = new FormData(contactForm);
        
        // Submit form using fetch
        fetch(contactForm.action || window.location.pathname, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('Network response was not ok');
        })
        .then(html => {
            // Parse response to check for success/error messages
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const alerts = doc.querySelectorAll('.alert');
            
            if (alerts.length > 0) {
                // Clear form on success
                if (doc.querySelector('.alert-success')) {
                    contactForm.reset();
                    const formInputs = contactForm.querySelectorAll('input, textarea');
                    formInputs.forEach(input => {
                        input.classList.remove('success', 'error');
                    });
                }
                
                // Show alert messages
                alerts.forEach(alert => {
                    const message = alert.textContent.trim();
                    const type = alert.classList.contains('alert-success') ? 'success' : 'error';
                    showAlert(message, type);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('An error occurred. Please try again later.', 'error');
        })
        .finally(() => {
            // Reset button state
            submitButton.classList.remove('btn-loading');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        });
    }
    
    // Add floating label effect
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        const label = group.querySelector('label');
        
        if (input && label) {
            input.addEventListener('focus', function() {
                label.style.color = '#3B82F6';
                label.style.transform = 'scale(0.9)';
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    label.style.color = '';
                    label.style.transform = '';
                }
            });
        }
    });
});
