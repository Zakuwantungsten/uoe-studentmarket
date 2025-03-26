import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category") || undefined
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined
    const location = searchParams.get("location") || undefined
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build filter
    const filter: any = {
      status: "ACTIVE",
    }

    // Add text search if query is provided
    if (query) {
      filter.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { features: { has: query } },
      ]
    }

    // Add category filter
    if (category) {
      filter.categoryId = category
    }

    // Add price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {}
      if (minPrice !== undefined) {
        filter.price.gte = minPrice
      }
      if (maxPrice !== undefined) {
        filter.price.lte = maxPrice
      }
    }

    // Add location filter
    if (location) {
      filter.location = { contains: location, mode: "insensitive" }
    }

    // Execute search query
    const services = await prisma.service.findMany({
      where: filter,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            rating: true,
          },
        },
        category: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    })

    // Get total count for pagination
    const total = await prisma.service.count({ where: filter })

    // Calculate average rating for each service
    const servicesWithRating = await Promise.all(
      services.map(async (service) => {
        const reviews = await prisma.review.findMany({
          where: { serviceId: service.id },
          select: { rating: true },
        })

        const avgRating =
          reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

        return {
          ...service,
          rating: avgRating,
          reviewCount: service._count.reviews,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: servicesWithRating,
      count: services.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error("Error searching services:", error)
    return NextResponse.json({ error: "An error occurred while searching services" }, { status: 500 })
  }
}

