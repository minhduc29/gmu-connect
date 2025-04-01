import { ACCESS_TOKEN, REFRESH_TOKEN, USERNAME } from "../constants"
import { jwtDecode } from "jwt-decode"
import api from "./api"

const authService = {
    login: async (username, password) => {
        try {
            const response = await api.post(
                "/api/token/",
                { username, password }
            )

            localStorage.setItem(ACCESS_TOKEN, response.data.access)
            localStorage.setItem(REFRESH_TOKEN, response.data.refresh)
            localStorage.setItem(USERNAME, username)
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: Object.values(error.response.data)[0] || "Login failed. Please try again."
            }
        }
    },

    register: async (username, email, password, confirm_password) => {
        try {
            const response = await api.post(
                "/api/auth/register/",
                { username, email, password, confirm_password }
            )

            if (response.status >= 200 && response.status < 300) {
                // Send verification email
                await api.post(
                    "/api/auth/verify/",
                    { email }
                )
                return { success: true }
            }
        } catch (error) {
            return {
                success: false,
                error: Object.values(error.response.data)[0] || "Registration failed. Please try again."
            }
        }
    },

    logout: () => {
        localStorage.clear()
    },

    isAuthenticated: async () => {
        const access = localStorage.getItem(ACCESS_TOKEN)
        if (!access) return false

        const decoded = jwtDecode(access)
        if (decoded.exp <= Date.now() / 1000) {
            // Get new access token
            const refresh = localStorage.getItem(REFRESH_TOKEN)
            try {
                const response = await api.post("/api/token/refresh/", { refresh })
                localStorage.setItem(ACCESS_TOKEN, response.data.access)
                return true
            } catch (error) {
                return false
            }
        }
        return true
    }
}

export default authService
