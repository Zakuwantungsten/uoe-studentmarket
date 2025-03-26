import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET user's notifications
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build filter
    const filter = {
      recipientId: session.user.id,
      ...(unreadOnly ? { read: false } : {}),
    }

    // Get notifications with pagination
    const notifications = await prisma.notification.findMany({
      where: filter,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    // Get total count for pagination
    const total = await prisma.notification.count({ where: filter })

    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "An error occurred while fetching notifications" }, { status: 500 })
  }
}

