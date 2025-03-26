import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Review schema
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  bookingId: z.string(),
})

// POST create new review
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate request body
    const result = reviewSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    const { rating, comment, bookingId } = body

    // Check if booking exists and is completed
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        review: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if user is the customer of the booking
    if (booking.customerId !== session.user.id) {
      return NextResponse.json({ error: "Only the customer can review a booking" }, { status: 403 })
    }

    // Check if booking is completed
    if (booking.status !== "COMPLETED") {
      return NextResponse.json({ error: "Can only review completed bookings" }, { status: 400 })
    }

    // Check if booking already has a review
    if (booking.review) {
      return NextResponse.json({ error: "Booking already has a review" }, { status: 400 })
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        reviewerId: session.user.id,
        revieweeId: booking.providerId,
        serviceId: booking.serviceId,
        bookingId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // TODO: Send notification to provider about new review

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "An error occurred while creating review" }, { status: 500 })
  }
}

// GET reviews for a service or user
export async function GET(req: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get("serviceId")
    const userId = searchParams.get("userId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!serviceId && !userId) {
      return NextResponse.json({ error: "Either serviceId or userId is required" }, { status: 400 })
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (serviceId) {
      where.serviceId = serviceId
    }

    if (userId) {
      where.revieweeId = userId
    }

    // Get reviews with pagination
    const reviews = await prisma.review.findMany({
      where,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
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
    const total = await prisma.review.count({ where })

    // Calculate average rating
    const averageRating = await prisma.review.aggregate({
      where,
      _avg: {
        rating: true,
      },
    })

    return NextResponse.json({
      reviews,
      averageRating: averageRating._avg.rating || 0,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "An error occurred while fetching reviews" }, { status: 500 })
  }
}

