function ChatSidebar({ rooms, activeRoomId, onSelectRoom, onToggleCreate }) {
    return (
        <div className="chat-sidebar">
            <h1 className="green">Chat</h1>
            <button className="free-button green-button" onClick={onToggleCreate}>Create New Chat</button>
            <div className="room-list scroll-hidden">
                {rooms.map(room => (
                    <div
                        key={room.id}
                        className={`room-item ${room.id === activeRoomId ? 'active' : ''}`}
                        onClick={() => onSelectRoom(room)}
                    >
                        {room.unread && <span className="unread-dot" />}
                        <span className="room-name">{room.display_name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ChatSidebar
