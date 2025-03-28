import { NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// PUT /api/comments/[id] - Update a comment
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
    if (!body.content) {
      return NextResponse.json(
        { message: "Comment content is required" },
        { status: 400 }
      )
    }

    // Forward the request to the backend
    const response = await apiClient.put(`/comments/${id}`, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session.user as any).id}`,
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error(`Error updating comment ${params.id}:`, error)
    return NextResponse.json(
      { message: error.message || "Failed to update comment" },
      { status: error.response?.status || 500 }
    )
  }
}

// DELETE /api/comments/[id] - Delete a comment
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
    const response = await apiClient.delete(`/comments/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session.user as any).id}`,
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error(`Error deleting comment ${params.id}:`, error)
    return NextResponse.json(
      { message: error.message || "Failed to delete comment" },
      { status: error.response?.status || 500 }
    )
  }
}