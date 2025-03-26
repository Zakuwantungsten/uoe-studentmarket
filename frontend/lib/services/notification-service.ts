import { apiClient } from "@/lib/api-client"
import type { Notification, ApiResponse, PaginatedResponse } from "@/lib/types"

export const notificationService = {
  // Get user's notifications
  getNotifications: async (token: string): Promise<PaginatedResponse<Notification>> => {
    return apiClient.get<PaginatedResponse<Notification>>("/notifications", { token })
  },

  // Mark notification as read
  markAsRead: async (notificationId: string, token: string): Promise<ApiResponse<Notification>> => {
    return apiClient.patch<ApiResponse<Notification>>(`/notifications/${notificationId}/read`, {}, { token })
  },

  // Mark all notifications as read
  markAllAsRead: async (token: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.patch<ApiResponse<{ success: boolean }>>("/notifications/read-all", {}, { token })
  },

  // Delete notification
  deleteNotification: async (notificationId: string, token: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/notifications/${notificationId}`, { token })
  },
}

