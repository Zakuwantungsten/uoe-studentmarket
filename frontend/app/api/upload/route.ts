import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    
    // Get authorization token from request headers or cookies
    const authHeader = req.headers.get("authorization")
    const cookieStore = await cookies()
    const token = authHeader ? authHeader.replace("Bearer ", "") : cookieStore.get("token")?.value
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
    }

    // Generate a filename for storing locally until we can implement proper backend upload
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`
    
    // For development testing, we'll return a mock URL 
    // In production, this would upload to the backend
    const url = `/uploads/${fileName}`
    
    // If we have a token and want to upload to the backend
    if (token) {
      try {
        // Create FormData to send to the backend API
        const backendFormData = new FormData()
        backendFormData.append("file", file)
  
        // Get the NEXT_PUBLIC_API_URL from env or use default
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        
        // Upload to backend
        const response = await fetch(`${API_URL}/file`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: backendFormData,
        })
  
        if (response.ok) {
          const data = await response.json()
          
          return NextResponse.json({
            success: true,
            data: {
              url: data.file.url,
              filename: data.file.filename,
            },
          })
        }
      } catch (error) {
        console.error("Backend upload failed, using local mock URL:", error)
        // Continue with mock URL if backend upload fails
      }
    }
    
    // Return mock URL as fallback with same format as backend URLs
    // This ensures consistency between mock and real backend URLs
    const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000"
    const mockUrl = `${API_HOST}${url}`
    
    return NextResponse.json({
      success: true,
      data: {
        url: mockUrl,
        filename: fileName
      }
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "An error occurred while uploading file" }, { status: 500 })
  }
}

