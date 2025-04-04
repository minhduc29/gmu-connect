import { useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import RegisterForm from "../../components/auth/RegisterForm"

function Register() {
    const { logout } = useContext(AuthContext)

    useEffect(() => logout(), [])
    
    return <RegisterForm />
}

export default Register
