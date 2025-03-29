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
  paidAt: string
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

// Communication types
export interface Announcement {
  _id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'critical' | 'error' | 'success';
  status: 'active' | 'inactive';
  targetPages?: string[];
  displayLocation?: string;
  startDate?: string;
  endDate?: string;
  expiryDate?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  _id: string;
  ticketId: string;
  subject: string;
  description: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  user: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    role?: string;
  };
  content: string;
  attachments?: string[];
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TicketStats {
  open: number;
  resolvedToday: number;
  averageResponseTime: string | number;
}

// Data interface for ticket response/message submission
export interface TicketMessageData {
  responseText: string;
  status: 'in-progress' | 'resolved' | 'closed';
}

// Data interface for ticket response from API
export interface TicketResponseData {
  content: string;
  message?: string; // Added for backward compatibility
  status: 'in-progress' | 'resolved' | 'closed';
}

// Data interface for ticket creation
export interface TicketCreateData {
  userEmail: string;
  subject: string;
  description?: string; // Added to match API expectation
  category: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface BulkNotification {
  _id: string;
  title: string;
  content: string;
  recipientType: 'all' | 'providers' | 'customers' | 'inactive' | 'custom';
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  notificationType: 'email' | 'in-app' | 'both';
  createdBy: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Map for category icons
export const categoryIconMap: Record<string, LucideIcon> = {}

