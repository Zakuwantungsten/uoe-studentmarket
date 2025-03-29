import { apiClient, handleApiError } from "@/lib/api-client"

// Types
interface DashboardStats {
  totalUsers: number
  totalServices: number
  totalBookings: number
  totalEarnings: number
  newUsersToday: number
  newServicesToday: number
  bookingsToday: number
  pendingBookings: number
  completedBookings: number
  usersByRole?: { role: string; _count: number }[]
  servicesByCategory?: { category: string; count: number }[]
  bookingsByStatus?: { status: string; _count: number }[]
  recentUsers?: any[]
  recentBookings?: any[]
  recentServices?: any[]
  pendingServices?: any[]
  pendingReviews?: any[]
  recentReports?: any[]
  recentDisputes?: any[]
  systemHealth?: {
    serverUptime: string
    apiStatus: "healthy" | "degraded" | "down"
    storageUsage: string
    recentErrors: number
  }
}


// Activity item type
export interface ActivityItem {
  id: string
  type: "signup" | "booking" | "service" | "review" | "admin" | "system"
  description: string
  user?: { id: string; name: string; image?: string }
  timestamp: string
  status?: string
}

// Revenue data point
export interface RevenueDataPoint {
  name: string
  revenue: number
  date: string
}

// Category distribution item
export interface CategoryItem {
  name: string
  value: number
  count: number
}

// Flagged content item
export interface FlaggedItem {
  id: string
  type: string
  content: string
  reporter: string
  reported: string
  date: string
  status: string
}

// System alert
export interface SystemAlert {
  id: string
  title: string
  description: string
  severity: "critical" | "warning" | "info"
}
interface DisputeQuery {
  page?: number
  limit?: number
  status?: string
  type?: string
  search?: string
  sort?: string
}

interface ReviewQuery {
  page?: number
  limit?: number
  status?: string
  flagged?: boolean
  rating?: number
  service?: string
  search?: string
  sort?: string
}

interface ServiceQuery {
  page?: number
  limit?: number
  category?: string
  provider?: string
  featured?: boolean
  search?: string
  sort?: string
}

interface UserQuery {
  page?: number
  limit?: number
  role?: string
  search?: string
  sort?: string
}

// Dashboard
export async function getDashboardStats(timeframe: string = "week", token?: string): Promise<DashboardStats> {
  try {
    const params: Record<string, string> = { period: timeframe }
    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>("/admin/dashboard", { 
      params,
      token 
    })
    
    if (!response.success) {
      throw new Error("Failed to load dashboard stats")
    }
    
    return response.data
  } catch (error) {
    handleApiError(error, "Failed to load admin dashboard data")
    throw error
  }
}

// User Management
export async function getUsers(query: UserQuery = {}, token?: string) {
  try {
    const response = await apiClient.get("/admin/users", { 
      params: query as Record<string, string>,
      token 
    })
    return response
  } catch (error) {
    handleApiError(error, "Failed to load users")
    throw error
  }
}

export async function updateUserRole(userId: string, role: string, token?: string) {
  try {
    const response = await apiClient.patch(`/admin/users/${userId}/role`, { role }, { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to update user role")
    throw error
  }
}

export async function banUser(userId: string, token?: string) {
  try {
    const response = await apiClient.patch(`/admin/users/${userId}/ban`, {}, { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to ban user")
    throw error
  }
}

// Get recent activity
export async function getRecentActivity(token?: string): Promise<ActivityItem[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: ActivityItem[] }>(
      "/admin/activity",
      { token }
    )
    
    if (!response.success) {
      throw new Error("Failed to load recent activity")
    }
    
    return response.data
  } catch (error) {
    handleApiError(error, "Failed to load recent activity")
    return []
  }
}

// Get revenue data
export async function getRevenueData(timeframe: string = "week", token?: string): Promise<RevenueDataPoint[]> {
  try {
    const params: Record<string, string> = { period: timeframe }
    const response = await apiClient.get<{ success: boolean; data: RevenueDataPoint[] }>(
      "/admin/finance/revenue",
      { params, token }
    )
    
    if (!response.success) {
      throw new Error("Failed to load revenue data")
    }
    
    return response.data
  } catch (error) {
    handleApiError(error, "Failed to load revenue data")
    return []
  }
}

// Get category distribution
export async function getCategoryDistribution(token?: string): Promise<CategoryItem[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: CategoryItem[] }>(
      "/admin/services/categories/distribution",
      { token }
    )
    
    if (!response.success) {
      throw new Error("Failed to load category distribution")
    }
    
    return response.data
  } catch (error) {
    handleApiError(error, "Failed to load category distribution")
    return []
  }
}

// Get pending services
export async function getPendingServices(token?: string): Promise<any[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(
      "/admin/services/pending",
      { token }
    )
    
    if (!response.success) {
      throw new Error("Failed to load pending services")
    }
    
    return response.data
  } catch (error) {
    handleApiError(error, "Failed to load pending services")
    return []
  }
}

// Get flagged content
export async function getFlaggedContent(token?: string): Promise<FlaggedItem[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: FlaggedItem[] }>(
      "/admin/moderation/flagged",
      { token }
    )
    
    if (!response.success) {
      throw new Error("Failed to load flagged content")
    }
    
    return response.data
  } catch (error) {
    handleApiError(error, "Failed to load flagged content")
    return []
  }
}

// Get system alerts
export async function getSystemAlerts(token?: string): Promise<SystemAlert[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: SystemAlert[] }>(
      "/admin/system/alerts",
      { token }
    )
    
    if (!response.success) {
      throw new Error("Failed to load system alerts")
    }
    
    return response.data
  } catch (error) {
    handleApiError(error, "Failed to load system alerts")
    return []
  }
}

// Moderate review (keep or remove)
export async function moderateReview(reviewId: string, action: 'keep' | 'remove', token?: string) {
  try {
    const response = await apiClient.patch(
      `/admin/reviews/${reviewId}/moderate`,
      { action },
      { token }
    )
    return response
  } catch (error) {
    handleApiError(error, "Failed to moderate review")
    throw error
  }
}

export async function unbanUser(userId: string, token?: string) {
  try {
    const response = await apiClient.patch(`/admin/users/${userId}/unban`, {}, { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to unban user")
    throw error
  }
}

export async function deleteUser(userId: string, token?: string) {
  try {
    const response = await apiClient.delete(`/admin/users/${userId}`, { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to delete user")
    throw error
  }
}

// Service Management
export async function getServices(query: ServiceQuery = {}, token?: string) {
  try {
    const response = await apiClient.get("/admin/services", { 
      params: query as Record<string, string>,
      token 
    })
    return response
  } catch (error) {
    handleApiError(error, "Failed to load services")
    throw error
  }
}

export async function approveService(serviceId: string, token?: string) {
  try {
    const response = await apiClient.patch(`/admin/services/${serviceId}/approve`, {}, { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to approve service")
    throw error
  }
}

export async function rejectService(serviceId: string, reason: string, token?: string) {
  try {
    const response = await apiClient.patch(`/admin/services/${serviceId}/reject`, { reason }, { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to reject service")
    throw error
  }
}

export async function featuredService(serviceId: string, featured: boolean, token?: string) {
  try {
    const response = await apiClient.patch(`/admin/services/${serviceId}/featured`, { featured }, { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to update service featured status")
    throw error
  }
}

export async function deleteService(serviceId: string, token?: string) {
  try {
    const response = await apiClient.delete(`/admin/services/${serviceId}`, { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to delete service")
    throw error
  }
}

// Review Management
export async function getReviews(query: ReviewQuery = {}, token?: string) {
  try {
    const response = await apiClient.get("/admin/reviews", { 
      params: query as Record<string, string>,
      token 
    })
    return response
  } catch (error) {
    handleApiError(error, "Failed to load reviews")
    throw error
  }
}

export async function getFlaggedReviews(query: ReviewQuery = {}, token?: string) {
  try {
    const response = await apiClient.get("/admin/reviews/flagged", { 
      params: query as Record<string, string>,
      token 
    })
    return response
  } catch (error) {
    handleApiError(error, "Failed to load flagged reviews")
    throw error
  }
}

export async function getReviewAnalytics(token?: string) {
  try {
    const response = await apiClient.get("/admin/reviews/analytics", { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to load review analytics")
    throw error
  }
}

export async function updateReviewStatus(reviewId: string, status: string, adminNotes?: string, token?: string) {
  try {
    const response = await apiClient.patch(`/admin/reviews/${reviewId}/status`, { status, adminNotes }, { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to update review status")
    throw error
  }
}

// Dispute Management
export async function getDisputes(query: DisputeQuery = {}, token?: string) {
  try {
    const response = await apiClient.get("/admin/disputes", { 
      params: query as Record<string, string>,
      token 
    })
    return response
  } catch (error) {
    handleApiError(error, "Failed to load disputes")
    throw error
  }
}

export async function getDisputeStats(token?: string) {
  try {
    const response = await apiClient.get("/admin/disputes/stats", { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to load dispute statistics")
    throw error
  }
}

export async function updateDisputeStatus(disputeId: string, status: string, notes?: string, token?: string) {
  try {
    const response = await apiClient.patch(`/admin/disputes/${disputeId}/status`, { status, notes }, { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to update dispute status")
    throw error
  }
}

export async function resolveDispute(
  disputeId: string, 
  resolution: string, 
  notes?: string, 
  token?: string
) {
  try {
    const response = await apiClient.post(`/admin/disputes/${disputeId}/resolve`, { resolution, notes }, { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to resolve dispute")
    throw error
  }
}

// Finance Management
export async function getRevenueByCategory(token?: string) {
  try {
    const response = await apiClient.get("/admin/finance/revenue-by-category", { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to load revenue by category")
    throw error
  }
}

export async function getRevenueByMonth(token?: string) {
  try {
    const response = await apiClient.get("/admin/finance/revenue-by-month", { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to load revenue by month")
    throw error
  }
}

export async function getEscrowPayments(token?: string) {
  try {
    const response = await apiClient.get("/admin/finance/escrow", { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to load escrow payments")
    throw error
  }
}

export async function releasePayment(bookingId: string, token?: string) {
  try {
    const response = await apiClient.post(`/admin/finance/escrow/${bookingId}/release`, {}, { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to release payment")
    throw error
  }
}

export async function getRefundRequests(token?: string) {
  try {
    const response = await apiClient.get("/admin/finance/refunds", { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to load refund requests")
    throw error
  }
}

export async function processRefund(bookingId: string, approved: boolean, reason?: string, token?: string) {
  try {
    const response = await apiClient.post(`/admin/finance/refunds/${bookingId}/process`, { approved, reason }, { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to process refund")
    throw error
  }
}

export async function getTransactionHistory(token?: string) {
  try {
    const response = await apiClient.get("/admin/finance/transactions", { token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to load transaction history")
    throw error
  }
}

// Reports
export async function generateReport(type: string, startDate?: string, endDate?: string, token?: string) {
  try {
    const params: Record<string, string> = { type }
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    const response = await apiClient.get("/admin/reports", { params, token })
    return response
  } catch (error) {
    handleApiError(error, "Failed to generate report")
    throw error
  }
}