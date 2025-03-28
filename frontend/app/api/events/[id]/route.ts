import { NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/events/[id] - Get a specific event by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const response = await apiClient.get(`/events/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error(`Error fetching event ${params.id}:`, error)
    return NextResponse.json(
      { message: error.message || "Failed to fetch event" },
      { status: error.response?.status || 500 }
    )
  }
}

// PUT /api/events/[id] - Update an event
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
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
    const response = await apiClient.put(`/events/${id}`, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session.user as any).id}`,
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error(`Error updating event ${params.id}:`, error)
    return NextResponse.json(
      { message: error.message || "Failed to update event" },
      { status: error.response?.status || 500 }
    )
  }
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    // Get the session to check auth
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Forward the request to the backend
    const response = await apiClient.delete(`/events/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session.user as any).id}`,
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error(`Error deleting event ${params.id}:`, error)
    return NextResponse.json(
      { message: error.message || "Failed to delete event" },
      { status: error.response?.status || 500 }
    )
  }
}