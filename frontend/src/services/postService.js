import api from "./api"

const postService = {
    getAllPost: async () => {
        try {
            const response = await api.get(`/api/posts/`)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: Object.values(error.response.data)[0] || `Failed to get post list.`
            }
        }
    },

    getUserPost: async (username) => {
        try {
            const response = await api.get(`/api/posts/by/${username}/`)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: Object.values(error.response.data)[0] || `Failed to get post for ${username}.`
            }
        }
    },

    updatePost: async (username, id, postData) => {
        try{
            const response = await api.put(`api/posts/by/${username}/${id}/`, postData)
            return{
                success: true,
                data: response.data
            }
        } catch (error){
            return {
                success: false,
                error: Object.values(error.response.data)[0] || `Failed to update post for ${username}.`
            }
        }

    }
}

export default postService