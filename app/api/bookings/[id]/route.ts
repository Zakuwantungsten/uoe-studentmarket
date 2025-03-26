import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// GET booking by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookingId = params.id

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            image: true,
            location: true,
            features: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
        },
        transaction: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if user is the customer, provider, or admin
    if (
      booking.customerId !== session.user.id &&
      booking.providerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "An error occurred while fetching booking" }, { status: 500 })
  }
}

// Booking update schema
const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  date: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  startTime: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  endTime: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  notes: z.string().optional(),
})

// PATCH update booking
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookingId = params.id

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check permissions based on the action
    const body = await req.json()

    // Validate request body
    const result = updateBookingSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    // Different permissions for different status changes
    if (body.status) {
      // Only provider can confirm, start, or complete a booking
      if (
        ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(body.status) &&
        booking.providerId !== session.user.id &&
        session.user.role !== "ADMIN"
      ) {
        return NextResponse.json({ error: "Only the service provider can perform this action" }, { status: 403 })
      }

      // Only customer can cancel a pending booking
      if (
        body.status === "CANCELLED" &&
        booking.status === "PENDING" &&
        booking.customerId !== session.user.id &&
        session.user.role !== "ADMIN"
      ) {
        return NextResponse.json({ error: "Only the customer can cancel a pending booking" }, { status: 403 })
      }

      // Provider can cancel a confirmed booking
      if (
        body.status === "CANCELLED" &&
        booking.status === "CONFIRMED" &&
        booking.providerId !== session.user.id &&
        booking.customerId !== session.user.id &&
        session.user.role !== "ADMIN"
      ) {
        return NextResponse.json(
          { error: "Only the provider or customer can cancel a confirmed booking" },
          { status: 403 },
        )
      }

      // Cannot change status of completed or cancelled bookings
      if (["COMPLETED", "CANCELLED"].includes(booking.status) && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Cannot update a completed or cancelled booking" }, { status: 400 })
      }
    }

    // For date/time changes, only allow if booking is still pending
    if ((body.date || body.startTime || body.endTime) && booking.status !== "PENDING") {
      return NextResponse.json({ error: "Can only update date/time for pending bookings" }, { status: 400 })
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: body,
      include: {
        service: {
          select: {
            title: true,
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

    // TODO: Send notification about booking update

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "An error occurred while updating booking" }, { status: 500 })
  }
}

// DELETE booking (only for pending bookings)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookingId = params.id

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Only allow deletion of pending bookings
    if (booking.status !== "PENDING") {
      return NextResponse.json({ error: "Only pending bookings can be deleted" }, { status: 400 })
    }

    // Check if user is the customer, provider, or admin
    if (
      booking.customerId !== session.user.id &&
      booking.providerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete booking
    await prisma.booking.delete({
      where: {
        id: bookingId,
      },
    })

    return NextResponse.json({ message: "Booking deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: "An error occurred while deleting booking" }, { status: 500 })
  }
}

