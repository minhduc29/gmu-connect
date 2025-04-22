import PostView from "./PostView"

function PostList({ posts, onSelect }) {
    return (
        posts.length ? (
            posts.map(post => <PostView key={post.id} post={post} isPreview={true} onEdit={null} onSelect={onSelect} />)
        ) : (
            <div className="post-list">
                <p className="green" style={{ fontSize: "20px" }}>No posts match your profile interests</p>
                <p className="green" style={{ fontSize: "20px", marginTop: 0 }}>Try adding more interests to your profile or broadening your search</p>
            </div>
        )
    )
}

export default PostList
