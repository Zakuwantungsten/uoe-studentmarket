import { NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/discussions/[id] - Get a specific discussion by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const response = await apiClient.get(`/discussions/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error(`Error fetching discussion ${params.id}:`, error)
    return NextResponse.json(
      { message: error.message || "Failed to fetch discussion" },
      { status: error.response?.status || 500 }
    )
  }
}

// PUT /api/discussions/[id] - Update a discussion
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
    if (!body.title || !body.content) {
      return NextResponse.json(
        { message: "Title and content are required" },
        { status: 400 }
      )
    }

    // Forward the request to the backend
    const response = await apiClient.put(`/discussions/${id}`, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session.user as any).id}`,
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error(`Error updating discussion ${params.id}:`, error)
    return NextResponse.json(
      { message: error.message || "Failed to update discussion" },
      { status: error.response?.status || 500 }
    )
  }
}

// DELETE /api/discussions/[id] - Delete a discussion
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
    const response = await apiClient.delete(`/discussions/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session.user as any).id}`,
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error(`Error deleting discussion ${params.id}:`, error)
    return NextResponse.json(
      { message: error.message || "Failed to delete discussion" },
      { status: error.response?.status || 500 }
    )
  }
}