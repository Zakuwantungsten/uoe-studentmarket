import { apiClient } from "@/lib/api-client"
import type { User, ApiResponse } from "@/lib/types"

interface LoginResponse {
  user: User
  token: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: "customer" | "provider"
}

interface LoginData {
  email: string
  password: string
}

export const authService = {
  register: (data: RegisterData) => apiClient.post<ApiResponse<LoginResponse>>("/auth/register", data),

  login: (data: LoginData) => apiClient.post<ApiResponse<LoginResponse>>("/auth/login", data),

  getProfile: (token: string) => apiClient.get<ApiResponse<User>>("/users/me", { token }),

  updateProfile: (data: Partial<User>, token: string) => apiClient.put<ApiResponse<User>>("/users/me", data, { token }),

  changePassword: (data: { currentPassword: string; newPassword: string }, token: string) =>
    apiClient.post<ApiResponse<{ message: string }>>("/auth/change-password", data, { token }),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<{ message: string }>>("/auth/forgot-password", { email }),

  resetPassword: (data: { token: string; password: string }) =>
    apiClient.post<ApiResponse<{ message: string }>>("/auth/reset-password", data),
}

