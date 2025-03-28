import { NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// POST /api/comments - Create a new comment
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
    if (!body.content || !body.discussionId) {
      return NextResponse.json(
        { message: "Comment content and discussion ID are required" },
        { status: 400 }
      )
    }

    // Forward the request to the backend
    const response = await apiClient.post("/comments", body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session.user as any).id}`,
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { message: error.message || "Failed to create comment" },
      { status: error.response?.status || 500 }
    )
  }
}