import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { clearError, register } from "../features/auth/authSlice"
import AuthLayout from "../components/AuthLayout"
import { DISTRICTS, EDUCATION_LEVELS } from "../utils/constants"
import { inputClass } from "../utils/styles"
import { homeFor } from "../utils/roles"
import PasswordInput from "../components/PasswordInput"

export default function Register() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, status, error } = useAppSelector((state) => state.auth)

  const [form, setForm] = useState({
    name: "",
    email: "",
    district: "",
    educationLevel: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [formError, setFormError] = useState("")

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  if (user) {
    return <Navigate to={homeFor(user.role)} replace />
  }

  const update = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError("")

    if (form.password.length < 8) {
      setFormError("Password must be at least 8 characters")
      return
    }

    if (form.password !== form.confirmPassword) {
      setFormError("Passwords do not match")
      return
    }

    const result = await dispatch(
      register({
        name: form.name,
        email: form.email,
        password: form.password,
        district: form.district,
        educationLevel: form.educationLevel || undefined,
        phone: form.phone || undefined,
      }),
    )

    if (register.fulfilled.match(result)) {
      navigate("/login", { replace: true, state: { registered: true } })
    }
  }

  const label = "mt-3 mb-1.5 block text-sm font-bold"

  return (
    <AuthLayout
      active="register"
      title="Create your account"
      subtitle="Join students across Sri Lanka"
    >
      <form onSubmit={handleSubmit} className="mt-2">
        <label htmlFor="name" className={label}>
          Full name
        </label>
        <input
          id="name"
          className={inputClass}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />

        <label htmlFor="email" className={label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          className={inputClass}
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />

        <div className="grid gap-x-4 sm:grid-cols-2">
          <div>
            <label htmlFor="district" className={label}>
              District
            </label>
            <select
              id="district"
              className={inputClass}
              value={form.district}
              onChange={(e) => update("district", e.target.value)}
              required
            >
              <option value="">Select district</option>
              {DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="level" className={label}>
              Education level
            </label>
            <select
              id="level"
              className={inputClass}
              value={form.educationLevel}
              onChange={(e) => update("educationLevel", e.target.value)}
            >
              <option value="">Optional</option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label htmlFor="phone" className={label}>
          Phone (optional)
        </label>
        <input
          id="phone"
          className={inputClass}
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />

        <div className="grid gap-x-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className={label}>
              Password
            </label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="confirm" className={label}>
              Confirm password
            </label>
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              required
            />
          </div>
        </div>

        <p className="mt-2 min-h-5 text-sm text-bad" role="alert">
          {formError || error}
        </p>

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 w-full rounded-xl bg-linear-to-br from-brand-1 to-brand-2 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
        >
          {status === "loading" ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  )
}
