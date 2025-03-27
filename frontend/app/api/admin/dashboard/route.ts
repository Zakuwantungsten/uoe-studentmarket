import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET admin dashboard stats
export async function GET(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify token and get user (this is a simplified version, you might need to implement proper token verification)
    // For now, we'll just check if the user exists and is an admin
    const user = await prisma.user.findFirst({
      where: {
        sessions: {
          some: {
            sessionToken: token,
          },
        },
      },
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "all" // all, today, week, month, year

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date | null = null

    switch (period) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case "week":
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
        break
      case "year":
        startDate = new Date(now)
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate = null
    }

    // Build date filter
    const dateFilter = startDate ? { gte: startDate } : undefined

    // Get total users
    const totalUsers = await prisma.user.count({
      where: startDate ? { createdAt: dateFilter } : {},
    })

    // Get total services
    const totalServices = await prisma.service.count({
      where: startDate ? { createdAt: dateFilter } : {},
    })

    // Get total bookings
    const totalBookings = await prisma.booking.count({
      where: startDate ? { createdAt: dateFilter } : {},
    })

    // Get total earnings
    const totalEarnings = await prisma.transaction.aggregate({
      where: {
        status: "COMPLETED",
        ...(startDate ? { createdAt: dateFilter } : {}),
      },
      _sum: {
        amount: true,
      },
    })

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: true,
      where: startDate ? { createdAt: dateFilter } : {},
    })

    // Get services by category
    const servicesByCategory = await prisma.service.groupBy({
      by: ["categoryId"],
      _count: true,
      where: startDate ? { createdAt: dateFilter } : {},
    })

    // Get category names
    type Category = {
      id: string;
      name: string;
    };
    
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    }) as Category[];

    // Map category IDs to names
    const categoryMap = categories.reduce((acc: Record<string, string>, cat: Category) => {
      acc[cat.id] = cat.name
      return acc
    }, {})

    // Get bookings by status
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ["status"],
      _count: true,
      where: startDate ? { createdAt: dateFilter } : {},
    })

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    })

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
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
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    })

    // Get new users today
    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    // Get new services today
    const newServicesToday = await prisma.service.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    // Get bookings today
    const bookingsToday = await prisma.booking.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    // Get pending bookings
    const pendingBookings = await prisma.booking.count({
      where: {
        status: "PENDING"
      }
    });

    // Get completed bookings
    const completedBookings = await prisma.booking.count({
      where: {
        status: "COMPLETED"
      }
    });

    // Format response to match what the frontend expects
    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalServices,
        totalBookings,
        totalEarnings: Number(totalEarnings._sum.amount || 0),
        newUsersToday,
        newServicesToday,
        bookingsToday,
        pendingBookings,
        completedBookings
      },
      // Include additional data for other dashboard components
      usersByRole,
      servicesByCategory: servicesByCategory.map((item: { categoryId: string; _count: number }) => ({
        category: categoryMap[item.categoryId] || item.categoryId,
        count: item._count,
      })),
      bookingsByStatus,
      recentUsers,
      recentBookings,
    })
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error)
    return NextResponse.json({ error: "An error occurred while fetching admin dashboard stats" }, { status: 500 })
  }
}

