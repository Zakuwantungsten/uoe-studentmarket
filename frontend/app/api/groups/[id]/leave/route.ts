import { NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// POST /api/groups/[id]/leave - Leave a group
export async function POST(
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
    const response = await apiClient.post(`/groups/${params.id}/leave`, {}, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session.user as any).id}`,
      },
    })

    return NextResponse.json((response as any).data)
  } catch (error: any) {
    console.error(`Error leaving group ${params.id}:`, error)
    return NextResponse.json(
      { message: error.message || "Failed to leave group" },
      { status: error.response?.status || 500 }
    )
  }
}