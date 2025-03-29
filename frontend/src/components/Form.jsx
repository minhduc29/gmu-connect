import { useState } from "react";
import api from "../api"
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_NAME } from "../constants";
import "../styles/Form.css"

function Form({route, method}){
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirm_password, setConfirm_password] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [confirm_passwordError, setConfirm_passwordError] = useState("")
    const [isRegistered, setIsRegistered] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const name = method === "Login" ? "Login" : "Register"

    const validateEmail = () => {
        if(email.endsWith("@gmu.edu")){
            setEmailError("");
        }
        else{
            setEmailError("email MUST be gmu email!")
        }
    }
    const validatePassword = () => {
        if(/[A-Z]/       .test(password) ||
           /[a-z]/       .test(password) &&
           /[0-9]/       .test(password) &&
           /[^A-Za-z0-9]/.test(password) &&
           password.length > 4){
            setPasswordError("")
        }
        else{
            setPasswordError("password MUST be larger than length of 4 and combination of number and alphabet!")
        }
    }
    const validateConfirm_password = () => {
        if(password == confirm_password){
            setConfirm_passwordError("");
        }
        else{
            setConfirm_passwordError("passwords do NOT match")
        }
    }

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try{
            console.log(route);
            if(method === "Login") {
                const res = await api.post(route, {username, password}, { headers: { "Content-Type": "application/json" }});
                if(res.status >= 200 && res.status < 300){
                    localStorage.setItem(ACCESS_TOKEN, res.data.access);
                    localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                    localStorage.setItem(USER_NAME, username);
                    navigate("/")
                }
                else{
                    setErrorMessage("Something went wrong with login, please try again.")
                }
            }else{
                const userRes = await api.post(route,{username, email, password, confirm_password }, { headers: { "Content-Type": "application/json" }});
                if(userRes.status >= 200 && userRes.status < 300){
                    setIsRegistered(true);
                    localStorage.setItem("", userRes.data.access); 
                    const userEmail = userRes.data.email;
                    await api.post("/api/auth/verify/", {email: userEmail}, { headers: { "Content-Type": "application/json" }});
                }
                else{
                    setIsRegistered("Something went wrong with registration, Please try again.");
                }
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

    return(
        <div>
            {!isRegistered ?( 
                <form onSubmit={handleSubmit} className="form-container">
                <h1>{name}</h1>
                <input
                    className="form-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"   
                />
                {(method === "Register") &&(
                    <input
                        className="form-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={validateEmail}
                        placeholder="Email"   
                    />
                )}
                {emailError && <p style={{ color: "red" }}>{emailError}</p>}
                <input
                    className="form-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={method === "Register" ? validatePassword : undefined}
                    placeholder="Password"   
                />
                {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
                {(method === "Register") &&(
                    <input
                        className="form-input"
                        type="password"
                        value={confirm_password}
                        onChange={(e) => setConfirm_password(e.target.value)}
                        onBlur={validateConfirm_password}
                        placeholder="Confirm_Password"   
                    />
                )}
                {confirm_passwordError && <p style={{ color: "red" }}>{confirm_passwordError}</p>}
                <button className="form-button" type="submit">
                    {name}
                </button>
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
                </form>
            ):(
                <div>
                <h2>Registration Successful!</h2>
                    <p>Now please check your gmu email box for verification email</p>
                </div>
            )}
        </div>
    );
}

export default Form