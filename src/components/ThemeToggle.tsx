import { useState } from "react"

const KEY = "studylink_theme"

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark",
  )

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark"
    document.documentElement.dataset.theme = next
    localStorage.setItem(KEY, next)
    setTheme(next)
  }

  return (
    <button
      onClick={toggle}
      aria-label="Switch light or dark mode"
      className="h-10 w-10 rounded-xl border border-line bg-card text-lg transition hover:rotate-12"
    >
      {theme === "dark" ? "☀" : "🌙"}
    </button>
  )
}
