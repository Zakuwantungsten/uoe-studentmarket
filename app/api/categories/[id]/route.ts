import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// GET category by ID with services
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const categoryId = params.id

    // Get query parameters for pagination
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Calculate pagination
    const skip = (page - 1) * limit

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Get services in this category with pagination
    const services = await prisma.service.findMany({
      where: {
        categoryId,
        status: "ACTIVE",
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
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
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
    const total = await prisma.service.count({
      where: {
        categoryId,
        status: "ACTIVE",
      },
    })

    return NextResponse.json({
      category,
      services: servicesWithRating,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "An error occurred while fetching category" }, { status: 500 })
  }
}

// Category update schema
const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  slug: z.string().min(2).optional(),
})

// PATCH update category (admin only)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const categoryId = params.id

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const body = await req.json()

    // Validate request body
    const result = updateCategorySchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    // Check if name or slug is being updated and if it already exists
    if ((body.name && body.name !== category.name) || (body.slug && body.slug !== category.slug)) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          id: {
            not: categoryId,
          },
          OR: [body.name ? { name: body.name } : {}, body.slug ? { slug: body.slug } : {}],
        },
      })

      if (existingCategory) {
        return NextResponse.json({ error: "Category with this name or slug already exists" }, { status: 409 })
      }
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: body,
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "An error occurred while updating category" }, { status: 500 })
  }
}

// DELETE category (admin only)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const categoryId = params.id

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Check if category has services
    const servicesCount = await prisma.service.count({
      where: {
        categoryId,
      },
    })

    if (servicesCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with services. Move or delete services first." },
        { status: 400 },
      )
    }

    // Delete category
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    })

    return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "An error occurred while deleting category" }, { status: 500 })
  }
}

