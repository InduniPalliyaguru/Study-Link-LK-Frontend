import { useEffect, useState } from "react"
import { api } from "./services/api"

type Theme = "dark" | "light"

interface Subject {
  _id: string
  name: string
  colorKey: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export default function App() {
  const [theme, setTheme] = useState<Theme>("dark")
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    api
      .get<ApiResponse<Subject[]>>("/subjects")
      .then((response) => setSubjects(response.data.data))
      .catch(() => setError("Could not reach the server. Is the backend running?"))
  }, [])

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"))
  }

  return (
    <div className="min-h-screen bg-bg p-8 font-sans text-ink">
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-card p-6">
        <h1 className="font-display text-2xl font-bold">StudyLink LK</h1>
        <p className="mt-1 text-mute">Subjects loaded from the backend:</p>

        {error && <p className="mt-4 text-bad">{error}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <span
              key={subject._id}
              className="flex items-center gap-2 rounded-full border border-line px-3 py-1 text-sm font-semibold"
            >
              <i className="h-2 w-2 rounded-full" style={{ background: `var(--s${subject.colorKey})` }} />
              {subject.name}
            </span>
          ))}
        </div>

        <button onClick={toggleTheme} className="mt-6 rounded-xl border border-line px-4 py-2 font-semibold">
          Switch to {theme === "dark" ? "light" : "dark"}
        </button>
      </div>
    </div>
  )
}