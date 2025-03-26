import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// GET user by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        skills: true,
        education: true,
        certification: true,
        providedServices: {
          include: {
            category: true,
            reviews: {
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                reviewer: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
            _count: {
              select: {
                bookings: true,
              },
            },
          },
        },
        _count: {
          select: {
            providedServices: true,
            reviewsReceived: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate average rating
    let averageRating = 0
    if (user.providedServices.length > 0) {
      const totalReviews = user.providedServices.reduce((acc, service) => acc + service.reviews.length, 0)

      if (totalReviews > 0) {
        const totalRating = user.providedServices.reduce(
          (acc, service) => acc + service.reviews.reduce((sum, review) => sum + review.rating, 0),
          0,
        )

        averageRating = totalRating / totalReviews
      }
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      ...userWithoutPassword,
      averageRating,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "An error occurred while fetching user" }, { status: 500 })
  }
}

// Update user schema
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  skills: z.array(z.string()).optional(),
})

// PATCH update user
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    // Only allow users to update their own profile or admins to update any profile
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()

    // Validate request body
    const result = updateUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    const { skills, ...userData } = body

    // Update user in a transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update user data
      const user = await tx.user.update({
        where: {
          id: userId,
        },
        data: userData,
      })

      // Update skills if provided
      if (skills) {
        // Delete existing skills
        await tx.userSkill.deleteMany({
          where: {
            userId,
          },
        })

        // Create new skills
        await tx.userSkill.createMany({
          data: skills.map((skill: string) => ({
            userId,
            skill,
          })),
        })
      }

      return user
    })

    // Get updated user with skills
    const userWithSkills = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        skills: true,
      },
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = userWithSkills!

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "An error occurred while updating user" }, { status: 500 })
  }
}

// DELETE user (admin only)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const userId = params.id

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user
    await prisma.user.delete({
      where: {
        id: userId,
      },
    })

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "An error occurred while deleting user" }, { status: 500 })
  }
}

