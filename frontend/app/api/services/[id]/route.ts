import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// GET service by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const serviceId = params.id

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
            bio: true,
            createdAt: true,
            _count: {
              select: {
                providedServices: true,
                reviewsReceived: true,
              },
            },
          },
        },
        category: true,
        features: true,
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        _count: {
          select: {
            reviews: true,
            bookings: true,
          },
        },
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Calculate average rating
    const totalRating = service.reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = service.reviews.length > 0 ? totalRating / service.reviews.length : 0

    // Calculate provider rating
    const providerServices = await prisma.service.findMany({
      where: {
        providerId: service.provider.id,
      },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    })

    let providerRating = 0
    let totalReviews = 0

    providerServices.forEach((s) => {
      totalReviews += s.reviews.length
      providerRating += s.reviews.reduce((sum, review) => sum + review.rating, 0)
    })

    const averageProviderRating = totalReviews > 0 ? providerRating / totalReviews : 0

    return NextResponse.json({
      ...service,
      rating: averageRating,
      provider: {
        ...service.provider,
        rating: averageProviderRating,
        totalReviews,
      },
    })
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json({ error: "An error occurred while fetching service" }, { status: 500 })
  }
}

// Service update schema
const updateServiceSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  price: z.number().positive().optional(),
  priceType: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
  featured: z.boolean().optional(),
  discount: z.number().optional(),
  availability: z.string().optional(),
  deliveryTime: z.string().optional(),
  categoryId: z.string().optional(),
  features: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
})

// PATCH update service
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceId = params.id

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Check if user is the service provider or an admin
    if (service.providerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()

    // Validate request body
    const result = updateServiceSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    const { features, categoryId, ...serviceData } = body

    // Update service in a transaction
    const updatedService = await prisma.$transaction(async (tx) => {
      // If category is changing, update category counts
      if (categoryId && categoryId !== service.categoryId) {
        // Decrement old category count
        await tx.category.update({
          where: {
            id: service.categoryId,
          },
          data: {
            count: {
              decrement: 1,
            },
          },
        })

        // Increment new category count
        await tx.category.update({
          where: {
            id: categoryId,
          },
          data: {
            count: {
              increment: 1,
            },
          },
        })
      }

      // Update service
      const updated = await tx.service.update({
        where: {
          id: serviceId,
        },
        data: {
          ...serviceData,
          ...(categoryId ? { categoryId } : {}),
        },
      })

      // Update features if provided
      if (features) {
        // Delete existing features
        await tx.serviceFeature.deleteMany({
          where: {
            serviceId,
          },
        })

        // Create new features
        if (features.length > 0) {
          await tx.serviceFeature.createMany({
            data: features.map((feature: string) => ({
              serviceId,
              feature,
            })),
          })
        }
      }

      return updated
    })

    // Get updated service with relations
    const serviceWithRelations = await prisma.service.findUnique({
      where: {
        id: serviceId,
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

    return NextResponse.json(serviceWithRelations)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "An error occurred while updating service" }, { status: 500 })
  }
}

// DELETE service
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceId = params.id

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Check if user is the service provider or an admin
    if (service.providerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete service in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete service
      await tx.service.delete({
        where: {
          id: serviceId,
        },
      })

      // Decrement category count
      await tx.category.update({
        where: {
          id: service.categoryId,
        },
        data: {
          count: {
            decrement: 1,
          },
        },
      })
    })

    return NextResponse.json({ message: "Service deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "An error occurred while deleting service" }, { status: 500 })
  }
}

