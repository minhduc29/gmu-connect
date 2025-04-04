import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate()
    
    return( 
        <div>Welcome to GMU connect!
            <form onClick={() => navigate(`/profiles/${localStorage.getItem("username")}`)} className="form-profile">
                <button type="button">Profile page</button>
            </form>
        </div>
    );
}

export default Home