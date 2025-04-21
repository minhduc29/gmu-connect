import { useContext, useState } from "react"
import { validateEmail, validatePassword, validateConfirmPassword } from "../../utils/validation"
import { AuthContext } from "../../context/AuthContext"

function RegisterForm() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [confirmPasswordError, setConfirmPasswordError] = useState("")
    const [isRegistered, setIsRegistered] = useState(false)
    const { loading, error, register } = useContext(AuthContext)

    const handleEmailBlur = () => {
        setEmailError(validateEmail(email))
    }

    const handlePasswordBlur = () => {
        setPasswordError(validatePassword(password))
    }

    const handleConfirmPasswordBlur = () => {
        setConfirmPasswordError(validateConfirmPassword(password, confirmPassword))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate all fields
        const emailErr = validateEmail(email)
        const passwordErr = validatePassword(password)
        const confirmPasswordErr = validateConfirmPassword(password, confirmPassword)

        setEmailError(emailErr)
        setPasswordError(passwordErr)
        setConfirmPasswordError(confirmPasswordErr)

        if (emailErr || passwordErr || confirmPasswordErr) return

        const success = await register(username, email, password, confirmPassword)

        if (success) {
            setIsRegistered(true)

            // Reset form
            setUsername("")
            setEmail("")
            setPassword("")
            setConfirmPassword("")
        }
    }

    if (isRegistered) {
        return (
            <div className="form-bg">
                <div className="form-container">
                    <h2>Registration Successful!</h2>
                    <p>Now please check your GMU email box for verification email</p>
                </div>
            </div>
        )
    }

    return (
        <div className="form-bg">
            <form onSubmit={handleSubmit} className="form-container">
                <h1 className="green">Register</h1>

                <input
                    type="text"
                    className="form-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />

                <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}
                    placeholder="Email"
                    required
                />
                {emailError && <p className="input-error" style={{ color: "red" }}>{emailError}</p>}

                <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={handlePasswordBlur}
                    placeholder="Password"
                    required
                />
                {passwordError && <p className="input-error" style={{ color: "red" }}>{passwordError}</p>}

                <input
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={handleConfirmPasswordBlur}
                    placeholder="Confirm Password"
                    required
                />
                {confirmPasswordError && <p className="input-error" style={{ color: "red" }}>{confirmPasswordError}</p>}

                <button className="form-button" type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>

                {error && <p className="input-error" style={{ color: "red" }}>{error}</p>}
            </form>
        </div>
    )
}

export default RegisterForm
