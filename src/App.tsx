import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { clearSession, loadSession, login, logoutUser } from "./features/auth/authSlice"

export default function App() {
  const dispatch = useAppDispatch()
  const { user, status, error, initialized } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState("test@mail.lk")
  const [password, setPassword] = useState("password123")

  useEffect(() => {
    dispatch(loadSession())
  }, [dispatch])

  useEffect(() => {
    const onLogout = () => dispatch(clearSession())

    window.addEventListener("auth:logout", onLogout)
    return () => window.removeEventListener("auth:logout", onLogout)
  }, [dispatch])

  const field = "w-full rounded-xl border border-line bg-card px-3 py-2 text-ink"

  if (!initialized) {
    return <div className="min-h-screen bg-bg p-8 text-mute">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-bg p-8 font-sans text-ink">
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-card p-6">
        <h1 className="font-display text-2xl font-bold">Redux auth test</h1>

        {user ? (
          <div className="mt-4">
            <p>
              Logged in as <b>{user.name}</b> ({user.email})
            </p>
            <p className="text-mute">Role: {user.role}</p>
            <button
              onClick={() => dispatch(logoutUser())}
              className="mt-4 rounded-xl border border-line px-4 py-2 font-semibold"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <input className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
            <input
              className={`${field} mt-2`}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="mt-3 text-bad">{error}</p>}
            <button
              onClick={() => dispatch(login({ email, password }))}
              disabled={status === "loading"}
              className="mt-4 rounded-xl bg-linear-to-br from-brand-1 to-brand-2 px-4 py-2 font-bold text-white disabled:opacity-60"
            >
              {status === "loading" ? "Logging in..." : "Log in"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}