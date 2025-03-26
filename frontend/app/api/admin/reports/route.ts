import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET admin reports
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const reportType = searchParams.get("type") || "users" // users, services, bookings, revenue
    const period = searchParams.get("period") || "month" // day, week, month, year
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : null
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : null

    // Calculate date range based on period if not explicitly provided
    let dateFrom = startDate
    const dateTo = endDate || new Date()

    if (!dateFrom) {
      const now = new Date()
      switch (period) {
        case "day":
          dateFrom = new Date(now)
          dateFrom.setDate(now.getDate() - 1)
          break
        case "week":
          dateFrom = new Date(now)
          dateFrom.setDate(now.getDate() - 7)
          break
        case "month":
          dateFrom = new Date(now)
          dateFrom.setMonth(now.getMonth() - 1)
          break
        case "year":
          dateFrom = new Date(now)
          dateFrom.setFullYear(now.getFullYear() - 1)
          break
      }
    }

    // Build date filter
    const dateFilter = {
      gte: dateFrom,
      lte: dateTo,
    }

    let reportData

    switch (reportType) {
      case "users":
        // Get user registrations over time
        reportData = await getUserReport(dateFrom!, dateTo)
        break
      case "services":
        // Get services created over time
        reportData = await getServiceReport(dateFrom!, dateTo)
        break
      case "bookings":
        // Get bookings over time
        reportData = await getBookingReport(dateFrom!, dateTo)
        break
      case "revenue":
        // Get revenue over time
        reportData = await getRevenueReport(dateFrom!, dateTo)
        break
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    return NextResponse.json({
      reportType,
      period,
      dateRange: {
        from: dateFrom,
        to: dateTo,
      },
      data: reportData,
    })
  } catch (error) {
    console.error("Error generating admin report:", error)
    return NextResponse.json({ error: "An error occurred while generating admin report" }, { status: 500 })
  }
}

// Helper function to get user registrations over time
async function getUserReport(startDate: Date, endDate: Date) {
  // Get all users in date range
  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  // Group by date
  const usersByDate = users.reduce((acc, user) => {
    const date = user.createdAt.toISOString().split("T")[0]
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(user)
    return acc
  }, {})

  // Convert to array format
  const result = Object.keys(usersByDate).map((date) => ({
    date,
    count: usersByDate[date].length,
    users: usersByDate[date],
  }))

  // Add summary
  const summary = {
    totalUsers: users.length,
    byRole: users.reduce((acc, user) => {
      const role = user.role
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {}),
    byStatus: users.reduce((acc, user) => {
      const status = user.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {}),
  }

  return {
    summary,
    details: result,
  }
}

// Helper function to get services created over time
async function getServiceReport(startDate: Date, endDate: Date) {
  // Get all services in date range
  const services = await prisma.service.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  // Group by date
  const servicesByDate = services.reduce((acc, service) => {
    const date = service.createdAt.toISOString().split("T")[0]
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(service)
    return acc
  }, {})

  // Convert to array format
  const result = Object.keys(servicesByDate).map((date) => ({
    date,
    count: servicesByDate[date].length,
    services: servicesByDate[date],
  }))

  // Add summary
  const summary = {
    totalServices: services.length,
    byCategory: services.reduce((acc, service) => {
      const category = service.category.name
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {}),
    byStatus: services.reduce((acc, service) => {
      const status = service.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {}),
    featuredCount: services.filter((s) => s.featured).length,
    averagePrice: services.reduce((sum, service) => sum + service.price, 0) / services.length,
  }

  return {
    summary,
    details: result,
  }
}

// Helper function to get bookings over time
async function getBookingReport(startDate: Date, endDate: Date) {
  // Get all bookings in date range
  const bookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      service: {
        select: {
          id: true,
          title: true,
          category: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  // Group by date
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const date = booking.createdAt.toISOString().split("T")[0]
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(booking)
    return acc
  }, {})

  // Convert to array format
  const result = Object.keys(bookingsByDate).map((date) => ({
    date,
    count: bookingsByDate[date].length,
    totalAmount: bookingsByDate[date].reduce((sum, booking) => sum + booking.totalAmount, 0),
    bookings: bookingsByDate[date],
  }))

  // Add summary
  const summary = {
    totalBookings: bookings.length,
    totalAmount: bookings.reduce((sum, booking) => sum + booking.totalAmount, 0),
    byStatus: bookings.reduce((acc, booking) => {
      const status = booking.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {}),
    byCategory: bookings.reduce((acc, booking) => {
      const category = booking.service.category.name
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {}),
    completionRate: bookings.filter((b) => b.status === "COMPLETED").length / bookings.length,
  }

  return {
    summary,
    details: result,
  }
}

// Helper function to get revenue over time
async function getRevenueReport(startDate: Date, endDate: Date) {
  // Get all completed transactions in date range
  const transactions = await prisma.transaction.findMany({
    where: {
      status: "COMPLETED",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      booking: {
        include: {
          service: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  // Group by date
  const revenueByDate = transactions.reduce((acc, transaction) => {
    const date = transaction.createdAt.toISOString().split("T")[0]
    if (!acc[date]) {
      acc[date] = {
        totalAmount: 0,
        transactions: [],
      }
    }
    acc[date].totalAmount += transaction.amount
    acc[date].transactions.push(transaction)
    return acc
  }, {})

  // Convert to array format
  const result = Object.keys(revenueByDate).map((date) => ({
    date,
    totalAmount: revenueByDate[date].totalAmount,
    count: revenueByDate[date].transactions.length,
    transactions: revenueByDate[date].transactions,
  }))

  // Add summary
  const summary = {
    totalRevenue: transactions.reduce((sum, t) => sum + t.amount, 0),
    transactionCount: transactions.length,
    averageTransactionValue:
      transactions.length > 0 ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length : 0,
    byPaymentMethod: transactions.reduce((acc, t) => {
      const method = t.paymentMethod
      if (!acc[method]) {
        acc[method] = {
          count: 0,
          amount: 0,
        }
      }
      acc[method].count += 1
      acc[method].amount += t.amount
      return acc
    }, {}),
    byCategory: transactions.reduce((acc, t) => {
      if (!t.booking?.service?.category) return acc

      const category = t.booking.service.category.name
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          amount: 0,
        }
      }
      acc[category].count += 1
      acc[category].amount += t.amount
      return acc
    }, {}),
  }

  return {
    summary,
    details: result,
  }
}

