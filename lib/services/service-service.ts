import { apiClient } from "@/lib/api-client"
import type { Service, ApiResponse, PaginatedResponse } from "@/lib/types"

interface ServiceFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  rating?: number
  featured?: boolean
  search?: string
  page?: number
  limit?: number
  sort?: string
}

export const serviceService = {
  getServices: (filters: ServiceFilters = {}, token?: string) => {
    const params: Record<string, string> = {}

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = String(value)
      }
    })

    return apiClient.get<PaginatedResponse<Service>>("/services", {
      params,
      token,
    })
  },

  getServiceById: (id: string, token?: string) => apiClient.get<ApiResponse<Service>>(`/services/${id}`, { token }),

  getMyServices: (token: string) => apiClient.get<PaginatedResponse<Service>>("/services/my-services", { token }),

  createService: (data: Partial<Service>, token: string) =>
    apiClient.post<ApiResponse<Service>>("/services", data, { token }),

  updateService: (id: string, data: Partial<Service>, token: string) =>
    apiClient.put<ApiResponse<Service>>(`/services/${id}`, data, { token }),

  deleteService: (id: string, token: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/services/${id}`, { token }),

  getFeaturedServices: (limit = 6) =>
    apiClient.get<ApiResponse<Service[]>>("/services/featured", {
      params: { limit: String(limit) },
    }),
}

