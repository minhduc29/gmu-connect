import { useState, useRef, useEffect, useCallback } from "react"
import { USERNAME } from "../../constants"
import postService from "../../services/PostService"
import PostList from "./PostList"
import { TAGS } from "../../constants"

function AllPosts(){
    const tags = useRef(JSON.parse(localStorage.getItem(TAGS)) || [])
    const [allPost, setPost] = useState([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState(null)

    const fetchPosts = () => {
        postService.getAllPost().then(result => {            
            if (result.success) setPost(result.data)
            else setError(result.error)
        }).finally(() => {
            setLoading(false)
        })
    }

    useEffect(() =>{
        fetchPosts();
    }, [])

    return (
        <PostList posts = {allPost} onUpdate={fetchPosts}/>
    )
    
}

export default AllPosts