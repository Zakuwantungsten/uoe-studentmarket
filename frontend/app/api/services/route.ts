import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Service schema for validation
const serviceSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().positive("Price must be positive"),
  priceType: z.string().optional(),
  location: z.string(),
  image: z.string().optional(),
  featured: z.boolean().optional(),
  discount: z.number().optional(),
  availability: z.string().optional(),
  deliveryTime: z.string().optional(),
  categoryId: z.string(),
  features: z.array(z.string()).optional(),
})

// GET all services with filtering
export async function GET(req: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category")
    const minPrice = searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice")!) : undefined
    const maxPrice = searchParams.get("maxPrice") ? Number.parseFloat(searchParams.get("maxPrice")!) : undefined
    const featured = searchParams.get("featured") === "true"
    const sort = searchParams.get("sort") || "newest"

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: "ACTIVE",
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) {
      where.categoryId = category
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}

      if (minPrice !== undefined) {
        where.price.gte = minPrice
      }

      if (maxPrice !== undefined) {
        where.price.lte = maxPrice
      }
    }

    if (featured) {
      where.featured = true
    }

    // Build orderBy
    let orderBy: any = {}

    switch (sort) {
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "price-low":
        orderBy = { price: "asc" }
        break
      case "price-high":
        orderBy = { price: "desc" }
        break
      case "rating":
        orderBy = { reviews: { _count: "desc" } }
        break
      default:
        orderBy = { createdAt: "desc" }
    }

    // Get services with pagination
    const services = await prisma.service.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
          },
        },
        category: true,
        features: true,
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            bookings: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy,
    })

    // Calculate average rating for each service
    const servicesWithRating = services.map((service) => {
      const totalRating = service.reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = service.reviews.length > 0 ? totalRating / service.reviews.length : 0

      return {
        ...service,
        rating: averageRating,
        reviews: service._count.reviews,
      }
    })

    // Get total count
    const total = await prisma.service.count({ where })

    return NextResponse.json({
      services: servicesWithRating,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "An error occurred while fetching services" }, { status: 500 })
  }
}

// POST create new service
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate request body
    const result = serviceSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    const { features, ...serviceData } = body

    // Create service in a transaction
    const service = await prisma.$transaction(async (tx) => {
      // Create service
      const newService = await tx.service.create({
        data: {
          ...serviceData,
          providerId: session.user.id,
        },
      })

      // Create features if provided
      if (features && features.length > 0) {
        await tx.serviceFeature.createMany({
          data: features.map((feature: string) => ({
            serviceId: newService.id,
            feature,
          })),
        })
      }

      // Increment category count
      await tx.category.update({
        where: {
          id: serviceData.categoryId,
        },
        data: {
          count: {
            increment: 1,
          },
        },
      })

      return newService
    })

    // Get created service with relations
    const createdService = await prisma.service.findUnique({
      where: {
        id: service.id,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
          },
        },
        category: true,
        features: true,
      },
    })

    return NextResponse.json(createdService, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "An error occurred while creating service" }, { status: 500 })
  }
}

