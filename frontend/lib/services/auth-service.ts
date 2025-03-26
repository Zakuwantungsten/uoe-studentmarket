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

  login: async (data: {
    email: string
    password: string
  }) => {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", data)
      
      // Add extra validation
      if (!response.data) {
        console.error('Login response lacks data:', response)
        throw new Error(response.message || 'Login failed')
      }
  
      console.log('Login successful:', response.data.user.email)
      return response
    } catch (error) {
      console.error('Login service error:', error)
      throw error
    }
  },

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