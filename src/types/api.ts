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

export interface ListingDetail extends ListingSummary {
  description: string
  status: "available" | "reserved" | "sold"
  seller: { _id: string; name: string; district: string; createdAt: string }
}

export interface PublicProfile {
  id: string
  name: string
  district: string
  joinedAt: string
  booksSold: number
  rating: { average: number; count: number }
}

export interface RequestInput {
  listing: string
  message?: string
  deliveryMethod: "meetup" | "courier"
  deliveryAddress?: string
}

export type ListingStatus =
  | "pending"
  | "available"
  | "reserved"
  | "sold"
  | "rejected"
  | "removed"

export interface MyListing {
  _id: string
  title: string
  description: string
  price: number
  condition: string
  district: string
  images: string[]
  status: ListingStatus
  rejectionReason?: string
  deliveryOptions: "meetup" | "courier" | "both"
  subject: { _id: string; name: string; colorKey: number }
  gradeLevel: { _id: string; name: string }
  createdAt: string
}

export type RequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "shipped"
  | "completed"

export interface Person {
  _id?: string
  name: string
  district: string
  phone?: string
  email?: string
}

export interface RequestItem {
  _id: string
  listing: {
    _id: string
    title: string
    price: number
    images: string[]
    status: string
  } | null
  buyer?: Person
  seller?: Person
  message?: string
  deliveryMethod: "meetup" | "courier"
  deliveryAddress?: string
  status: RequestStatus
  trackingNumber?: string
  shippedAt?: string
  handoverCodeExpires?: string
  verified: boolean
  createdAt: string
}

export interface ReviewItem {
  _id: string
  rating: number
  comment?: string
  verified: boolean
  createdAt: string
  reviewer: { name: string } | null
}

export interface ReviewsData {
  reviews: ReviewItem[]
  summary: { average: number; count: number }
}

export interface DashboardStats {
  students: number
  activeListings: number
  pendingListings: number
  booksSold: number
  openReports: number
  pendingRequests: number
  completedRequests: number
  bySubject: { name: string; colorKey: number; count: number }[]
}

export interface AdminListing {
  _id: string
  title: string
  price: number
  condition: string
  district: string
  images: string[]
  status: string
  createdAt: string
  subject: { name: string; colorKey: number }
  gradeLevel: { name: string }
  seller: { name: string; email: string; phone?: string; district: string }
}

export interface AdminUser {
  _id: string
  name: string
  email: string
  role: "USER" | "ADMIN"
  phone?: string
  district: string
  institution?: string
  educationLevel?: string
  isBlocked: boolean
  createdAt: string
}

export interface AdminRequest {
  _id: string
  listing: {
    _id: string
    title: string
    images: string[]
    status: string
  } | null
  buyer: { name: string; email: string; district: string } | null
  seller: { name: string; email: string; district: string } | null
  status: string
  deliveryMethod: "meetup" | "courier"
  trackingNumber?: string
  verified: boolean
  createdAt: string
}

export interface MeetupPoint {
  _id: string
  name: string
  district: string
  address?: string
  description?: string
  isActive: boolean
}

export type ReportReason =
  | "wrong_price"
  | "wrong_subject"
  | "spam"
  | "inappropriate"
  | "other"

export interface AdminReport {
  _id: string
  reason: ReportReason
  details?: string
  status: "open" | "resolved" | "dismissed"
  action?: "dismissed" | "listing_removed" | "seller_blocked"
  createdAt: string
  resolvedAt?: string
  listing: {
    _id: string
    title: string
    images: string[]
    status: string
    isDeleted: boolean
    seller: {
      name: string
      email: string
      district: string
      isBlocked?: boolean
    } | null
  } | null
  reporter: { name: string } | null
  resolvedBy: { name: string } | null
}
