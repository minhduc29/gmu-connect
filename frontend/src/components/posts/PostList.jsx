import React from "react"
import { useState, useEffect } from "react"
import '../../styles/post.css'
import '../../styles/dashboard.css'
import PostPreview from "./PostPreview"
import PostDetail from "./PostDetail"

function PostList({posts, onUpdate}) {
    console.log(posts)
    const [isDetail, setIsDetail] = useState(false)
    const [detailPost, setDetailPost] = useState()
    const handleClick = (post) => {
        setDetailPost(post)
        setIsDetail(true)
    }



    return (
        <div className="content">
            {isDetail? (
                <PostDetail post={detailPost} onBack={() => setIsDetail(false)} onUpdate={onUpdate}/>
            ):(
                <div className="content">
                    {posts.map(post => (
                        <PostPreview 
                            key={post.id} 
                            post={post} 
                            onClick = {() => handleClick(post)}
                    />))}
                </div>
            )}
        </div>
    )
}

const MemoizedPostView = React.memo(PostList)
export default MemoizedPostView
