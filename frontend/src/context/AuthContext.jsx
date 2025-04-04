import { useState, useEffect, createContext } from "react"
import authService from "../services/authService"

const AuthContext = createContext(null)

function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        authService.isAuthenticated().then(result => {
            setIsAuthenticated(result)
        }).finally(() => setLoading(false))
    }, [])

    const login = async (username, password) => {
        setLoading(true)

        try {
            const result = await authService.login(username, password)
            setIsAuthenticated(result.success)
            setError(result.success ? "" : result.error)
            return result.success
        } finally {
            setLoading(false)
        }
    }


    const register = async (username, email, password, confirm_password) => {
        setLoading(true)

        try {
            const result = await authService.register(username, email, password, confirm_password)
            setError(result.success ? "" : result.error)
            return result.success
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        authService.logout()
        setIsAuthenticated(false)
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProvider }
