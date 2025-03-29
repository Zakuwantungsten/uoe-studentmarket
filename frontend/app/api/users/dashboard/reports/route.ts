import { NextResponse } from "next/server"

// GET user dashboard reports
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

    // Get query parameters
    const url = new URL(req.url)
    const type = url.searchParams.get("type") || "bookings" // Default to bookings
    const period = url.searchParams.get("period") || "month" // Default to month

    // Fetch reports data from backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/reports?type=${type}&period=${period}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch user reports" },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch user reports" },
        { status: 500 }
      )
    }

    // Format report data based on type
    const reportData = {
      type,
      period,
      summary: {},
      details: [],
    }

    // For bookings reports
    if (type === "bookings") {
      reportData.summary = {
        totalBookings: data.data.totalCount || 0,
        completedBookings: data.data.completedCount || 0,
        pendingBookings: data.data.pendingCount || 0,
        cancelledBookings: data.data.cancelledCount || 0,
        completionRate: data.data.completionRate || 0,
      }
      reportData.details = data.data.bookings || []
    }
    // For services reports
    else if (type === "services") {
      reportData.summary = {
        totalServices: data.data.totalCount || 0,
        activeServices: data.data.activeCount || 0,
        viewCount: data.data.viewCount || 0,
        mostPopular: data.data.mostPopular || null,
      }
      reportData.details = data.data.services || []
    }
    // For earnings reports
    else if (type === "earnings") {
      reportData.summary = {
        totalEarnings: data.data.totalEarnings || 0,
        averageEarning: data.data.averageEarning || 0,
        transactionCount: data.data.transactionCount || 0,
        bestMonth: data.data.bestMonth || null,
      }
      reportData.details = data.data.transactions || []
    }
    // For reviews reports
    else if (type === "reviews") {
      reportData.summary = {
        totalReviews: data.data.totalCount || 0,
        averageRating: data.data.averageRating || 0,
        reviewsCount: data.data.positiveCount || 0,
      }
      reportData.details = data.data.reviews || []
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error fetching user dashboard reports:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching user dashboard reports" },
      { status: 500 }
    )
  }
}