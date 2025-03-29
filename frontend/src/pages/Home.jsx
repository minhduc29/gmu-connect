import { useState, useEffect } from "react"
import "../styles/Form.css"
import { useNavigate } from "react-router-dom";

function Home() {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    function handleProfileClick(){
        navigate("/Profile")
    }
    return( 
        <div>Welcome to GMU connect!
            <form onClick={handleProfileClick} className="form-profile">
                <button type = "button">Profile page</button>
            </form>
        </div>
    );
}

export default Home