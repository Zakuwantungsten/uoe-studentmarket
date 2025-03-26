"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchIcon, Filter, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import ServiceCard from "@/components/service-card"
import { searchService } from "@/lib/services/search-service"
import { categoryService } from "@/lib/services/category-service"
import { handleApiError } from "@/lib/api-client"
import type { Service, Category } from "@/lib/types"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice") || 0),
    Number(searchParams.get("maxPrice") || 10000)
  ])
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance")
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get("featured") === "true")
  
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page") || 1))
  const [totalPages, setTotalPages] = useState(1)

  // Fetch categories
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

  // Fetch search results
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setIsLoading(true)
        
        const params: any = {
          page: currentPage,
          limit: 12
        }
        
        if (searchQuery) params.q = searchQuery
        if (selectedCategory) params.category = selectedCategory
        if (priceRange[0] > 0) params.minPrice = priceRange[0]
        if (priceRange[1] < 10000) params.maxPrice = priceRange[1]
        if (location) params.location = location
        if (featuredOnly) params.featured = true
        
        // Add sorting
        if (sortBy === "price_low") params.sort = "price:asc"
        else if (sortBy === "price_high") params.sort = "price:desc"
        else if (sortBy === "rating") params.sort = "rating:desc"
        else if (sortBy === "newest") params.sort = "createdAt:desc"
        
        const response = await searchService.searchServices(params)
        
        setServices(response.data)
        setTotalResults(response.total)
        setTotalPages(response.totalPages)
      } catch (error) {
        handleApiError(error, "Failed to load search results")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSearchResults()
  }, [searchQuery, selectedCategory, priceRange, location, sortBy, featuredOnly, currentPage])

  // Update URL with search params
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (searchQuery) params.set("q", searchQuery)
    if (selectedCategory) params.set("category", selectedCategory)
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString())
    if (priceRange[1] < 10000) params.set("maxPrice", priceRange[1].toString())
    if (location) params.set("location", location)
    if (sortBy !== "relevance") params.set("sort", sortBy)
    if (featuredOnly) params.set("featured", "true")
    if (currentPage > 1) params.set("page", currentPage.toString())
    
    router.push(`/search?${params.toString()}`, { scroll: false })
  }, [searchQuery, selectedCategory, priceRange, location, sortBy, featuredOnly, currentPage, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setPriceRange([0, 10000])
    setLocation("")
    setSortBy("relevance")
    setFeaturedOnly(false)
    setCurrentPage(1)
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search Services</h1>
          <p className="text-muted-foreground">Find the perfect service for your needs</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-16"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-10 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
              <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7">
                Search
              </Button>
            </div>
          </form>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Refine your search results</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-6">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Price Range</Label>
                    <div className="pt-4">
                      <Slider
                        value={priceRange}
                        min={0}
                        max={10000}
                        step={100}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                      />
                      <div className="flex justify-between mt-2 text-sm">
                        <span>KSh {priceRange[0]}</span>
                        <span>KSh {priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="Any location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={featuredOnly}
                      onCheckedChange={(checked) => setFeaturedOnly(checked as boolean)}
                    />
                    <Label htmlFor="featured">Featured services only</Label>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                    <Button type="button" onClick={() => document.body.click()}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {isLoading ? "Searching..." : `${totalResults} results found`}
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : services.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          size="icon"
                          onClick={() => setCurrentPage(i + 1)}
                          className="w-8 h-8"
                        >
                          {i + 1}
                        </Button>
                      )).slice(
                        Math.max(0, currentPage - 3),
                        Math.min(totalPages, currentPage + 2)
                      )}
                      {currentPage + 2 < totalPages && (
                        <>
                          {currentPage + 3 < totalPages && <span className="px-1">...</span>}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage(totalPages)}
                            className="w-8 h-8"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg font-medium">No services found</p>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
              <Button onClick={handleClearFilters} className="mt-4">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>\

