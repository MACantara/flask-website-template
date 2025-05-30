import PasswordStrengthChecker from "./components/password-strength.js";

document.addEventListener("DOMContentLoaded", function () {
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");

    // Initialize password strength checker
    const strengthChecker = new PasswordStrengthChecker("password", {
        showMeter: true,
        showFeedback: true,
        userInputs: [],
    });

    // Update user inputs when username or email changes
    function updateUserInputs() {
        const userInputs = [];
        if (usernameInput.value) userInputs.push(usernameInput.value);
        if (emailInput.value) userInputs.push(emailInput.value.split("@")[0]);
        strengthChecker.setUserInputs(userInputs);
    }

    usernameInput.addEventListener("input", updateUserInputs);
    emailInput.addEventListener("input", updateUserInputs);
});
