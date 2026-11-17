import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { clearError, login } from "../features/auth/authSlice"
import AuthLayout from "../components/AuthLayout"
import { inputClass } from "../utils/styles"
import { homeFor } from "../utils/roles"
import PasswordInput from "../components/PasswordInput"

export default function Login() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { user, status, error } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const routeState = location.state as {
    registered?: boolean
    reset?: boolean
  } | null
  const justRegistered = routeState?.registered
  const justReset = routeState?.reset

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  if (user) {
    return <Navigate to={homeFor(user.role)} replace />
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

        {justReset && (
          <p
            className="mb-2 rounded-xl bg-ok/15 px-4 py-2 text-sm font-semibold text-ok"
            role="status"
          >
            Password changed. Log in with your new password.
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
        <PasswordInput
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="mt-2 text-right">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-brand-2 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

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
