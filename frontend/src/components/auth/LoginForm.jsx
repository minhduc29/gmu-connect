import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"

function LoginForm() {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const { loading, error, login } = useContext(AuthContext)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!username || !password) return

        const success = await login(username, password)
        if (success) navigate("/")
    }

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>Login</h1>

            <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
            />

            <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />

            <button className="form-button" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
    )
}

export default LoginForm
