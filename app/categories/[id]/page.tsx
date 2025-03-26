"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import ServiceCard from "@/components/service-card"
import { categoryService } from "@/lib/services/category-service"
import { serviceService } from "@/lib/services/service-service"
import type { Category, Service } from "@/lib/types"
import { handleApiError } from "@/lib/api-client"

export default function CategoryDetailsPage() {
  const { id } = useParams()
  const [category, setCategory] = useState<Category | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        setIsLoading(true)

        // Fetch category details
        const categoryResponse = await categoryService.getCategoryById(id as string)
        setCategory(categoryResponse.data)

        // Fetch services in this category
        const servicesResponse = await serviceService.getServices({
          category: id as string,
          page: currentPage,
          limit: 9,
        })

        setServices(servicesResponse.data)
        setTotalPages(servicesResponse.totalPages)
      } catch (error) {
        handleApiError(error, "Failed to load category details")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchCategoryDetails()
    }
  }, [id, currentPage])

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
          <div className="h-12 w-96 bg-muted animate-pulse rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <p className="text-muted-foreground mt-2">The category you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="mt-4">
          <Link href="/categories">Back to Categories</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href="/categories">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
          <p className="text-muted-foreground">{category.description || `Browse all services in ${category.name}`}</p>
        </div>

        {services.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg font-medium">No services found in this category</p>
            <p className="text-muted-foreground">Check back later or explore other categories</p>
            <Button asChild className="mt-4">
              <Link href="/services">Browse All Services</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

