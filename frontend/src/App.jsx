import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import Profile from "./pages/Profile"
import Chat from "./pages/Chat"
import AuthRoutes from "./routes/AuthRoutes"
import "./styles/form.css"
import "./styles/chat.css"
import "./styles/app.css"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {AuthRoutes.map(route => (
            <Route key={route.path} path={route.path} element={<Layout>{route.element}</Layout>} />
          ))}
          <Route path="/" element={<Layout><ProtectedRoute><Home /></ProtectedRoute></Layout>} />
          <Route path="/profiles/:username" element={<Layout><ProtectedRoute><Profile /></ProtectedRoute></Layout>} />
          <Route path="/chat" element={<Layout><ProtectedRoute><Chat /></ProtectedRoute></Layout>} />
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
