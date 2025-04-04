import { useContext, useEffect } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"

function Logout() {
    const { logout } = useContext(AuthContext)

    useEffect(() => logout(), [])

    return <Navigate to="/login" />
}

export default Logout
