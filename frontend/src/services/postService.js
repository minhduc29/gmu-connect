import api from "./api"

const postService = {
    getAllPosts: async (search="") => {
        try {
            const response = await api.get(`/api/posts/?search=${search}`)
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

    getUserPosts: async (username) => {
        try {
            const response = await api.get(`/api/posts/by/${username}/`)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: Object.values(error.response.data)[0] || `Failed to get posts of ${username}.`
            }
        }
    },

    getPost: async (postId) => {
        try {
            const response = await api.get(`/api/posts/${postId}/`)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: Object.values(error.response.data)[0] || `Failed to get post ${postId}.`
            }
        }
    },

    createPost: async (postData) => {
        try {
            const response = await api.post(`/api/posts/`, postData)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: Object.values(error.response.data)[0] || `Failed to create post.`
            }
        }
    },

    updatePost: async (postId, postData) => {
        try{
            const response = await api.put(`api/posts/${postId}/`, postData)
            return{
                success: true,
                data: response.data
            }
        } catch (error){
            return {
                success: false,
                error: Object.values(error.response.data)[0] || `Failed to update post ${postId}.`
            }
        }
    },

    deletePost: async (postId) => {
        try {
            const response = await api.delete(`/api/posts/${postId}/`)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: Object.values(error.response.data)[0] || `Failed to delete post ${postId}.`
            }
        }
    }
}

export default postService