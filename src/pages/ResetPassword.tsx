import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { api } from "../services/api"
import AuthLayout from "../components/AuthLayout"
import { getErrorMessage } from "../utils/errors"
import { inputClass } from "../utils/styles"

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirm) {
      setError("The passwords do not match")
      return
    }

    setSaving(true)

    try {
      await api.post("/auth/reset-password", { token, newPassword: password })
      navigate("/login", { replace: true, state: { reset: true } })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthLayout
      active="login"
      title="Choose a new password"
      subtitle="Use at least 8 characters"
    >
      {!token ? (
        <p
          className="mt-5 rounded-xl bg-bad/15 p-4 text-sm font-semibold text-bad"
          role="alert"
        >
          This reset link is not complete. Please open the link from your email
          again, or request a new one.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4">
          <label htmlFor="password" className="mb-1.5 block text-sm font-bold">
            New password
          </label>
          <input
            id="password"
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label
            htmlFor="confirm"
            className="mt-4 mb-1.5 block text-sm font-bold"
          >
            Confirm new password
          </label>
          <input
            id="confirm"
            type="password"
            className={inputClass}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <p className="mt-2 min-h-5 text-sm text-bad" role="alert">
            {error}
          </p>

          <button
            disabled={saving}
            className="mt-2 w-full rounded-xl bg-linear-to-br from-brand-1 to-brand-2 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Change password"}
          </button>
        </form>
      )}

      <p className="mt-5 text-center text-sm">
        <Link
          to="/forgot-password"
          className="font-semibold text-brand-2 hover:underline"
        >
          Request a new link
        </Link>
      </p>
    </AuthLayout>
  )
}
