import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Message schema
const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
  recipientId: z.string(),
})

// POST create new message
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate request body
    const result = messageSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    const { content, recipientId } = body

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: {
        id: recipientId,
      },
    })

    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        recipientId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // TODO: Send real-time notification to recipient

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "An error occurred while creating message" }, { status: 500 })
  }
}

// GET conversations or messages
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId") // For getting conversation with specific user
    const type = searchParams.get("type") || "conversations" // conversations or messages
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Calculate pagination
    const skip = (page - 1) * limit

    if (type === "conversations") {
      // Get all users the current user has exchanged messages with
      const conversations = await prisma.$queryRaw`
        SELECT 
          u.id, 
          u.name, 
          u.image,
          (
            SELECT content 
            FROM messages 
            WHERE (senderId = u.id AND recipientId = ${session.user.id}) 
               OR (senderId = ${session.user.id} AND recipientId = u.id)
            ORDER BY createdAt DESC 
            LIMIT 1
          ) as lastMessage,
          (
            SELECT createdAt 
            FROM messages 
            WHERE (senderId = u.id AND recipientId = ${session.user.id}) 
               OR (senderId = ${session.user.id} AND recipientId = u.id)
            ORDER BY createdAt DESC 
            LIMIT 1
          ) as lastMessageTime,
          (
            SELECT COUNT(*) 
            FROM messages 
            WHERE senderId = u.id 
              AND recipientId = ${session.user.id} 
              AND read = false
          ) as unreadCount
        FROM users u
        WHERE u.id IN (
          SELECT DISTINCT 
            CASE 
              WHEN senderId = ${session.user.id} THEN recipientId 
              ELSE senderId 
            END
          FROM messages
          WHERE senderId = ${session.user.id} OR recipientId = ${session.user.id}
        )
        ORDER BY lastMessageTime DESC
        LIMIT ${limit} OFFSET ${skip}
      `

      return NextResponse.json(conversations)
    } else if (type === "messages" && userId) {
      // Get messages between current user and specified user
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: session.user.id,
              recipientId: userId,
            },
            {
              senderId: userId,
              recipientId: session.user.id,
            },
          ],
        },
        orderBy: {
          createdAt: "asc",
        },
        skip,
        take: limit,
      })

      // Mark unread messages as read
      await prisma.message.updateMany({
        where: {
          senderId: userId,
          recipientId: session.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      })

      return NextResponse.json(messages)
    } else {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "An error occurred while fetching messages" }, { status: 500 })
  }
}

