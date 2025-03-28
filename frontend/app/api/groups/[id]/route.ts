import { NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/groups/[id] - Get a specific group by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await apiClient.get(`/groups/${params.id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error(`Error fetching group ${params.id}:`, error)
    return NextResponse.json(
      { message: error.message || "Failed to fetch group" },
      { status: error.response?.status || 500 }
    )
  }
}

// PUT /api/groups/[id] - Update a group
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Forward the request to the backend
    const response = await apiClient.put(`/groups/${params.id}`, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session.user as any).id}`,
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error(`Error updating group ${params.id}:`, error)
    return NextResponse.json(
      { message: error.message || "Failed to update group" },
      { status: error.response?.status || 500 }
    )
  }
}

// DELETE /api/groups/[id] - Delete a group
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session to check auth
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Forward the request to the backend
    const response = await apiClient.delete(`/groups/${params.id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session.user as any).id}`,
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error(`Error deleting group ${params.id}:`, error)
    return NextResponse.json(
      { message: error.message || "Failed to delete group" },
      { status: error.response?.status || 500 }
    )
  }
}