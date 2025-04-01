import { useState, useEffect, useCallback } from "react"
import authService from "../services/authService"

function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // Check authentication status on mount
    useEffect(() => {
        authService.isAuthenticated().then(isAuth => {
            setIsAuthenticated(isAuth)
        }).finally(() => {
            setLoading(false)
        })
    }, [])

    const login = useCallback(async (username, password) => {
        setLoading(true)

        try {
            const result = await authService.login(username, password)
            setIsAuthenticated(result.success)
            setError(result.success ? "" : result.error)
            return result.success
        } finally {
            setLoading(false)
        }
    }, [])

    const register = useCallback(async (username, email, password, confirm_password) => {
        setLoading(true)

        try {
            const result = await authService.register(username, email, password, confirm_password)
            setError(result.success ? "" : result.error)
            return result.success
        } finally {
            setLoading(false)
        }
    }, [])

    const logout = useCallback(() => {
        authService.logout()
        setIsAuthenticated(false)
    }, [])

    return {
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout
    }
}

export default useAuth
