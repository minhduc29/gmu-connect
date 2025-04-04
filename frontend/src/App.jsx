import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import Profile from "./pages/Profile"
import AuthRoutes from "./routes/AuthRoutes"
import "./styles/form.css"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {AuthRoutes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profiles/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
