import type { LucideIcon } from "lucide-react"
import { DefaultSession, DefaultUser } from "next-auth"

// Core Types
export interface User {
  id: string
  name: string
  email: string
  emailVerified?: Date
  password: string
  image?: string
  phone?: string
  studentId?: string
  bio?: string
  title?: string
  role: "USER" | "PROVIDER" | "ADMIN"
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  createdAt: Date
  updatedAt: Date
}

export interface Provider extends User {
  services?: Service[]
  specialties?: string[]
  availability?: string
  education?: Education[]
  certification?: Certification[]
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  slug: string
  count?: number
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  id: string
  title: string
  description: string
  price: number
  priceType?: string
  location: string
  image?: string
  featured?: boolean
  discount?: number
  availability?: string
  deliveryTime?: string
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  provider: User
  category: Category
  features: ServiceFeature[]
  createdAt: Date
  updatedAt: Date
}

export interface ServiceFeature {
  id: string
  feature: string
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  customer: User
  provider: User
  service: Service
  date: Date
  startTime?: Date
  endTime?: Date
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  totalAmount: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  rating: number
  comment?: string
  reviewer: User
  reviewee: User
  service: Service
  booking: Booking
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  content: string
  sender: User
  recipient: User
  read: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  amount: number
  currency: string
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
  paymentMethod: string
  paymentId?: string
  user: User
  booking?: Booking
  createdAt: Date
  updatedAt: Date
}

export interface Education {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  startDate: Date
  endDate?: Date
  current?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Certification {
  id: string
  name: string
  organization: string
  issueDate: Date
  expiryDate?: Date
  credentialId?: string
  credentialUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Discussion {
  id: string
  title: string
  content: string
  author: User
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  content: string
  author: User
  discussion: Discussion
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  title: string
  description: string
  location: string
  startDate: Date
  endDate: Date
  image?: string
  organizer: User
  createdAt: Date
  updatedAt: Date
}

// NextAuth Type Extensions
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User & DefaultSession["user"]
  }
  
  interface User extends DefaultUser {
    role: "USER" | "PROVIDER" | "ADMIN"
    studentId?: string
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User
  }
}

// Response Types
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
  id: string
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
  createdAt: Date
  updatedAt: Date
}

// Map for category icons
export const categoryIconMap: Record<string, LucideIcon> = {}