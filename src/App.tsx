import { useEffect } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { clearSession, loadSession } from "./features/auth/authSlice"
import RequireRole from "./routes/RequireRole"
import StudentLayout from "./layouts/StudentLayout"
import AdminLayout from "./layouts/AdminLayout"
import PagePlaceholder from "./components/PagePlaceholder"
import Login from "./pages/Login"
import Register from "./pages/Register"
import StudentHome from "./pages/StudentHome"
import Browse from "./pages/Browse"
import ListingDetail from "./pages/ListingDetail"
import Sell from "./pages/Sell"

export default function App() {
  const dispatch = useAppDispatch()
  const initialized = useAppSelector((state) => state.auth.initialized)

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

        <Route element={<RequireRole role="USER" />}>
          <Route element={<StudentLayout />}>
            <Route path="/" element={<StudentHome />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/sell" element={<Sell />} />
            <Route
              path="/my-listings"
              element={
                <PagePlaceholder
                  title="My listings"
                  description="Books you are selling"
                />
              }
            />
            <Route
              path="/requests"
              element={
                <PagePlaceholder
                  title="Requests"
                  description="Sent and received requests"
                />
              }
            />
            <Route
              path="/profile"
              element={
                <PagePlaceholder title="Profile" description="Your details" />
              }
            />
          </Route>
        </Route>

        <Route element={<RequireRole role="ADMIN" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              index
              element={
                <PagePlaceholder
                  title="Dashboard"
                  description="Platform overview"
                />
              }
            />
            <Route
              path="listings"
              element={
                <PagePlaceholder
                  title="Listings"
                  description="Review and approve listings"
                />
              }
            />
            <Route
              path="requests"
              element={
                <PagePlaceholder
                  title="Requests"
                  description="Monitor requests"
                />
              }
            />
            <Route
              path="users"
              element={
                <PagePlaceholder title="Users" description="Manage students" />
              }
            />
            <Route
              path="subjects"
              element={
                <PagePlaceholder
                  title="Subjects and grades"
                  description="Manage categories"
                />
              }
            />
            <Route
              path="reports"
              element={
                <PagePlaceholder title="Reports" description="Handle reports" />
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
