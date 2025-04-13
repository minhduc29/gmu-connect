import api from './api'

const chatService = {
    getRooms: async () => {
        try {
            const response = await api.get('/api/rooms/')
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: `Error fetching rooms: ${error}`
            }
        }
    },

    getRoom: async (roomId) => {
        try {
            const response = await api.get(`/api/rooms/${roomId}/`)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: `Error fetching room ${roomId}: ${error}`
            }
        }
    },

    createRoom: async (roomData) => {
        try {
            const response = await api.post('/api/rooms/', roomData)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: `Error creating room: ${error}`
            }
        }
    },

    updateRoom: async (roomId, roomData) => {
        try {
            const response = await api.put(`/api/rooms/${roomId}/`, roomData)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: `Error updating room ${roomId}: ${error}`
            }
        }
    },

    leaveRoom: async (roomId) => {
        try {
            const response = await api.delete(`/api/rooms/${roomId}/leave/`)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: `Error leaving room ${roomId}: ${error}`
            }
        }
    },

    manageMembers: async (roomId, action, usernames) => {
        try {
            const response = await api.post(`/api/rooms/${roomId}/`, { action, usernames })
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: `Error managing members in room ${roomId}: ${error}`
            }
        }
    },

    getMessages: async (roomId, nextUrl = "") => {
        try {
            const response = await api.get(nextUrl ? nextUrl : `/api/rooms/${roomId}/messages/`)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: `Error fetching messages for room ${roomId}: ${error}`
            }
        }
    },

    sendMessage: async (roomId, content) => {
        try {
            const response = await api.post(`/api/rooms/${roomId}/messages/`, { content })
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: `Error sending message to room ${roomId}: ${error}`
            }
        }
    }
}

export default chatService
