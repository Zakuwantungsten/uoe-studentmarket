import { NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/discussions - Get all discussions with pagination
export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const url = new URL(req.url)
    const page = url.searchParams.get("page") || "1"
    const limit = url.searchParams.get("limit") || "10"

    // Forward the request to the backend
    const response = await apiClient.get(
      `/discussions?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error("Error fetching discussions:", error)
    return NextResponse.json(
      { message: error.message || "Failed to fetch discussions" },
      { status: error.response?.status || 500 }
    )
  }
}

// POST /api/discussions - Create a new discussion
export async function POST(req: NextRequest) {
  try {
    // Get the session to check auth
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await req.json()

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { message: "Title and content are required" },
        { status: 400 }
      )
    }

    // Forward the request to the backend
    const response = await apiClient.post("/discussions", body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session.user as any).id}`,
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error("Error creating discussion:", error)
    return NextResponse.json(
      { message: error.message || "Failed to create discussion" },
      { status: error.response?.status || 500 }
    )
  }
}