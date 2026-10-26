import type { User } from "../types/api"

export const homeFor = (role: User["role"]) =>
  role === "ADMIN" ? "/admin" : "/"
