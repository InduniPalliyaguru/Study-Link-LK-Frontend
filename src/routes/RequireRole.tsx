import { Navigate, Outlet } from "react-router-dom"
import { useAppSelector } from "../app/hooks"
import type { User } from "../types/api"
import { homeFor } from "../utils/roles"

interface RequireRoleProps {
  role: User["role"]
}

export default function RequireRole({ role }: RequireRoleProps) {
  const user = useAppSelector((state) => state.auth.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== role) {
    return <Navigate to={homeFor(user.role)} replace />
  }

  return <Outlet />
}
