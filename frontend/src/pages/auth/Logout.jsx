import { useEffect } from "react"
import { Navigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth"

function Logout() {
    const { logout } = useAuth()

    useEffect(() => {
        logout()
    }, [])

    return <Navigate to="/login" />
}

export default Logout
