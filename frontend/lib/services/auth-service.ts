import { apiClient } from "@/lib/api-client"
import type { User, ApiResponse } from "@/lib/types"

interface LoginResponse {
  user: User
  token: string
}

export const authService = {
  register: (data: {
    name: string
    email: string
    password: string
    role: "USER" | "PROVIDER" // Updated to match Prisma enum
    studentId?: string
  }) => apiClient.post<ApiResponse<LoginResponse>>("/auth/register", data),

  login: (data: {
    email: string
    password: string
  }) => apiClient.post<ApiResponse<LoginResponse>>("/auth/login", data),

  getProfile: (token: string) => 
    apiClient.get<ApiResponse<User>>("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),

  updateProfile: (data: Partial<User>, token: string) =>
    apiClient.put<ApiResponse<User>>("/users/me", data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }, token: string) =>
    apiClient.post<ApiResponse<{ message: string }>>("/auth/change-password", data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<{ message: string }>>("/auth/forgot-password", { email }),

  resetPassword: (data: { token: string; password: string }) =>
    apiClient.post<ApiResponse<{ message: string }>>("/auth/reset-password", data)
}