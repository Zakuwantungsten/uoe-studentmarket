import type { LucideIcon } from "lucide-react"

// User types
export interface User {
  profileImage: string | undefined
  _id: string
  name: string
  email: string
  studentId?: string
  image?: string
  role: "USER" | "PROVIDER" | "ADMIN"
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  bio?: string
  phone?: string
  address?: string
  skills?: string[]
  education?: {
    institution: string
    degree: string
    field: string
    from: Date
    to?: Date
    current: boolean
    description?: string
  }[]
  certifications?: {
    name: string
    organization: string
    issueDate: Date
    expiryDate?: Date
    credentialId?: string
    credentialUrl?: string
  }[]
  socialMedia?: {
    twitter?: string
    facebook?: string
    instagram?: string
    linkedin?: string
    github?: string
  }
  rating: number
  reviewCount: number
  completedServices: number
  earnings: number
  notifications?: {
    email: boolean
    marketing: boolean
    newMessages: boolean
    serviceUpdates: boolean
  }
  lastActive?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Provider extends User {
  services?: Service[]
  specialties?: string[]
  availability?: string
  experience?: string
}

export interface Category {
  _id: string
  name: string
  icon?: string
  description?: string
  count?: number
  serviceCount?: number
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

export interface Report {
  _id: string
  type: string
  startDate: string
  endDate: string
}

// Map for category icons
export const categoryIconMap: Record<string, LucideIcon> = {}

