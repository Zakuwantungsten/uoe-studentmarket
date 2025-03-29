import { apiClient } from "@/lib/api-client"
import type { Service, ApiResponse, PaginatedResponse } from "@/lib/types"

// Helper function to normalize service image data
const normalizeServiceData = (service: any): Service => {
  // Ensure both 'image' and 'images' fields exist for compatibility
  const normalizedService = {
    ...service,
    // If images array doesn't exist, create it from image string
    images: service.images || (service.image ? [service.image] : []),
    // Ensure image field exists for backend compatibility
    image: service.image || (service.images && service.images.length > 0 ? service.images[0] : null)
  };
  
  return normalizedService as Service;
};

// Helper function to normalize array of services
const normalizeServiceArray = (services: any[]): Service[] => {
  return services.map(normalizeServiceData);
};

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
  getServices: async (filters: ServiceFilters = {}, token?: string) => {
    const params: Record<string, string> = {}

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = String(value)
      }
    })

    const response = await apiClient.get<PaginatedResponse<Service>>("/services", {
      params,
      token,
    })
    
    // Normalize service data to ensure both image and images fields
    if (response.data) {
      response.data = normalizeServiceArray(response.data);
    }
    
    return response;
  },

  getServiceById: async (id: string, token?: string) => {
    const response = await apiClient.get<ApiResponse<Service>>(`/services/${id}`, { token });
    
    // Normalize service data
    if (response.data) {
      response.data = normalizeServiceData(response.data);
    }
    
    return response;
  },

  getMyServices: async (token: string) => {
    const response = await apiClient.get<PaginatedResponse<Service>>("/services/my-services", { token });
    
    // Normalize service data
    if (response.data) {
      response.data = normalizeServiceArray(response.data);
    }
    
    return response;
  },

  createService: async (data: Partial<Service>, token: string) => {
    // Normalize data before sending to backend to ensure both image and images exist
    const normalizedData = normalizeServiceData(data);
    
    // Debug log to track image data
    console.log("Creating service with normalized data:", {
      hasImage: !!(normalizedData as any).image,
      hasImages: !!normalizedData.images && normalizedData.images.length > 0,
      imageValue: (normalizedData as any).image ? 'Image URL exists' : 'No image',
      imagesCount: normalizedData.images?.length || 0
    });
    
    const response = await apiClient.post<ApiResponse<Service>>("/services", normalizedData, { token });
    
    // Normalize response data
    if (response.data) {
      response.data = normalizeServiceData(response.data);
    }
    
    return response;
  },

  updateService: async (id: string, data: Partial<Service>, token: string) => {
    // Normalize data before sending to backend
    const normalizedData = normalizeServiceData(data);
    
    const response = await apiClient.put<ApiResponse<Service>>(`/services/${id}`, normalizedData, { token });
    
    // Normalize response data
    if (response.data) {
      response.data = normalizeServiceData(response.data);
    }
    
    return response;
  },

  deleteService: (id: string, token: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/services/${id}`, { token }),

  getFeaturedServices: async (limit = 6) => {
    const response = await apiClient.get<ApiResponse<Service[]>>("/services/featured", {
      params: { limit: String(limit) }
    });
    
    // Normalize service data
    if (response.data) {
      if (Array.isArray(response.data)) {
        response.data = normalizeServiceArray(response.data);
      } else if (response.data) {
        // If it's a single object, convert to array after normalization
        const normalizedData = normalizeServiceData(response.data);
        response.data = [normalizedData] as any;
      }
    }
    
    return response;
  }
}

