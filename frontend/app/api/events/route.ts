import { NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/events - Get all events with pagination and filtering
export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const url = new URL(req.url)
    const page = url.searchParams.get("page") || "1"
    const limit = url.searchParams.get("limit") || "10"
    const upcoming = url.searchParams.get("upcoming") || "true"

    // Forward the request to the backend
    const response = await apiClient.get(
      `/events?page=${page}&limit=${limit}&upcoming=${upcoming}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { message: error.message || "Failed to fetch events" },
      { status: error.response?.status || 500 }
    )
  }
}

// POST /api/events - Create a new event
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
    if (!body.title || !body.description || !body.location || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { message: "Required fields missing" },
        { status: 400 }
      )
    }

    // Forward the request to the backend
    const response = await apiClient.post("/events", body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session.user as any).id}`,
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      { message: error.message || "Failed to create event" },
      { status: error.response?.status || 500 }
    )
  }
}