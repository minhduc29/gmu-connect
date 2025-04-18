import { Link } from 'react-router-dom'
import { useState, useRef } from 'react'
import { USERNAME } from '../../constants'

function MemberList({ room, onAdd, onRemove }) {
    const [content, setContent] = useState('')
    const username = useRef(localStorage.getItem(USERNAME))

    const handleSubmit = (e) => {
        e.preventDefault()
        if (content.trim()) {
            onAdd(content.trim().split(/\s+/))
            setContent('')
        }
    }

    return (
        <div className="chat-sidebar">
            <h1 className="green">Members</h1>
            {room.is_group && username.current === room.admin?.username &&
                <form className="message-input" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Enter usernames to add (separated by spaces)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)} />
                    <button type='submit' className="chat-button green-button">Add</button>
                </form>
            }
            <div className="room-list scroll-hidden">
                {room.members?.map((member, i) => (
                    <div key={i} className="member-item">
                        <Link to={`/profiles/${member.user.username}`} className="member-name">
                            <span>{member.user.username} </span>
                            <span className="role">{room.admin?.username === member.user.username && '(Admin)'}</span>
                        </Link>
                        {room.is_group && username.current === room.admin?.username && member.user.username !== username.current && member.user.username !== room.admin?.username && <button className="remove-button red-button" onClick={() => onRemove([member.user.username])}>X</button>}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MemberList
