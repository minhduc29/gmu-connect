export const validateEmail = (email) => {
    if (!email) return "Email is required"
    if (!email.endsWith("@gmu.edu")) {
        return "Email MUST be a GMU email"
    }
    return ""
}

export const validatePassword = (password) => {
    if (!password) return "Password is required"

    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password)
    const isLongEnough = password.length > 7

    if (!(isLongEnough && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
        return "Password MUST contain at least 8 characters with 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
    }

    return ""
}

export const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "Please confirm your password"
    if (password !== confirmPassword) {
        return "Passwords do NOT match"
    }
    return ""
}
