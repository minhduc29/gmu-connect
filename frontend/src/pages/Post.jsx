import { useState, useEffect } from "react"
import PostEditForm from "../components/posts/PostEditForm"
import PostList from "../components/posts/PostList"
import PostHeader from "../components/posts/PostHeader"
import PostView from "../components/posts/PostView"
import postService from "../services/postService"

function Post() {
    const [posts, setPosts] = useState([])
    const [activePost, setActivePost] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async (search = "") => {
        const result = await postService.getAllPosts(search)
        if (result.success) setPosts(result.data)
        else setError(result.error)
    }

    const handlePostSelect = (post) => setActivePost(post)

    const handleBack = () => {
        setActivePost(null)
        setIsEditing(false)
    }

    const handleSubmit = async (formData) => {
        if (activePost) {
            const result = await postService.updatePost(activePost.id, formData)
            if (result.success) {
                setPosts(prev => prev.map(post => post.id === activePost.id ? result.data : post))
                setActivePost(result.data)
            } else setError(result.error)
        } else {
            const result = await postService.createPost(formData)
            if (result.success) setPosts(prev => [result.data, ...prev])
            else setError(result.error)
        }

        setIsEditing(false)
    }

    const handleDelete = async () => {
        const result = await postService.deletePost(activePost.id)
        if (result.success) {
            setPosts(prev => prev.filter(post => post.id !== activePost.id))
            setActivePost(null)
        } else setError(result.error)
    }

    const toggleEdit = () => setIsEditing(true)

    const toggleCancel = () => setIsEditing(false)

    return (
        <>
            <PostHeader isPreview={!activePost} onCreate={toggleEdit} onSearch={fetchPosts} onBack={handleBack} onReload={fetchPosts} />
            {isEditing ? (
                <PostEditForm post={activePost} onSubmit={handleSubmit} onCancel={toggleCancel} />
            ) : (
                activePost ? (
                    <PostView post={activePost} isPreview={false} onEdit={toggleEdit} onSelect={handlePostSelect} onDelete={handleDelete} />
                ) : (
                    <PostList posts={posts} onSelect={handlePostSelect} />
                )
            )}
        </>
    )
}

export default Post
