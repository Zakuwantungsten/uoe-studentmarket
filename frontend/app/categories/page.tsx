"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import CategoryCard from "@/components/category-card"
import { categoryService } from "@/lib/services/category-service"
import type { Category } from "@/lib/types"
import { handleApiError } from "@/lib/api-client"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await categoryService.getCategories()
        
        // Ensure we're using the correct property for service counts
        const categoriesWithCounts = response.data.map(category => ({
          ...category,
          // Make sure we preserve the serviceCount from the API
          count: category.serviceCount || category.count || 0
        }))
        
        setCategories(categoriesWithCounts)
        setFilteredCategories(categoriesWithCounts)
      } catch (error) {
        handleApiError(error, "Failed to load categories")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories)
    } else {
      const filtered = categories.filter((category) => category.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredCategories(filtered)
    }
  }, [searchQuery, categories])

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-4 md:space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Browse all service categories</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search categories..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredCategories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 max-w-md mx-auto">
            <div className="bg-muted p-6 rounded-lg shadow-sm mb-6">
              <p className="text-lg font-medium">No categories found</p>
              <p className="text-muted-foreground mb-4">Try a different search term</p>
              <Button className="w-full" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Can't find what you're looking for?</h3>
              <p className="text-muted-foreground mb-4">
                If you can't find the category you're looking for, you can offer that service yourself!
              </p>
              <Button variant="default" className="w-full" asChild>
                <Link href="/offer-service">Offer Your Service</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

