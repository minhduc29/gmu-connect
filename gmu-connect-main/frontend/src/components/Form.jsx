import { useState } from "react";
import api from "../api"
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css"

function Form({route, method}){
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirm_password, setConfirm_password] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const name = method === "login" ? "Login" : "Register"

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try{
            console.log({ username, email, password, confirm_password });
            const res = await api.post(route,{username, email, password, confirm_password }, { headers: { "Content-Type": "application/json" }})
            if(method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/")
            } else{
                navigate("/login")
            }
        }catch(error) {
            if (error.response?.data?.email) {
                setErrorMessage(error.response.data.email[0]);
              } else {
                setErrorMessage("Something went wrong.");
              }
        }finally{
            setLoading(false)
        }
    };

    return <form onSubmit={handleSubmit} className="form-container">
        <h1>{name}</h1>
        <input
            className="form-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"   
        />
        <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"   
        />
        <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"   
        />
        <input
            className="form-input"
            type="password"
            value={confirm_password}
            onChange={(e) => setConfirm_password(e.target.value)}
            placeholder="Confirm_Password"   
        />
        <button className="form-button" type="submit">
            {name}
        </button>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </form>

}

export default Form