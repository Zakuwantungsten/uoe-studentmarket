import { toast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
// Extract the base URL (without /api) for handling paths that include /api
const BASE_URL = API_URL.endsWith('/api') 
  ? API_URL.slice(0, -4) // Remove trailing /api
  : API_URL

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
  // Prevent duplicate /api in URL path
  const urlString = endpoint.startsWith('/api')
    ? `${BASE_URL}${endpoint}` // If endpoint already has /api, use BASE_URL
    : `${API_URL}${endpoint}` // Otherwise use API_URL with /api
    
  const url = new URL(urlString)
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
    console.log('API Request:', endpoint, options);
    
    const response = await fetch(url.toString(), {
      ...fetchOptions,
      headers,
    })

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type')
    let data: any
    
    // Get text content first, regardless of Content-Type
    const textContent = await response.text()
    
    // Try to parse as JSON first, even if Content-Type is not application/json
    try {
      data = JSON.parse(textContent)
    } catch (parseError) {
      // If not parseable as JSON, check if it's an error response
      if (!response.ok) {
        // Enhanced logging for debugging non-JSON error responses
        console.error(
          `Non-JSON error response (${response.status}):`, 
          textContent.substring(0, 200),
          `\nRequest URL: ${url.toString()}`,
          `\nContent-Type: ${contentType || 'not specified'}`
        )
        
        // Check if this looks like an HTML error page
        if (textContent.includes('<!DOCTYPE html>') || textContent.includes('<html')) {
          throw new ApiError(
            `Server returned HTML instead of JSON. This may indicate an authentication issue, a server error, or an invalid URL.`, 
            response.status, 
            textContent
          )
        }
        
        throw new ApiError(`Server returned non-JSON response: ${textContent.substring(0, 100)}...`, response.status, textContent)
      }
      
      // If response is OK but not JSON, return text as data
      data = { text: textContent, _isTextResponse: true }
    }

    console.log('API Response:', data);
    
    // Handle API errors with improved error message extraction
    if (!response.ok) {
      const errorMessage = data?.message || 
                          (data?.error?.message) || 
                          (typeof data === 'string' ? data : "Something went wrong")
      console.error(
        `API Error (${response.status}):`, 
        errorMessage, 
        data,
        `\nRequest URL: ${url.toString()}`,
        `\nHeaders:`, Object.fromEntries([...headers.entries()].filter(([key]) => !key.toLowerCase().includes('authorization')))
      )
      throw new ApiError(errorMessage, response.status, data)
    }

    return data
  } catch (error) {
    console.log('API Error:', error);
    
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

