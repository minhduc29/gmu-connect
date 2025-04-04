import { useState, useEffect, createContext } from "react"
import { USERNAME, PROFILE, TAGS } from "../constants"
import authService from "../services/authService"
import profileService from "../services/profileService"

const AuthContext = createContext(null)

function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        authService.isAuthenticated().then(auth => {
            setIsAuthenticated(auth)

            if (auth) {
                // Preload user profile to local storage
                const username = localStorage.getItem(USERNAME)
                const profile = localStorage.getItem(PROFILE) || ""
                if (!profile) profileService.getProfile(username)

                // Preload all tags since they don't change
                const tags = localStorage.getItem(TAGS) || ""
                if (!tags) profileService.getTags()
            }
        }).finally(() => setLoading(false))
    }, [isAuthenticated])

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
