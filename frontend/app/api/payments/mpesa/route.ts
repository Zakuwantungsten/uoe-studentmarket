import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Validation schema for M-Pesa payment request
const mpesaPaymentSchema = z.object({
  bookingId: z.string(),
  phoneNumber: z.string().regex(/^(?:\+254|0)[17]\d{8}$/, "Invalid Kenyan phone number"),
})

// POST initiate M-Pesa payment
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate request body
    const body = await req.json()
    const result = mpesaPaymentSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    const { bookingId, phoneNumber } = result.data

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        customer: true,
        provider: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if user is authorized to make payment
    if (booking.customerId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to make payment for this booking" }, { status: 403 })
    }

    // Check if booking is already paid
    if (booking.isPaid) {
      return NextResponse.json({ error: "Booking is already paid" }, { status: 400 })
    }

    // Format phone number for M-Pesa (remove leading 0 and add country code if needed)
    let formattedPhone = phoneNumber
    if (phoneNumber.startsWith("0")) {
      formattedPhone = `254${phoneNumber.substring(1)}`
    } else if (!phoneNumber.startsWith("+")) {
      formattedPhone = `+${phoneNumber}`
    }

    // In a real implementation, you would integrate with M-Pesa API here
    // For now, we'll create a pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        bookingId,
        customerId: session.user.id,
        providerId: booking.providerId,
        amount: booking.totalAmount,
        paymentMethod: "MPESA",
        status: "PENDING",
        reference: `MP-${Math.floor(Math.random() * 1000000)}`,
        details: {
          phoneNumber: formattedPhone,
          serviceTitle: booking.service.title,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        transaction,
        message: "M-Pesa payment initiated. Please complete the payment on your phone.",
      },
    })
  } catch (error) {
    console.error("Error processing M-Pesa payment:", error)
    return NextResponse.json({ error: "An error occurred while processing payment" }, { status: 500 })
  }
}

