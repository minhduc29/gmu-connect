import Login from "../pages/auth/Login"
import Logout from "../pages/auth/Logout"
import Register from "../pages/auth/Register"

export default [
    { path: "/login", element: <Login /> },
    { path: "/logout", element: <Logout /> },
    { path: "/register", element: <Register /> }
]
