import { useAppDispatch, useAppSelector } from "../app/hooks"
import { logoutUser } from "../features/auth/authSlice"
import ThemeToggle from "../components/ThemeToggle"

export default function Home() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto flex max-w-3xl items-center justify-between rounded-2xl border border-line bg-card p-5">
        <div>
          <h1 className="font-display text-xl font-bold">
            Welcome, {user?.name}
          </h1>
          <p className="text-mute">
            {user?.email} · {user?.role}
          </p>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          <button
            onClick={() => dispatch(logoutUser())}
            className="rounded-xl border border-line px-4 py-2 font-semibold"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
