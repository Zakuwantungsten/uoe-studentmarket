import { apiClient } from "@/lib/api-client"
import type { User, ApiResponse } from "@/lib/types"

interface LoginResponse {
  user: User
  token: string
}

export const authService = {
  register: async (data: {
    name: string
    email: string
    password: string
    role: "USER" | "PROVIDER" // Updated to match Prisma enum
    studentId?: string
  }) => {
    try {
      const response = await apiClient.post<any>("/auth/register", data)
      
      console.log('Raw register response:', response)
      
      // Handle different response structures
      // Backend register endpoint returns { user, token } directly
      // while login endpoint returns { success, data: { user, token }, message }
      
      // If response already has the expected structure with data property
      if (response.data && response.data.user && response.data.token) {
        console.log('Registration successful (data format):', response.data.user.email)
        return {
          success: true,
          data: response.data,
          message: "Registration successful"
        }
      }
      
      // If response has user and token directly at the top level (backend register format)
      if (response.user && response.token) {
        console.log('Registration successful (direct format):', response.user.email)
        return {
          success: true,
          data: {
            user: response.user,
            token: response.token
          },
          message: "Registration successful"
        }
      }
      
      // If we get here, the response doesn't have the expected structure
      console.error('Invalid register response format:', response)
      throw new Error('Invalid response format from server')
    } catch (error) {
      console.error('Registration service error:', error)
      throw error
    }
  },

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
    apiClient.patch<ApiResponse<User>>("/users", data, {
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