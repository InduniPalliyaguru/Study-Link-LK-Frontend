import { NavLink, Outlet, useLocation } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { logoutUser } from "../features/auth/authSlice"
import Logo from "../components/Logo"
import ThemeToggle from "../components/ThemeToggle"
import { navLinkClass } from "../utils/styles"
import { useEffect, useState } from "react"
import { loadSavedIds } from "../features/saved/savedSlice"
import { api } from "../services/api"
import type { ApiResponse, RequestItem } from "../types/api"

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/browse", label: "Browse", end: false },
  { to: "/sell", label: "Sell", end: false },
  { to: "/my-listings", label: "My listings", end: false },
  { to: "/requests", label: "Requests", end: false },
  { to: "/profile", label: "Profile", end: false },
]

export default function StudentLayout() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  const location = useLocation()

  useEffect(() => {
    dispatch(loadSavedIds())
  }, [dispatch])

  const [pendingRequests, setPendingRequests] = useState(0)

  useEffect(() => {
    api
      .get<ApiResponse<RequestItem[]>>("/requests/received")
      .then((response) =>
        setPendingRequests(
          response.data.data.filter((item) => item.status === "pending").length,
        ),
      )
      .catch(() => setPendingRequests(0))
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-line bg-bg/70 px-4 py-2.5 backdrop-blur-xl md:px-6">
        <Logo className="h-10 w-auto" />

        <nav className="flex gap-1 overflow-x-auto" aria-label="Main">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={navLinkClass}
            >
              {link.label}
              {link.to === "/requests" && pendingRequests > 0 && (
                <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-extrabold text-black/80">
                  {pendingRequests}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <span className="hidden max-w-56 truncate text-sm font-semibold text-mute sm:block">
          {user?.email}
        </span>
        <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-extrabold text-black/80">
          Student
        </span>
        <ThemeToggle />
        <button
          onClick={() => dispatch(logoutUser())}
          className="rounded-xl border border-line px-3 py-2 text-sm font-semibold hover:bg-card"
        >
          Log out
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl p-4 md:p-7">
        <Outlet />
      </main>
    </div>
  )
}
