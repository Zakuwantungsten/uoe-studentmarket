import { apiClient } from "@/lib/api-client"
import type { Message, User, ApiResponse, PaginatedResponse } from "@/lib/types"

interface Conversation {
  user: User
  lastMessage: Message
  unreadCount: number
}

export const messageService = {
  getConversations: (token: string) => apiClient.get<ApiResponse<Conversation[]>>("/messages/conversations", { token }),

  getMessages: (userId: string, token: string) =>
    apiClient.get<PaginatedResponse<Message>>(`/messages/${userId}`, { token }),

  sendMessage: (data: { recipientId: string; content: string }, token: string) =>
    apiClient.post<ApiResponse<Message>>("/messages", data, { token }),

  markAsRead: (messageId: string, token: string) =>
    apiClient.patch<ApiResponse<Message>>(`/messages/${messageId}/read`, {}, { token }),

  getUnreadCount: (token: string) => apiClient.get<ApiResponse<{ count: number }>>("/messages/unread/count", { token }),
}

