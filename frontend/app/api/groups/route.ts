import { NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/groups - Get all groups with pagination
export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const url = new URL(req.url)
    const page = url.searchParams.get("page") || "1"
    const limit = url.searchParams.get("limit") || "10"

    // Forward the request to the backend
    const response = await apiClient.get(
      `/groups?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error("Error fetching groups:", error)
    return NextResponse.json(
      { message: error.message || "Failed to fetch groups" },
      { status: error.response?.status || 500 }
    )
  }
}

// POST /api/groups - Create a new group
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
    if (!body.name || !body.description) {
      return NextResponse.json(
        { message: "Group name and description are required" },
        { status: 400 }
      )
    }

    // Forward the request to the backend
    const response = await apiClient.post("/groups", body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session.user as any).id}`,
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error("Error creating group:", error)
    return NextResponse.json(
      { message: error.message || "Failed to create group" },
      { status: error.response?.status || 500 }
    )
  }
}