import { useContext, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { USERNAME } from "../constants"

function NavBar() {
    const navigate = useNavigate()
    const { isAuthenticated } = useContext(AuthContext)
    const [username, setUsername] = useState(localStorage.getItem(USERNAME))

    useEffect(() => {
        setUsername(localStorage.getItem(USERNAME))
    }, [isAuthenticated])

    return (
        <header className="top-bar">
            <div onClick={() => navigate("/")}>GMU Connect</div>
            <div>
                {isAuthenticated ? (
                    <>
                        <Link className="nav-link" to="/">Home</Link>
                        <Link className="nav-link" to={`/profiles/${username}`}>Profiles</Link>
                        <Link className="nav-link" to="/chat">Chat</Link>
                        <Link className="nav-link" to="/logout">Logout</Link>
                    </>
                ) : (
                    <>
                        <Link className="nav-link" to="/login">Login</Link>
                        <Link className="nav-link" to="/register">Register</Link>
                    </>
                )}
            </div>
        </header>
    )
}

export default NavBar
