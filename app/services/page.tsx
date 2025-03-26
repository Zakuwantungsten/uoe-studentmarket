"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import ServiceCard from "@/components/service-card"
import { serviceService } from "@/lib/services/service-service"
import { categoryService } from "@/lib/services/category-service"
import type { Service, Category } from "@/lib/types"
import { handleApiError } from "@/lib/api-client"

export default function ServicesPage() {
  const searchParams = useSearchParams()
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [selectedRating, setSelectedRating] = useState<string>("any")
  const [selectedLocation, setSelectedLocation] = useState<string>("any")
  const [sortBy, setSortBy] = useState("newest")
  const [activeTab, setActiveTab] = useState("all")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories()
        setCategories(response.data)
      } catch (error) {
        handleApiError(error, "Failed to load categories")
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true)

        // Build filters
        const filters: any = {
          page: currentPage,
          limit: 9,
        }

        if (searchQuery) {
          filters.search = searchQuery
        }

        if (selectedCategories.length > 0) {
          filters.category = selectedCategories.join(",")
        }

        if (priceRange[0] > 0 || priceRange[1] < 10000) {
          filters.minPrice = priceRange[0]
          filters.maxPrice = priceRange[1]
        }

        if (selectedRating !== "any") {
          filters.rating = selectedRating
        }

        if (selectedLocation !== "any") {
          filters.location = selectedLocation
        }

        if (sortBy) {
          filters.sort = sortBy
        }

        if (activeTab === "featured") {
          filters.featured = true
        }

        const response = await serviceService.getServices(filters)
        setServices(response.data)
        setTotalPages(response.totalPages)
      } catch (error) {
        handleApiError(error, "Failed to load services")
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [searchQuery, selectedCategories, priceRange, selectedRating, selectedLocation, sortBy, activeTab, currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId])
    } else {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId))
    }
    setCurrentPage(1)
  }

  const handleApplyFilters = () => {
    setCurrentPage(1)
    setIsFilterOpen(false)
  }

  const handleClearFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 10000])
    setSelectedRating("any")
    setSelectedLocation("any")
    setSortBy("newest")
    setActiveTab("all")
    setCurrentPage(1)
  }

  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="flex flex-col space-y-4 md:space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Browse services offered by fellow students</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search services..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Highest Rating</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="space-y-6 py-4">
                  <div>
                    <h3 className="font-medium mb-4">Categories</h3>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <div key={category._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`mobile-${category._id}`}
                            checked={selectedCategories.includes(category._id)}
                            onCheckedChange={(checked) => handleCategoryChange(category._id, checked as boolean)}
                          />
                          <label
                            htmlFor={`mobile-${category._id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Price Range</h3>
                    <div className="space-y-4">
                      <Slider value={priceRange} min={0} max={10000} step={100} onValueChange={setPriceRange as any} />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">KSh {priceRange[0]}</span>
                        <span className="text-sm">KSh {priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button className="flex-1" onClick={handleApplyFilters}>
                      Apply Filters
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleClearFilters}>
                      Clear
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="hidden md:block space-y-6">
            <div>
              <h3 className="font-medium mb-4">Categories</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all"
                    checked={selectedCategories.length === 0}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedCategories([])
                    }}
                  />
                  <label
                    htmlFor="all"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    All Categories
                  </label>
                </div>
                {categories.map((category) => (
                  <div key={category._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category._id}
                      checked={selectedCategories.includes(category._id)}
                      onCheckedChange={(checked) => handleCategoryChange(category._id, checked as boolean)}
                    />
                    <label
                      htmlFor={category._id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Price Range</h3>
              <div className="space-y-4">
                <Slider value={priceRange} min={0} max={10000} step={100} onValueChange={setPriceRange as any} />
                <div className="flex items-center justify-between">
                  <span className="text-sm">KSh {priceRange[0]}</span>
                  <span className="text-sm">KSh {priceRange[1]}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Rating</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rating-any"
                    checked={selectedRating === "any"}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedRating("any")
                    }}
                  />
                  <label
                    htmlFor="rating-any"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Any Rating
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rating-4plus"
                    checked={selectedRating === "4"}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedRating("4")
                    }}
                  />
                  <label
                    htmlFor="rating-4plus"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    4+ Stars
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rating-3plus"
                    checked={selectedRating === "3"}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedRating("3")
                    }}
                  />
                  <label
                    htmlFor="rating-3plus"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    3+ Stars
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Location</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="location-any"
                    checked={selectedLocation === "any"}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedLocation("any")
                    }}
                  />
                  <label
                    htmlFor="location-any"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Any Location
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="location-campus"
                    checked={selectedLocation === "On Campus"}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedLocation("On Campus")
                    }}
                  />
                  <label
                    htmlFor="location-campus"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    On Campus
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="location-nearby"
                    checked={selectedLocation === "Off Campus"}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedLocation("Off Campus")
                    }}
                  />
                  <label
                    htmlFor="location-nearby"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Off Campus
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleClearFilters}>
                Clear
              </Button>
            </div>
          </div>

          {/* Services Grid */}
          <div className="md:col-span-3">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
              </TabsList>
            </Tabs>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-medium">No services found</p>
                <p className="text-muted-foreground">Try adjusting your filters or search query</p>
              </div>
            )}

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
          </div>
        </div>
      </div>
    </div>
  )
}

