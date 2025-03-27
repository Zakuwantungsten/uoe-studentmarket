import { toast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface FetchOptions extends RequestInit {
  token?: string
  params?: Record<string, string>
}

class ApiError extends Error {
  status: number
  data: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, params, ...fetchOptions } = options

  // Add query parameters if provided
  const url = new URL(`${API_URL}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  // Set default headers
  const headers = new Headers(fetchOptions.headers)

  if (!headers.has("Content-Type") && !fetchOptions.body?.toString().includes("FormData")) {
    headers.set("Content-Type", "application/json")
  }

  // Add authorization token if provided
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  try {
    const response = await fetch(url.toString(), {
      ...fetchOptions,
      headers,
    })

    // Parse the JSON response
    const data = await response.json()

    // Handle API errors with improved error message extraction
    if (!response.ok) {
      const errorMessage = data?.message || 
                          (data?.error?.message) || 
                          (typeof data === 'string' ? data : "Something went wrong")
      console.error(`API Error (${response.status}):`, errorMessage, data)
      throw new ApiError(errorMessage, response.status, data)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Handle network errors
    throw new ApiError(error instanceof Error ? error.message : "Network error", 500)
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: FetchOptions) => 
    fetchApi<T>(endpoint, { method: 'GET', ...options }),
    
  post: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
    
  put: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
    
  patch: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
    
  delete: <T>(endpoint: string, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { method: 'DELETE', ...options }),
    
  upload: <T>(endpoint: string, formData: FormData, options?: FetchOptions) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: formData,
      ...options
    })
}

// Helper function to handle API errors in components
export async function handleApiError(error: any, customMessage?: string) {
  console.error('API Error:', error)
  
  if (error instanceof ApiError) {
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive'
    })
  } else {
    toast({
      title: 'Error',
      description: customMessage || 'Something went wrong. Please try again.',
      variant: 'destructive'
    })
  }
}

