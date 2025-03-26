import { apiClient } from "@/lib/api-client"
import type { Transaction, ApiResponse, PaginatedResponse } from "@/lib/types"

interface PaymentRequest {
  bookingId: string
  phoneNumber: string
}

interface PaymentResponse {
  transaction: Transaction
  message: string
}

export const paymentService = {
  // Initiate M-Pesa payment
  initiatePayment: async (data: PaymentRequest, token: string): Promise<ApiResponse<PaymentResponse>> => {
    return apiClient.post<ApiResponse<PaymentResponse>>("/payments/mpesa", data, { token })
  },

  // Get transaction by ID
  getTransaction: async (transactionId: string, token: string): Promise<ApiResponse<Transaction>> => {
    return apiClient.get<ApiResponse<Transaction>>(`/payments/transaction/${transactionId}`, { token })
  },

  // Get user's transactions
  getMyTransactions: async (token: string): Promise<PaginatedResponse<Transaction>> => {
    return apiClient.get<PaginatedResponse<Transaction>>("/payments/my-transactions", { token })
  },

  // Verify payment status
  verifyPayment: async (transactionId: string, token: string): Promise<ApiResponse<Transaction>> => {
    return apiClient.get<ApiResponse<Transaction>>(`/payments/verify/${transactionId}`, { token })
  },
}

