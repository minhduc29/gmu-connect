import { useState } from "react"

function ChatCreateForm({ onSubmit, onCancel }) {
    const [roomData, setRoomData] = useState({
        name: "",
        is_group: false,
        member_usernames: ""
    })

    const handleSubmit = (e) => {
        e.preventDefault()

        const usernames = roomData.member_usernames.trim().split(/\s+/)
        const requestData = {
            name: roomData.name,
            is_group: usernames.length != 1,
            member_usernames: usernames
        }
        onSubmit(requestData)
        setRoomData({
            name: "",
            is_group: false,
            member_usernames: ""
        })
    }

    const handleChange = (e) => setRoomData({ ...roomData, [e.target.name]: e.target.value })

    return (
        <div className="chat-sidebar">
            <h1 className="green">Create New Chat</h1>
            <form onSubmit={handleSubmit} className="form-container">
                <input className="form-input" type="text" name="name" value={roomData.name} onChange={handleChange} placeholder="Room Name (Required for group chats of 3+ members)" />
                <input className="form-input" type="text" name="member_usernames" value={roomData.member_usernames} onChange={handleChange} placeholder="Enter usernames to add (separated by spaces)" />
                <button className="form-button" type="submit">Create</button>
                <button className="form-button" type="button" style={{ marginTop: 0 }} onClick={onCancel}>Cancel</button>
            </form>
        </div>
    )
}

export default ChatCreateForm
