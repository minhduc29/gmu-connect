import PostView from "./PostView"

function PostList({ posts, onSelect }) {
    return (
        posts.length ? (
            posts.map(post => <PostView key={post.id} post={post} isPreview={true} onEdit={null} onSelect={onSelect} />)
        ) : (
            <div className="post-list">
                <p className="green" style={{ fontSize: "20px" }}>No posts found</p>
            </div>
        )
    )
}

export default PostList
