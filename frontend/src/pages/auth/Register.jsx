import { useEffect } from "react"
import RegisterForm from "../../components/auth/RegisterForm"
import useAuth from "../../hooks/useAuth"

function Register() {
    const { logout } = useAuth()

    useEffect(() => {
        logout()
    }, [])
    
    return <RegisterForm />
}

export default Register
