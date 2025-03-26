"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { categoryService } from "@/lib/services/category-service"
import { serviceService } from "@/lib/services/service-service"
import type { Category } from "@/lib/types"
import { handleApiError } from "@/lib/api-client"
import { useEffect } from "react"

export default function CreateServicePage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [priceType, setPriceType] = useState("fixed")
  const [location, setLocation] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [features, setFeatures] = useState("")
  const [imageUrls, setImageUrls] = useState("")
  const [availability, setAvailability] = useState("")
  const [deliveryTime, setDeliveryTime] = useState("")

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/my-services/create")
      return
    }

    if (!authLoading && user?.role !== "provider") {
      toast({
        title: "Access denied",
        description: "Only service providers can create services",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await categoryService.getCategories()
        setCategories(response.data)
      } catch (error) {
        handleApiError(error, "Failed to load categories")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [authLoading, isAuthenticated, user, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) return

    try {
      setIsSubmitting(true)

      // Parse features from comma-separated string to array
      const featuresArray = features
        .split(",")
        .map((feature) => feature.trim())
        .filter((feature) => feature.length > 0)

      // Parse image URLs from newline-separated string to array
      const imagesArray = imageUrls
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0)

      const serviceData = {
        title,
        description,
        price: Number.parseFloat(price),
        priceType,
        location,
        categoryId,
        features: featuresArray,
        images: imagesArray,
        availability,
        deliveryTime,
      }

      const response = await serviceService.createService(serviceData, token)

      toast({
        title: "Service created",
        description: "Your service has been created successfully!",
      })

      // Redirect to the service page
      router.push(`/services/${response.data._id}`)
    } catch (error) {
      handleApiError(error, "Failed to create service")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
          <div className="h-12 w-96 bg-muted animate-pulse rounded"></div>
          <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href="/my-services">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to My Services
          </Link>
        </Button>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Create a New Service</CardTitle>
              <CardDescription>Fill in the details below to create your service listing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Service Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Professional Math Tutoring"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your service in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (KSh)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 1000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceType">Price Type</Label>
                  <Select value={priceType} onValueChange={setPriceType}>
                    <SelectTrigger id="priceType">
                      <SelectValue placeholder="Select price type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="hourly">Per Hour</SelectItem>
                      <SelectItem value="daily">Per Day</SelectItem>
                      <SelectItem value="weekly">Per Week</SelectItem>
                      <SelectItem value="monthly">Per Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., On Campus, Library"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Textarea
                  id="features"
                  placeholder="e.g., One-on-one sessions, Flexible scheduling, Practice materials included"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">Separate each feature with a comma</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrls">Image URLs (one per line)</Label>
                <Textarea
                  id="imageUrls"
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Add one image URL per line. The first image will be the main image.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    placeholder="e.g., Weekdays after 4 PM"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Delivery Time</Label>
                  <Input
                    id="deliveryTime"
                    placeholder="e.g., Within 24 hours"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" asChild>
                <Link href="/my-services">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Service"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

