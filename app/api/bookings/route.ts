import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Booking schema
const bookingSchema = z.object({
  serviceId: z.string(),
  date: z.string().transform((str) => new Date(str)),
  startTime: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  endTime: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  notes: z.string().optional(),
})

// POST create new booking
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate request body
    const result = bookingSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    const { serviceId, date, startTime, endTime, notes } = result.data

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Check if user is not booking their own service
    if (service.providerId === session.user.id) {
      return NextResponse.json({ error: "You cannot book your own service" }, { status: 400 })
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: session.user.id,
        providerId: service.providerId,
        serviceId,
        date,
        startTime,
        endTime,
        notes,
        totalAmount: service.price,
      },
      include: {
        service: {
          select: {
            title: true,
            price: true,
          },
        },
        provider: {
          select: {
            name: true,
            email: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // TODO: Send notification to provider

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "An error occurred while creating booking" }, { status: 500 })
  }
}

// GET all bookings for current user
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
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const role = searchParams.get("role") || "customer" // customer or provider
    const status = searchParams.get("status")

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (role === "customer") {
      where.customerId = session.user.id
    } else if (role === "provider") {
      where.providerId = session.user.id
    } else {
      // If admin, show all bookings
      if (session.user.role !== "ADMIN") {
        where.OR = [{ customerId: session.user.id }, { providerId: session.user.id }]
      }
    }

    if (status) {
      where.status = status
    }

    // Get bookings with pagination
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            image: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
          },
        },
        transaction: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get total count
    const total = await prisma.booking.count({ where })

    return NextResponse.json({
      bookings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "An error occurred while fetching bookings" }, { status: 500 })
  }
}

