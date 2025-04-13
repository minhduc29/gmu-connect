function ChatSidebar({ rooms, activeRoomId, onSelectRoom }) {
    return (
        <div className="user-list">
            <h2 className="sidebar-title">Chats</h2>
            <ul className="chat-room-list">
                {rooms.map(room => (
                    <li
                        key={room.id}
                        className={`chat-room-item ${room.id === activeRoomId ? 'active' : ''}`}
                        onClick={() => onSelectRoom(room)}
                    >
                        <span className="room-name">{room.display_name}</span>
                        {room.unread && <span className="unread-dot" />}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ChatSidebar
