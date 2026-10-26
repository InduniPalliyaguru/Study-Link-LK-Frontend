import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import AnimatedBackground from "./AnimatedBackground"
import BookArt from "./BookArt"
import Logo from "./Logo"
import ThemeToggle from "./ThemeToggle"

const highlights = [
  { icon: "📚", text: "Buy and sell used books for less" },
  { icon: "🔒", text: "Your contact details stay private until you accept" },
  { icon: "✨", text: "AI helps you write your listing" },
]

interface AuthLayoutProps {
  active: "login" | "register"
  title: string
  subtitle: string
  children: ReactNode
}

export default function AuthLayout({
  active,
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  const activeTab =
    "rounded-full bg-linear-to-br from-brand-1 to-brand-2 px-4 py-1.5 text-white"
  const otherTab = "rounded-full px-4 py-1.5 text-mute hover:text-ink"

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
          <h1 className="relative font-display text-3xl font-bold leading-tight">
            Books that find the next student.
          </h1>

          <ul className="relative mt-1 space-y-2.5">
            {highlights.map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15">
                  {item.icon}
                </span>
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
              {active === "login" ? (
                <span className={activeTab}>Log in</span>
              ) : (
                <Link to="/login" className={otherTab}>
                  Log in
                </Link>
              )}
              {active === "register" ? (
                <span className={activeTab}>Register</span>
              ) : (
                <Link to="/register" className={otherTab}>
                  Register
                </Link>
              )}
            </div>
            <ThemeToggle />
          </div>

          <div className="mt-2 flex justify-center">
            <Logo className="h-24 w-auto" />
          </div>

          <h2 className="text-center font-display text-2xl font-bold">
            {title}
          </h2>
          <p className="mt-1 text-center text-sm text-mute">{subtitle}</p>

          {children}
        </div>
      </div>
    </div>
  )
}
