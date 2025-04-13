import { useEffect, useState, useRef } from 'react'
import { ACCESS_TOKEN } from '../constants'
import chatService from '../services/chatService'
import createWebSocketConnection from '../services/websocketService'
import ChatHeader from '../components/chat/ChatHeader'
import ChatSidebar from '../components/chat/ChatSidebar'
import MessageList from '../components/chat/MessageList'
import MessageInput from '../components/chat/MessageInput'

function Chat() {
    const [rooms, setRooms] = useState([])
    const [activeRoom, setActiveRoom] = useState(null)
    const [messages, setMessages] = useState([])
    const [nextPage, setNextPage] = useState('')
    const [showMembers, setShowMembers] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const socketRef = useRef(null)

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const result = await chatService.getRooms()
                if (result.success) setRooms(result.data)
                else setError(result.error)
            } finally {
                setLoading(false)
            }
        }

        fetchRooms()

        const handleWebSocketMessage = (data) => {
            switch (data.type) {
                case 'new_message':
                    // Add new message to the messages list if it's for the active room
                    if (activeRoom && data.room_id === activeRoom.id) {
                        setMessages(prevMessages => [data, ...prevMessages])
                    }

                    // Update room list to show unread status
                    setRooms(prevRooms => {
                        const idx = prevRooms.findIndex(room => room.id === data.room_id)
                        const updatedRoom = { ...prevRooms[idx], unread: activeRoom?.id !== data.room_id }
                        return [updatedRoom, ...prevRooms.filter((_, i) => i !== idx)]
                    })

                    break

                case 'room_update':
                    // Update room name in the list
                    setRooms(prevRooms => prevRooms.map(room => room.id === data.room.id ? data.room : room))
                    if (data.room.id === activeRoom?.id) setActiveRoom(data.room)
                    break

                case 'added_to_room':
                    // Add the new room to the list
                    setRooms(prevRooms => prevRooms.some(room => room.id === data.data.id) ? prevRooms : [...prevRooms, data.data])
                    break

                case 'removed_from_room':
                    // Remove the room from the list
                    setRooms(prevRooms => prevRooms.filter(room => room.id !== data.data.id))
                    if (data.data.id === activeRoom?.id) {
                        setActiveRoom(null)
                        setMessages([])
                    }
                    break

                case 'member_added':
                case 'member_removed':
                    // Update room in the list
                    setRooms(prevRooms => prevRooms.map(room => room.id === data.room_id ? data.data : room))
                    if (data.room_id === activeRoom?.id) setActiveRoom(data.data)
                    break

                default:
                    console.log("Unknown message type:", data.type)
            }
        }

        const socket = createWebSocketConnection(localStorage.getItem(ACCESS_TOKEN), handleWebSocketMessage)
        socketRef.current = socket

        return () => socketRef.current?.close()
    }, [])

    const handleRoomSelect = async (room) => {
        setLoading(true)
        setActiveRoom(room)
        try {
            const result = await chatService.getMessages(room.id)
            if (result.success) setMessages(result.data.results)
            else setError(result.error)
        } finally {
            setLoading(false)
        }
    }

    const handleRoomLeave = (roomId) => chatService.leaveRoom(roomId)

    const toggleMembers = () => setShowMembers(!showMembers)

    const handleSendMessage = async (content) => {
        if (!activeRoom || !content.trim()) return
        try {
            socketRef.current?.sendMessage(activeRoom.id, content)
            await chatService.sendMessage(activeRoom.id, content)
        } catch (err) {
            setError('Failed to send message')
        }
    }

    const loadMoreMessages = async () => {
        if (!activeRoom) return
        const result = await chatService.getMessages(activeRoom.id)
        if (result.success) setMessages(prev => [...result.data.results, ...prev])
    }

    return (
        <div className="chat-page">
            <ChatSidebar
                rooms={rooms}
                activeRoomId={activeRoom?.id}
                onSelectRoom={handleRoomSelect}
            />

            <div className="chat-container">
                <ChatHeader room={activeRoom} onLeave={handleRoomLeave} onToggleMembers={toggleMembers} />
                <MessageList messages={messages} onLoadMore={loadMoreMessages} />
                <MessageInput onSend={handleSendMessage} />
                {showMembers && (
                    <div className="member-list-panel">
                        {/* TODO: MemberList will go here */}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Chat