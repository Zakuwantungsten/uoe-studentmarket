import { NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// POST /api/events/[id]/rsvp - RSVP to an event
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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
    const response = await apiClient.post(`/events/${id}/rsvp`, {}, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session.user as any).id}`,
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error(`Error RSVP'ing to event ${params.id}:`, error)
    return NextResponse.json(
      { message: error.message || "Failed to RSVP to event" },
      { status: error.response?.status || 500 }
    )
  }
}