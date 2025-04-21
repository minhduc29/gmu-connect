import { useEffect, useState, useRef } from 'react'
import { ACCESS_TOKEN } from '../constants'
import chatService from '../services/chatService'
import createWebSocketConnection from '../services/websocketService'
import ChatCreateForm from '../components/chat/ChatCreateForm'
import ChatHeader from '../components/chat/ChatHeader'
import ChatSidebar from '../components/chat/ChatSidebar'
import MemberList from '../components/chat/MemberList'
import MessageList from '../components/chat/MessageList'
import MessageInput from '../components/chat/MessageInput'

function Chat() {
    const [rooms, setRooms] = useState([])
    const [activeRoom, setActiveRoom] = useState(null)
    const [messages, setMessages] = useState([])
    const [nextPage, setNextPage] = useState('')
    const [showMembers, setShowMembers] = useState(false)
    const [createRoom, setCreateRoom] = useState(false)
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
    }, [])

    useEffect(() => {
        const handleWebSocketMessage = (data) => {
            switch (data.type) {
                case 'new_message':
                    // Add new message to the messages list if it's for the active room
                    if (activeRoom && data.room_id === activeRoom.id) {
                        setMessages(prevMessages => [...prevMessages, data])
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
                    setRooms(prevRooms => prevRooms.some(room => room.id === data.data.id) ? prevRooms : [data.data, ...prevRooms])
                    break

                case 'removed_from_room':
                    // Remove the room from the list
                    setRooms(prevRooms => prevRooms.filter(room => room.id !== data.data))
                    if (data.data === activeRoom?.id) {
                        setActiveRoom(null)
                        setMessages([])
                        setShowMembers(false)
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
    }, [activeRoom])

    const handleRoomSelect = async (room) => {
        setLoading(true)
        try {
            const result = await chatService.getMessages(room.id)
            // TODO: next page handling
            if (result.success) {
                setMessages(result.data.results.reverse())
                setRooms(prevRooms => prevRooms.map(r => r.id === room.id ? { ...r, unread: false } : r))
                setActiveRoom(room)
            } else setError(result.error)
        } finally {
            setLoading(false)
        }
    }

    const handleRoomLeave = (roomId) => chatService.leaveRoom(roomId)

    const toggleMembers = () => setShowMembers(!showMembers)

    const handleSendMessage = (content) => {
        if (!activeRoom || !content.trim()) return
        try {
            socketRef.current.sendMessage(activeRoom.id, content.trim())
        } catch (err) {
            setError('Failed to send message')
        }
    }

    const loadMoreMessages = async () => {
        if (!activeRoom) return
        const result = await chatService.getMessages(activeRoom.id, nextPage)
        if (result.success) setMessages(prev => [...result.data.results.reverse(), ...prev])
        // TODO: next page handling
    }

    const handleAddMember = (usernames) => {
        if (!activeRoom || !usernames.length) return
        chatService.manageMembers(activeRoom.id, 'add', usernames)
    }

    const handleRemoveMember = (usernames) => {
        if (!activeRoom || !usernames.length) return
        chatService.manageMembers(activeRoom.id, 'remove', usernames)
    }

    const toggleCreateRoom = () => setCreateRoom(!createRoom)

    const handleCreateRoom = (roomData) => {
        chatService.createRoom(roomData)
        setCreateRoom(false)
    }

    const handleCancel = () => setCreateRoom(false)

    return (
        <div className="chat-page">
            {activeRoom && showMembers ? (
                <MemberList room={activeRoom} onAdd={handleAddMember} onRemove={handleRemoveMember} />
            ) : (
                createRoom ? (
                    <ChatCreateForm onSubmit={handleCreateRoom} onCancel={handleCancel}></ChatCreateForm>
                ) : (
                    <ChatSidebar rooms={rooms} activeRoomId={activeRoom?.id} onSelectRoom={handleRoomSelect} onToggleCreate={toggleCreateRoom} />
                )
            )}

            <div className="chat-container">
                {activeRoom ? (
                    <>
                        <ChatHeader room={activeRoom} onLeave={handleRoomLeave} onToggleMembers={toggleMembers} />
                        <MessageList messages={messages} onLoadMore={loadMoreMessages} />
                        <MessageInput onSend={handleSendMessage} />
                    </>
                ) : (
                    <p className="green" style={{ fontSize: "20px" }}>No chat room selected</p>
                )}
            </div>
        </div>
    )
}

export default Chat