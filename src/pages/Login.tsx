import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { clearError, login } from "../features/auth/authSlice"
import AnimatedBackground from "../components/AnimatedBackground"
import BookArt from "../components/BookArt"
import Logo from "../components/Logo"
import ThemeToggle from "../components/ThemeToggle"

const input =
  "w-full rounded-xl border border-line bg-card px-4 py-3 text-ink outline-none transition focus:border-brand-1 focus:ring-4 focus:ring-brand-1/25"

const highlights = [
  { icon: "📚", text: "Buy and sell used books for less" },
  { icon: "🔒", text: "Your contact details stay private until you accept" },
  { icon: "✨", text: "AI helps you write your listing" },
]

export default function Login() {
  const dispatch = useAppDispatch()
  const { user, status, error } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

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
    <div className="grid min-h-screen place-items-center p-5">
      <AnimatedBackground />

      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-card shadow-[0_40px_100px_-40px_rgba(124,92,255,0.6)] backdrop-blur-2xl md:grid-cols-[1.05fr_1fr]">
        <div className="relative flex flex-col justify-center gap-4 overflow-hidden bg-linear-to-br from-brand-1/60 to-brand-2/30 p-9 text-white">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/10" />

          <span className="relative w-fit rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold tracking-wide">
            STUDENT BOOK MARKETPLACE
          </span>
          <h1 className="relative font-display text-3xl font-bold leading-tight">Books that find the next student.</h1>

          <ul className="relative mt-1 space-y-2.5">
            {highlights.map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>

          <div className="relative mt-2">
            <BookArt />
          </div>
        </div>

        <div className="bg-bg/70 p-8 md:p-9">
          <div className="flex items-start justify-between">
            <div className="inline-flex gap-1 rounded-full border border-line bg-card p-1 text-sm font-semibold">
              <span className="rounded-full bg-linear-to-br from-brand-1 to-brand-2 px-4 py-1.5 text-white">Log in</span>
              <Link to="/register" className="rounded-full px-4 py-1.5 text-mute hover:text-ink">
                Register
              </Link>
            </div>
            <ThemeToggle />
          </div>

          <div className="mt-2 flex justify-center">
            <Logo className="h-28 w-auto" />
          </div>

          <h2 className="text-center font-display text-2xl font-bold">Welcome back</h2>
          <p className="mt-1 text-center text-sm text-mute">Log in to continue</p>

          <form onSubmit={handleSubmit} className="mt-3">
            <label htmlFor="email" className="mt-3 mb-1.5 block text-sm font-bold">
              Email
            </label>
            <input id="email" type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label htmlFor="password" className="mt-4 mb-1.5 block text-sm font-bold">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={input}
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
        </div>
      </div>
    </div>
  )
}