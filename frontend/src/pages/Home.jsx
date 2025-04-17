import { useNavigate } from "react-router-dom";
import AllPosts from "../components/posts/AllPosts";

function Home() {
    const navigate = useNavigate()
    
    return( 
        <div>
            {/* <div>Welcome to GMU connect!
                <form onClick={() => navigate(`/profiles/${localStorage.getItem("username")}`)} className="form-profile">
                    <button type="button">Profile page</button>
                </form>
            </div> */}
            <div className="header">
                <h2>GMU Match Maker</h2>
            </div>
            <div className="main">
                <div className="sidebar">
                    <div className="sidebar-divider"></div>
                    <div className="sidebar-logo"></div>
                    <div className="sidebar button">
                        <h3>Home</h3>
                        <h3>Chat</h3>
                        <h3>Create</h3>
                        <h3>Filter</h3>
                        <h3>Sort</h3>
                        <h3>Logout</h3>
                    </div>
                </div>
                {/* <div className="content">
                    {posts.map(post => <Post key={post.id} post={post} />)}
                </div> */}
                <AllPosts AllPosts/>
            </div>
            {/* <div>
                <AllPosts AllPosts/>
            </div> */}
        </div>
    );
}

export default Home