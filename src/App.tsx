import { useEffect } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { clearSession, loadSession } from "./features/auth/authSlice"
import Login from "./pages/Login"
import Home from "./pages/Home"
import Register from "./pages/Register"

export default function App() {
  const dispatch = useAppDispatch()
  const { user, initialized } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(loadSession())
  }, [dispatch])

  useEffect(() => {
    const onLogout = () => dispatch(clearSession())

    window.addEventListener("auth:logout", onLogout)
    return () => window.removeEventListener("auth:logout", onLogout)
  }, [dispatch])

  if (!initialized) {
    return <div className="min-h-screen p-8 text-mute">Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={user ? <Home /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
