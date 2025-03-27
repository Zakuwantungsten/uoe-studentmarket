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

  // Add authorization token if provided in options
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  } 
  // Otherwise, try to get token from localStorage (client-side only)
  else if (typeof window !== 'undefined') {
    try {
      const storedToken = localStorage.getItem("token")
      if (storedToken) {
        headers.set("Authorization", `Bearer ${storedToken}`)
      }
    } catch (error) {
      console.error("Error accessing localStorage for token:", error)
    }
  }

  try {
    const response = await fetch(url.toString(), {
      ...fetchOptions,
      headers,
    })

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type')
    let data: any
    
    if (contentType && contentType.includes('application/json')) {
      // Parse JSON response
      try {
        data = await response.json()
      } catch (parseError) {
        // If JSON parsing fails, get text content instead
        const textContent = await response.text()
        console.error('JSON parsing error:', parseError, 'Response text:', textContent.substring(0, 200))
        throw new ApiError(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`, response.status, textContent)
      }
    } else {
      // For non-JSON responses, get text content
      const textContent = await response.text()
      
      if (!response.ok) {
        console.error(`Non-JSON error response (${response.status}):`, textContent.substring(0, 200))
        throw new ApiError(`Server returned non-JSON response: ${textContent.substring(0, 100)}...`, response.status, textContent)
      }
      
      // If response is OK but not JSON, return text as data
      data = { text: textContent, _isTextResponse: true }
    }

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

