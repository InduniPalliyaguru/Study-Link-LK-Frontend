import { useEffect } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { clearSession, loadSession } from "./features/auth/authSlice"
import RequireRole from "./routes/RequireRole"
import StudentLayout from "./layouts/StudentLayout"
import AdminLayout from "./layouts/AdminLayout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import StudentHome from "./pages/StudentHome"
import Browse from "./pages/Browse"
import ListingDetail from "./pages/ListingDetail"
import Sell from "./pages/Sell"
import MyListings from "./pages/MyListings"
import Requests from "./pages/Requests"
import Profile from "./pages/Profile"
import Saved from "./pages/Saved"
import Dashboard from "./pages/admin/Dashboard"
import AdminListings from "./pages/admin/Listings"
import AdminUsers from "./pages/admin/Users"
import AdminRequests from "./pages/admin/Requests"
import AdminSubjects from "./pages/admin/Subjects"
import AdminMeetupPoints from "./pages/admin/MeetupPoints"
import AdminReports from "./pages/admin/Reports"
import AdminAnalytics from "./pages/admin/Analytics"

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
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<RequireRole role="ADMIN" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="meetup-points" element={<AdminMeetupPoints />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
