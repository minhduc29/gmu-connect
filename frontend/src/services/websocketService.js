const createWebSocketConnection = (token, onMessage) => {
    const wsBaseUrl = import.meta.env.VITE_WS_URL
    const socket = new WebSocket(`${wsBaseUrl}ws/chat/?token=${token}`)

    socket.onopen = () => {
        console.log('[WebSocket] Connection established')
    }

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data)
            onMessage(data)
        } catch (error) {
            console.error('[WebSocket] Error parsing message:', error)
        }
    }

    socket.onclose = (event) => {
        console.log('[WebSocket] Connection closed:', event.code, event.reason)
    }

    socket.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
    }

    const send = (data) => {
        if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(data))
        else console.error('[WebSocket] Socket is not open. Current state:', socket.readyState)
    }

    return {
        sendMessage: (roomId, content) => send({ type: 'message', room_id: roomId, content }),
        markAsRead: (roomId) => send({ type: 'mark_read', room_id: roomId }),
        close: () => socket.close()
    }
}

export default createWebSocketConnection
