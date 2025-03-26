import type { LucideIcon } from "lucide-react"

export interface User {
  _id: string
  name: string
  email: string
  role: "customer" | "provider" | "admin"
  profileImage?: string
  bio?: string
  phone?: string
  location?: string
  rating?: number
  totalReviews?: number
  badges?: string[]
  createdAt: string
  updatedAt: string
}

export interface Provider extends User {
  services?: Service[]
  specialties?: string[]
  availability?: string
  education?: string
  experience?: string
}

export interface Category {
  _id: string
  name: string
  icon?: string
  description?: string
  count?: number
  createdAt: string
  updatedAt: string
}

export interface Service {
  _id: string
  title: string
  description: string
  price: number
  priceType?: string
  location: string
  provider: User
  category: Category
  categoryId: string
  features: string[]
  images?: string[]
  rating?: number
  reviewCount?: number
  availability?: string
  deliveryTime?: string
  featured?: boolean
  discount?: number
  status: "active" | "inactive" | "pending"
  createdAt: string
  updatedAt: string
}

export interface Review {
  _id: string
  service: Service
  reviewer: User
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
}

export interface Booking {
  _id: string
  service: Service
  customer: User
  provider: User
  date: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes?: string
  price: number
  paymentStatus: "pending" | "paid" | "refunded"
  createdAt: string
  updatedAt: string
}

export interface Message {
  _id: string
  sender: User
  recipient: User
  content: string
  read: boolean
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  _id: string
  booking: Booking
  amount: number
  paymentMethod: string
  status: "pending" | "completed" | "failed" | "refunded"
  reference: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  count: number
  total: number
  totalPages: number
  currentPage: number
  message?: string
}

export interface Notification {
  _id: string
  recipient: User
  type: "booking" | "message" | "review" | "payment" | "system"
  title: string
  content: string
  read: boolean
  data?: {
    bookingId?: string
    serviceId?: string
    userId?: string
    messageId?: string
    reviewId?: string
  }
  createdAt: string
  updatedAt: string
}

// Map for category icons
export const categoryIconMap: Record<string, LucideIcon> = {}

