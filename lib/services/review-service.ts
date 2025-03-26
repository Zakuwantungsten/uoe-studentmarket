import { apiClient } from "@/lib/api-client"
import type { Review, ApiResponse, PaginatedResponse } from "@/lib/types"

export const reviewService = {
  getServiceReviews: (serviceId: string, token?: string) =>
    apiClient.get<PaginatedResponse<Review>>(`/reviews/service/${serviceId}`, { token }),

  getUserReviews: (token: string) => apiClient.get<PaginatedResponse<Review>>("/reviews/user", { token }),

  createReview: (data: { serviceId: string; rating: number; comment: string }, token: string) =>
    apiClient.post<ApiResponse<Review>>("/reviews", data, { token }),

  updateReview: (id: string, data: { rating: number; comment: string }, token: string) =>
    apiClient.put<ApiResponse<Review>>(`/reviews/${id}`, data, { token }),

  deleteReview: (id: string, token: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/reviews/${id}`, { token }),
}

