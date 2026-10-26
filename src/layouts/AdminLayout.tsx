import { NavLink, Outlet } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { logoutUser } from "../features/auth/authSlice"
import Logo from "../components/Logo"
import ThemeToggle from "../components/ThemeToggle"
import { navLinkClass } from "../utils/styles"

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/listings", label: "Listings", end: false },
  { to: "/admin/requests", label: "Requests", end: false },
  { to: "/admin/users", label: "Users", end: false },
  { to: "/admin/subjects", label: "Subjects", end: false },
  { to: "/admin/reports", label: "Reports", end: false },
]

export default function AdminLayout() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  const logout = (
    <button
      onClick={() => dispatch(logoutUser())}
      className="rounded-xl border border-line px-3 py-2 text-sm font-semibold hover:bg-card"
    >
      Log out
    </button>
  )

  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      <aside className="flex flex-col gap-3 border-b border-line bg-bg/70 p-3 backdrop-blur-xl md:sticky md:top-0 md:h-screen md:border-r md:border-b-0 md:p-4">
        <div className="flex items-center justify-between">
          <Logo className="h-12 w-auto" />
          <div className="flex gap-2 md:hidden">
            <ThemeToggle />
            {logout}
          </div>
        </div>

        <nav
          className="flex gap-1 overflow-x-auto md:flex-col"
          aria-label="Admin"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={navLinkClass}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden flex-col gap-3 md:flex">
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-1 to-brand-2 font-extrabold text-white">
              {user?.email[0].toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">Admin</p>
              <p className="truncate text-xs text-mute">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <div className="flex-1 [&>button]:w-full">{logout}</div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 p-4 md:p-7">
        <Outlet />
      </main>
    </div>
  )
}
