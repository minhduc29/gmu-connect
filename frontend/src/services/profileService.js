import { PROFILE, TAGS, USERNAME } from "../constants"
import api from "./api"

const profileService = {
    getProfile: async (username) => {
        try {
            const response = await api.get(`/api/profiles/${username}/`)
            const curUsername = localStorage.getItem(USERNAME)
            if (username == curUsername) localStorage.setItem(PROFILE, JSON.stringify(response.data))
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: Object.values(error.response.data)[0] || `Failed to get profile for ${username}.`
            }
        }
    },

    updateProfile: async (username, profileData) => {
        try {
            const response = await api.put(`/api/profiles/${username}/`, profileData)
            localStorage.setItem(PROFILE, JSON.stringify(response.data))
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: Object.values(error.response.data)[0] || `Failed to update profile for ${username}.`
            }
        }
    },

    getTags: async() => {
        try {
            const response = await api.get("/api/tags/")
            localStorage.setItem(TAGS, JSON.stringify(response.data))
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: "Failed to get tags."
            }
        }
    }
}

export default profileService