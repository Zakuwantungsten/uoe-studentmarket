import { NextResponse } from "next/server"

// GET user dashboard stats
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

    // Fetch user stats from backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch user stats" },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch user stats" },
        { status: 500 }
      )
    }

    // Transform data to match what the frontend expects
    const stats = {
      totalBookings: Number(data.data.totalBookings || 0),
      pendingBookings: Number(data.data.bookingsAsProvider || 0),
      completedBookings: 0,
      totalEarnings: Number(data.data.totalEarnings || 0),
      // Add weeklyEarnings with some sample data
      weeklyEarnings: [1000, 1500, 1200, 1800, 2000, 1600, 1700],
      monthlyEarnings: Number(data.data.totalEarnings || 0),
      previousMonthEarnings: 0, // You might want to implement actual calculation
      pendingEarnings: 0, // You might want to implement actual calculation
      totalServices: Number(data.data.servicesCount || 0),
      totalReviews: Number(data.data.reviewsCount || 0),
      averageRating: parseFloat(data.data.averageRating) || 0,
      unreadMessages: 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching user dashboard stats:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching user dashboard stats" },
      { status: 500 }
    )
  }
}