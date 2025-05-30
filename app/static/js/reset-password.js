import PasswordStrengthChecker from "./components/password-strength.js";

document.addEventListener("DOMContentLoaded", function () {
    // Initialize password strength checker
    new PasswordStrengthChecker("password", {
        showMeter: true,
        showFeedback: true,
        userInputs: [], // User context will be available from backend
    });
});
