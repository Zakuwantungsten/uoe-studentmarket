"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ServiceCard from "@/components/service-card"
import CategoryCard from "@/components/category-card"
import FeaturedProviders from "@/components/featured-providers"
import { categoryService } from "@/lib/services/category-service"
import { serviceService } from "@/lib/services/service-service"
import type { Category, Service } from "@/lib/types"
import { handleApiError } from "@/lib/api-client"

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredServices, setFeaturedServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch categories
        const categoriesResponse = await categoryService.getCategories()
        setCategories(categoriesResponse.data)

        // Fetch featured services
        const servicesResponse = await serviceService.getFeaturedServices(6)
        setFeaturedServices(servicesResponse.data)
      } catch (error) {
        handleApiError(error, "Failed to load homepage data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/services?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/90 to-primary py-20 text-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Find and Offer Services Within Your Campus Community
              </h1>
              <p className="max-w-[600px] text-white/90 md:text-xl">
                Connect with fellow students at University of Eldoret for tutoring, food delivery, laundry services, and
                more. All in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90">
                  <Link href="/services">Find Services</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="bg-transparent border-white text-white hover:bg-white/10"
                >
                  <Link href="/offer-service">Offer Your Services</Link>
                </Button>
              </div>
            </div>
            <div className="relative lg:ml-auto">
              <div className="relative w-full max-w-md mx-auto lg:max-w-none">
                <div className="relative bg-white rounded-xl shadow-lg p-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg text-primary">Quick Search</h3>
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          className="pl-9"
                          placeholder="What service are you looking for?"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 mt-2">
                        <p className="text-sm text-muted-foreground">Popular searches:</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => setSearchQuery("Tutoring")}
                          >
                            Tutoring
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => setSearchQuery("Food Delivery")}
                          >
                            Food Delivery
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => setSearchQuery("House Hunting")}
                          >
                            House Hunting
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => setSearchQuery("Laundry")}
                          >
                            Laundry
                          </Badge>
                        </div>
                      </div>
                      <Button className="w-full mt-4" type="submit">
                        Search
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-muted/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Browse by Category</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Find exactly what you need from our wide range of student-offered services
              </p>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
              {categories.map((category) => (
                <CategoryCard 
                  key={category._id} 
                  category={{
                    ...category,
                    count: category.serviceCount || 0
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-12">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-start space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Featured Services</h2>
              <p className="text-muted-foreground">Top-rated services from fellow students</p>
            </div>
          </div>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {featuredServices.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}
          <div className="flex justify-center mt-10">
            <Button asChild variant="outline">
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-muted/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">How It Works</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Simple steps to start finding or offering services on campus
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold">Sign Up</h3>
              <p className="text-muted-foreground">Create an account using your university email to get verified</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold">Browse or List</h3>
              <p className="text-muted-foreground">Find services you need or offer your skills to fellow students</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold">Connect & Transact</h3>
              <p className="text-muted-foreground">Message, book services, and pay securely through the platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-12">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-start space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Top Service Providers</h2>
              <p className="text-muted-foreground">Meet our highest-rated student entrepreneurs</p>
            </div>
          </div>
          <div className="mt-8">
            <FeaturedProviders />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-primary text-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Student Success Stories</h2>
              <p className="max-w-[700px] text-white/90 md:text-xl">
                Hear from students who have found success on our platform
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary-foreground flex items-center justify-center text-primary font-bold">
                    JM
                  </div>
                  <div>
                    <h3 className="font-bold">John Mwangi</h3>
                    <p className="text-sm text-white/80">Computer Science Student</p>
                  </div>
                </div>
                <p className="italic">
                  "I've been able to pay my tuition by offering programming tutoring services. This platform connected
                  me with students who needed help!"
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary-foreground flex items-center justify-center text-primary font-bold">
                    SW
                  </div>
                  <div>
                    <h3 className="font-bold">Sarah Wanjiku</h3>
                    <p className="text-sm text-white/80">Business Administration Student</p>
                  </div>
                </div>
                <p className="italic">
                  "My food delivery service has grown from serving 5 students to over 50 regular customers. The review
                  system helped build trust in my business."
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary-foreground flex items-center justify-center text-primary font-bold">
                    DO
                  </div>
                  <div>
                    <h3 className="font-bold">David Omondi</h3>
                    <p className="text-sm text-white/80">Engineering Student</p>
                  </div>
                </div>
                <p className="italic">
                  "Finding a reliable laundry service used to be a hassle. Now I can read reviews, compare prices, and
                  book services all in one place."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to Get Started?</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Join the University of Eldoret student marketplace today and start connecting with your campus community
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild>
                <Link href="/signup">Sign Up Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

