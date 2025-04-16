function ChatHeader({ room, onLeave, onToggleMembers }) {
    if (!room) return null

    return (
        <div className="chat-header">
            <h1 className="green">{room.display_name}</h1>
            <div className="header-actions">
                <button className="chat-button green-button" onClick={onToggleMembers}>Members</button>
                <button className="chat-button red-button" onClick={() => onLeave(room.id)}>Leave</button>
            </div>
        </div>
    )
}

export default ChatHeader
