import { apiClient } from "@/lib/api-client"
import type { Service, PaginatedResponse } from "@/lib/types"

interface SearchParams {
  q?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  page?: number
  limit?: number
}

export const searchService = {
  // Search services
  searchServices: async (params: SearchParams): Promise<PaginatedResponse<Service>> => {
    return apiClient.get<PaginatedResponse<Service>>("/search", { params })
  },
}

