import { useState, useEffect, useRef, useCallback} from "react"
import "../../styles/post.css"
import { USERNAME } from "../../constants"
import postService from "../../services/PostService"
import PostEditForm from "./PostEditForm"

function PostDetail({post, onBack, onUpdate}) {
    const [isCurrentUser, setIsCurrentUser] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editedPost, setEditedPost] = useState(post)
    const [error, setError] = useState("")
    const username = useRef(localStorage.getItem(USERNAME))

    useEffect(() => {
        if (username.current === post.author_username) {
            setIsCurrentUser(true)
        }
    }, [])

    const handleSubmit = useCallback(async (formData) => {
        const result = await postService.updatePost(username.current, post.id,  formData)
        if (result.success){ 
            setEditedPost(result.data)
            onUpdate()
        }
        else setError(result.error)

        setIsEditing(false)
    }, [])

    const handleEdit = useCallback(() => {
        setIsEditing(true)
    }, [])

    const handleCancel = useCallback(() => {
        setIsEditing(false)
    }, [])

    return (
        <div className="post-container">
            {isEditing ? (
                <PostEditForm post={editedPost} onSubmit={handleSubmit} onCancel={handleCancel}/>
            ) : (
            <div>
                    <div className="back-link" onClick={onBack}><h2>Back to posts</h2></div>
                    <div className="post-title"><strong>Title: </strong>{editedPost?.title || ""}</div>
                    <div className="post-description"><strong>Content: </strong>{editedPost?.content || ""}</div>
                    <div className="tag"></div>
                    <div className="timestamp">{new Date(editedPost?.created_at).toLocaleString() || ""}</div>
                {isCurrentUser && <button onClick={handleEdit} className="edit">Edit post</button>}
            </div>
            )}
        </div>
    )
}
export default PostDetail