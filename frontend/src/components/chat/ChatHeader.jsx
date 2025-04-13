function ChatHeader({ room, onLeave, onToggleMembers }) {
    if (!room) return null

    return (
        <div className="chat-header">
            <h2 className="chat-title">{room.display_name}</h2>
            <button className="member-toggle" onClick={onToggleMembers} title="Show members">
            👥 {room.members?.length || 0}
          </button>
            <button className="leave-button" onClick={() => onLeave(room.id)}>
                Leave
            </button>
        </div>
    )
}

export default ChatHeader
