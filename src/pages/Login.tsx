import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { clearError, login } from "../features/auth/authSlice"
import AuthLayout from "../components/AuthLayout"
import { inputClass } from "../utils/styles"

export default function Login() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { user, status, error } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const justRegistered = (location.state as { registered?: boolean } | null)
    ?.registered

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    dispatch(login({ email, password }))
  }

  return (
    <AuthLayout
      active="login"
      title="Welcome back"
      subtitle="Log in to continue"
    >
      <form onSubmit={handleSubmit} className="mt-3">
        {justRegistered && (
          <p
            className="mb-2 rounded-xl bg-ok/15 px-4 py-2 text-sm font-semibold text-ok"
            role="status"
          >
            Account created. You can log in now.
          </p>
        )}

        <label htmlFor="email" className="mt-3 mb-1.5 block text-sm font-bold">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label
          htmlFor="password"
          className="mt-4 mb-1.5 block text-sm font-bold"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <p className="mt-2 min-h-5 text-sm text-bad" role="alert">
          {error}
        </p>

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 w-full rounded-xl bg-linear-to-br from-brand-1 to-brand-2 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
        >
          {status === "loading" ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthLayout>
  )
}
