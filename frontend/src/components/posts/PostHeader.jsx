import { useState } from "react"

function PostHeader({ isPreview, onCreate, onSearch, onBack, onReload }) {
    const [content, setContent] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (content.trim()) {
            onSearch(encodeURIComponent(content.trim()))
            setContent('')
        }
    }

    return (
        <div className="post-header">
            {isPreview ? (
                <>
                    <button className="free-button green-button" onClick={() => onReload()}>Refresh Posts</button>
                    <button className="free-button green-button" onClick={onCreate}>Create New Post</button>
                    <form className="message-input" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter keyword to search for (Title, Description, Author, Interest)"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)} />
                        <button type='submit' className="chat-button green-button">Search</button>
                    </form>
                </>
            ) : (
                <button className="chat-button green-button" onClick={onBack}>Back</button>
            )}
        </div>
    )
}

export default PostHeader
