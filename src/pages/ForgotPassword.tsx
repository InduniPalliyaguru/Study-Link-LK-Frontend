import { useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router-dom"
import { api } from "../services/api"
import AuthLayout from "../components/AuthLayout"
import { getErrorMessage } from "../utils/errors"
import { inputClass } from "../utils/styles"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setSending(true)

    try {
      await api.post("/auth/forgot-password", { email })
      setSent(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthLayout
      active="login"
      title="Forgot your password?"
      subtitle="We will email you a link to choose a new one"
    >
      {sent ? (
        <p
          className="mt-5 rounded-xl bg-ok/15 p-4 text-sm font-semibold text-ok"
          role="status"
        >
          If an account exists for <b>{email}</b>, we sent a reset link. Check
          your inbox (and the spam folder). The link works for 30 minutes.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4">
          <label htmlFor="email" className="mb-1.5 block text-sm font-bold">
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

          <p className="mt-2 min-h-5 text-sm text-bad" role="alert">
            {error}
          </p>

          <button
            disabled={sending}
            className="mt-2 w-full rounded-xl bg-linear-to-br from-brand-1 to-brand-2 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-5 text-center text-sm">
        <Link
          to="/login"
          className="font-semibold text-brand-2 hover:underline"
        >
          Back to log in
        </Link>
      </p>
    </AuthLayout>
  )
}
