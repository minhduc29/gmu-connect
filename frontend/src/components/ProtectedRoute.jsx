import { Navigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

function ProtectedRoute({ children }) {
    const { loading, isAuthenticated } = useContext(AuthContext)

    if (loading) return <div>Loading...</div>

    return isAuthenticated ? children : <Navigate to="/login" />
}

export default ProtectedRoute
