"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { categoryService } from "@/lib/services/category-service"
import { serviceService } from "@/lib/services/service-service"
import type { Category, Service } from "@/lib/types"
import { handleApiError } from "@/lib/api-client"

export default function EditServicePage() {
  const { id } = useParams()
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [service, setService] = useState<Service | null>(null)
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
  const [status, setStatus] = useState<"active" | "inactive">("active")
  const [discount, setDiscount] = useState("")

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/my-services/edit/${id}`)
      return
    }

    if (!authLoading && user?.role !== "provider") {
      toast({
        title: "Access denied",
        description: "Only service providers can edit services",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    const fetchData = async () => {
      if (!token) return

      try {
        setIsLoading(true)

        // Fetch service details
        const serviceResponse = await serviceService.getServiceById(id as string, token)
        const serviceData = serviceResponse.data

        // Check if the user is the owner of the service
        if (serviceData.provider._id !== user?._id) {
          toast({
            title: "Access denied",
            description: "You can only edit your own services",
            variant: "destructive",
          })
          router.push("/my-services")
          return
        }

        setService(serviceData)
        setTitle(serviceData.title)
        setDescription(serviceData.description)
        setPrice(String(serviceData.price))
        setPriceType(serviceData.priceType || "fixed")
        setLocation(serviceData.location)
        setCategoryId(serviceData.categoryId)
        setFeatures(serviceData.features?.join(", ") || "")
        setImageUrls(serviceData.images?.join("\n") || "")
        setAvailability(serviceData.availability || "")
        setDeliveryTime(serviceData.deliveryTime || "")
        setStatus(serviceData.status as "active" | "inactive")
        setDiscount(serviceData.discount ? String(serviceData.discount) : "")

        // Fetch categories
        const categoriesResponse = await categoryService.getCategories()
        setCategories(categoriesResponse.data)
      } catch (error) {
        handleApiError(error, "Failed to load service data")
      } finally {
        setIsLoading(false)
      }
    }

    if (token && id) {
      fetchData()
    }
  }, [id, token, authLoading, isAuthenticated, user, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token || !id) return

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
        status,
        discount: discount ? Number.parseFloat(discount) : undefined,
      }

      await serviceService.updateService(id as string, serviceData, token)

      toast({
        title: "Service updated",
        description: "Your service has been updated successfully!",
      })

      // Redirect to the service page
      router.push(`/services/${id}`)
    } catch (error) {
      handleApiError(error, "Failed to update service")
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

  if (!service) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">Service not found</h1>
        <p className="text-muted-foreground mt-2">
          The service you're trying to edit doesn't exist or has been removed.
        </p>
        <Button asChild className="mt-4">
          <Link href="/my-services">Back to My Services</Link>
        </Button>
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
              <CardTitle>Edit Service</CardTitle>
              <CardDescription>Update your service listing details</CardDescription>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount Percentage (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    placeholder="e.g., 10"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="status">Service Status</Label>
                    <Switch
                      id="status"
                      checked={status === "active"}
                      onCheckedChange={(checked) => setStatus(checked ? "active" : "inactive")}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {status === "active"
                      ? "Your service is visible to customers"
                      : "Your service is hidden from customers"}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" asChild>
                <Link href="/my-services">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Service"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

