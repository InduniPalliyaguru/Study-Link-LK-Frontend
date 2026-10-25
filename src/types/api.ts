export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface User {
  id: string
  name: string
  email: string
  role: "USER" | "ADMIN"
  phone?: string
  district?: string
  institution?: string
  educationLevel?: string
  createdAt?: string
}

export interface LoginData {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  district: string
  phone?: string
  institution?: string
  educationLevel?: string
}
