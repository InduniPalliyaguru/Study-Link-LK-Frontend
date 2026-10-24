import { useEffect, useState } from "react"

type Theme = "dark" | "light"

export default function App() {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"))
  }

  return (
    <div className="min-h-screen bg-bg p-8 font-sans text-ink">
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-card p-6">
        <h1 className="font-display text-2xl font-bold">StudyLink LK</h1>
        <p className="mt-1 text-mute">Our own colours are working.</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button className="rounded-xl bg-linear-to-br from-brand-1 to-brand-2 px-4 py-2 font-bold text-white">
            Primary button
          </button>
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-line px-4 py-2 font-semibold"
          >
            Switch to {theme === "dark" ? "light" : "dark"}
          </button>
        </div>
      </div>
    </div>
  )
}
