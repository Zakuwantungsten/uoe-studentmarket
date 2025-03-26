import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET verify payment status
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transactionId = params.id

    // Check if transaction exists
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        booking: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Check if user is authorized to view this transaction
    if (
      transaction.customerId !== session.user.id &&
      transaction.providerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Not authorized to view this transaction" }, { status: 403 })
    }

    // In a real implementation, you would check with M-Pesa API for the status
    // For demo purposes, we'll simulate a successful payment after 30 seconds
    if (transaction.status === "PENDING") {
      const createdAt = new Date(transaction.createdAt)
      const now = new Date()
      const timeDiff = now.getTime() - createdAt.getTime()

      // If more than 30 seconds have passed, mark as completed
      if (timeDiff > 30000) {
        await prisma.transaction.update({
          where: { id: transactionId },
          data: { status: "COMPLETED" },
        })

        // Update booking status
        await prisma.booking.update({
          where: { id: transaction.bookingId },
          data: {
            isPaid: true,
            paidAt: new Date(),
            status: "CONFIRMED",
          },
        })

        // Return updated transaction
        return NextResponse.json({
          success: true,
          data: {
            ...transaction,
            status: "COMPLETED",
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "An error occurred while verifying payment" }, { status: 500 })
  }
}

