export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: Meta
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

export interface Meta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface Subject {
  _id: string
  name: string
  colorKey: number
  isActive: boolean
}

export interface GradeLevel {
  _id: string
  name: string
  description?: string
  isActive: boolean
}

export interface ListingSummary {
  _id: string
  title: string
  price: number
  condition: "New" | "Good" | "Fair"
  district: string
  images: string[]
  deliveryOptions: "meetup" | "courier" | "both"
  subject: { _id: string; name: string; colorKey: number }
  gradeLevel: { _id: string; name: string }
  seller: { _id: string; name: string; district: string }
  createdAt: string
}
