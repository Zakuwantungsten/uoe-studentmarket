import { apiClient } from "@/lib/api-client"
import type { Category, ApiResponse } from "@/lib/types"

export const categoryService = {
  getCategories: (token?: string) => apiClient.get<ApiResponse<Category[]>>("/categories", { token }),

  getCategoryById: (id: string, token?: string) => apiClient.get<ApiResponse<Category>>(`/categories/${id}`, { token }),

  createCategory: (data: Partial<Category>, token: string) =>
    apiClient.post<ApiResponse<Category>>("/categories", data, { token }),

  updateCategory: (id: string, data: Partial<Category>, token: string) =>
    apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data, { token }),

  deleteCategory: (id: string, token: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/categories/${id}`, { token }),
}

