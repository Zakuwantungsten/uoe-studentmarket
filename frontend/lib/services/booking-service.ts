import { apiClient } from "@/lib/api-client"
import type { Booking, ApiResponse, PaginatedResponse } from "@/lib/types"

interface BookingFilters {
  status?: string
  page?: number
  limit?: number
}

export const bookingService = {
  getBookings: (filters: BookingFilters = {}, token: string) => {
    const params: Record<string, string> = {}

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = String(value)
      }
    })

    return apiClient.get<PaginatedResponse<Booking>>("/bookings", {
      params,
      token,
    })
  },

  getMyBookings: (filters: BookingFilters = {}, token: string) => {
    const params: Record<string, string> = {}

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = String(value)
      }
    })

    return apiClient.get<PaginatedResponse<Booking>>("/bookings/my-bookings", {
      params,
      token,
    })
  },

  getMyServiceBookings: (filters: BookingFilters = {}, token: string) => {
    const params: Record<string, string> = {}

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = String(value)
      }
    })

    return apiClient.get<PaginatedResponse<Booking>>("/bookings/my-services", {
      params,
      token,
    })
  },

  getUpcomingBookings: (filters: BookingFilters = {}, token: string) => {
    const params: Record<string, string> = {}

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = String(value)
      }
    })

    return apiClient.get<PaginatedResponse<Booking>>("/bookings/upcoming", {
      params,
      token,
    })
  },

  getBookingById: (id: string, token: string) => apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`, { token }),
  
  // Alias for getBookingById for compatibility
  getBooking: (id: string, token: string) => apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`, { token }),

  createBooking: (data: { serviceId: string; date: string; startTime?: string; endTime?: string; notes?: string }, token: string) =>
    apiClient.post<ApiResponse<Booking>>("/bookings", data, { token }),

  updateBookingStatus: (id: string, status: string, token: string) =>
    apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, { status }, { token }),

  cancelBooking: (id: string, token: string, reason?: string) =>
    apiClient.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason }, { token }),

  getBookingStats: (token: string) => apiClient.get<ApiResponse<any>>("/bookings/stats", { token }),

  checkAvailability: (serviceId: string, date: string, token: string) => 
    apiClient.get<ApiResponse<any>>("/bookings/availability", { 
      params: { serviceId, date },
      token,
    }),
}

