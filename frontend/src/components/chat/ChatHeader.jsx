import { useRef } from "react"
import { USERNAME } from "../../constants"

function ChatHeader({ room, onLeave, onToggleMembers }) {
    if (!room) return null

    const username = useRef(localStorage.getItem(USERNAME))

    return (
        <div className="chat-header">
            <h1 className="green">{room.display_name}</h1>
            <div className="header-actions">
                <button className="chat-button green-button" onClick={onToggleMembers}>Members</button>
                {room.is_group && room.admin?.username !== username.current && <button className="chat-button red-button" onClick={() => onLeave(room.id)}>Leave</button>}
            </div>
        </div>
    )
}

export default ChatHeader
