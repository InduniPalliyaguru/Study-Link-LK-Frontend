import { useState } from "react"
import { api } from "./services/api"
import { tokenStorage } from "./services/tokenStorage"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface LoginData {
  accessToken: string
  refreshToken: string
  user: User
}

export default function App() {
  const [email, setEmail] = useState("test@mail.lk")
  const [password, setPassword] = useState("password123")
  const [message, setMessage] = useState("Not logged in")

  const login = async () => {
    try {
      const response = await api.post<ApiResponse<LoginData>>("/auth/login", {
        email,
        password,
      })
      const { accessToken, refreshToken, user } = response.data.data

      tokenStorage.setTokens(accessToken, refreshToken)
      setMessage(`Logged in as ${user.email} (${user.role})`)
    } catch {
      setMessage("Login failed. Check the email and password")
    }
  }

  const loadMe = async () => {
    try {
      const response = await api.get<ApiResponse<User>>("/auth/me")
      setMessage(`/auth/me says: ${response.data.data.email}`)
    } catch {
      setMessage("Request failed. You are not logged in")
    }
  }

  const logout = () => {
    tokenStorage.clear()
    setMessage("Tokens removed")
  }

  const field =
    "w-full rounded-xl border border-line bg-card px-3 py-2 text-ink"
  const button = "rounded-xl border border-line px-4 py-2 font-semibold"

  return (
    <div className="min-h-screen bg-bg p-8 font-sans text-ink">
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-card p-6">
        <h1 className="font-display text-2xl font-bold">Token test</h1>

        <input
          className={`${field} mt-4`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={`${field} mt-2`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={login} className={button}>
            Login
          </button>
          <button onClick={loadMe} className={button}>
            Call /auth/me
          </button>
          <button onClick={logout} className={button}>
            Remove tokens
          </button>
        </div>

        <p className="mt-4 text-mute">{message}</p>
      </div>
    </div>
  )
}
