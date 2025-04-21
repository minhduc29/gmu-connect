import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { USERNAME } from "../../constants"
import chatService from "../../services/chatService"

function PostView({ post, isPreview, onEdit, onSelect, onDelete }) {
    const username = useRef(localStorage.getItem(USERNAME))
    const [content, setContent] = useState('')
    const navigate = useNavigate()

    const handleSelect = () => isPreview && onSelect(post)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (content.trim()) {
            const roomResult = await chatService.createRoom({
                name: "",
                is_group: false,
                member_usernames: [post?.author_username]
            })

            if (roomResult.success) {
                const msgResult = await chatService.sendMessage(roomResult.data.id, content)
                if (msgResult.success) navigate("/chat")
            }

            setContent('')
        }
    }

    return (
        <>
            <div className={`form-bg ${!isPreview && post?.author_username !== username.current && "bottom-less"}`}>
                <div className="form-container">
                    <div className={`post-item ${isPreview && "post-preview"}`} onClick={handleSelect}>
                        <div className="form-input"><strong>Title:</strong> {post?.title}</div>
                        <div className="form-input"><strong>Description:</strong> {isPreview && post?.content.length > 150 ? post?.content.substring(0, 150) + "..." : post?.content}</div>
                        <div className="form-input">
                            <Link to={`/profiles/${post?.author_username}`} className="member-name">
                                <strong>Author:</strong> {post?.author_username}
                            </Link>
                        </div>
                        {!isPreview && <div className="form-input"><strong>Interests:</strong> {post?.interest_tags.map(interest => interest.name).join(", ")}</div>}
                    </div>
                    <div className="post-time">
                        <span className="">
                            {'Created: ' + new Date(post?.created_at).toLocaleTimeString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric'
                            })}
                        </span>
                        {
                            !isPreview &&
                            <span className="">
                                {'Last updated: ' + new Date(post?.updated_at).toLocaleTimeString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric'
                                })}
                            </span>
                        }
                    </div>
                    {post?.author_username === username.current && !isPreview &&
                        <>
                            <button onClick={onEdit} className="form-button">Edit</button>
                            <button onClick={onDelete} style={{ marginTop: 0 }} className="form-button red-button">Delete</button>
                        </>
                    }
                </div>
            </div>
            {!isPreview && post?.author_username !== username.current &&
                <form className="message-input post-message" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Send a message to the author"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)} />
                    <button type='submit' className="chat-button green-button">Send</button>
                </form>}
        </>

    )
}

export default PostView
