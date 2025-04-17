import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
//import "./styles/navbar.css"; //need to implement

function Navbar() {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">GMU Connect</Link>
            </div>
            <ul className="navbar-links">
                {isAuthenticated ? (
                    <>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/profiles">Profiles</Link></li>
                        <li><Link to="/chat">Chat</Link></li>
                        <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;