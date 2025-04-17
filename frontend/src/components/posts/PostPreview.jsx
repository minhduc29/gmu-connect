import React, { useState } from "react";
import '../../styles/post.css'
import '../../styles/dashboard.css'
import { useNavigate } from "react-router-dom";
import PostDetail from "./PostDetail"

function PostPreview({post, onClick}) {
    // console.log("Post received:", post);
    const tags = post?.interest_tags.map((tag) =>
        <div key = {tag.slug}>
            {tag.name}
        </div>
    )
    return (
        <div className="card" onClick={onClick}>
            <div><strong>Author:</strong>{post?.author_username || ""}</div>
            <div className="post-title">
                <div><strong>Title:</strong> {post?.title || ""}</div>
            </div>
            <div className="post-description">
                <div><strong>Description:</strong> {post?.content || ""}</div>
            </div>
                <div className="tag">{tags}</div>
            <div className=""></div>
        </div>
    )
}

export default PostPreview