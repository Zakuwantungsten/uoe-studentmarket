"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { MapPin, Calendar, Clock, Star, ChevronLeft, Share2, Heart, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import BookingCalendar from "@/components/booking-calendar"
import Reviews from "@/components/reviews"
import { serviceService } from "@/lib/services/service-service"
import { reviewService } from "@/lib/services/review-service"
import type { Service, Review } from "@/lib/types"
import { handleApiError } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

export default function ServiceDetailsPage() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const [service, setService] = useState<Service | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setIsLoading(true)
        const serviceResponse = await serviceService.getServiceById(id as string)
        setService(serviceResponse.data)

        if (serviceResponse.data.images && serviceResponse.data.images.length > 0) {
          setSelectedImage(serviceResponse.data.images[0])
        }

        // Fetch reviews
        const reviewsResponse = await reviewService.getServiceReviews(id as string)
        setReviews(reviewsResponse.data)
      } catch (error) {
        handleApiError(error, "Failed to load service details")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchServiceDetails()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">Service not found</h1>
        <p className="text-muted-foreground mt-2">The service you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="mt-4">
          <Link href="/services">Back to Services</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href="/services">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg border">
              <Image
                src={selectedImage || service.images?.[0] || "/placeholder.svg?height=400&width=800"}
                alt={service.title}
                fill
                className="object-cover"
              />
            </div>
            {service.images && service.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {service.images.map((image, index) => (
                  <div
                    key={index}
                    className={`relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border ${
                      selectedImage === image ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${service.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Service Details */}
          <div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="mb-2">
                {service.category?.name || "Uncategorized"}
              </Badge>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">Save</span>
                </Button>
              </div>
            </div>
            <h1 className="text-3xl font-bold">{service.title}</h1>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center space-x-1 text-amber-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-medium">{service.rating || 0}</span>
                <span className="text-muted-foreground">({service.reviewCount || 0} reviews)</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {service.location}
              </div>
            </div>

            <Tabs defaultValue="description" className="mt-6">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4 space-y-4">
                <p className="text-muted-foreground whitespace-pre-line">{service.description}</p>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">Availability</h3>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{service.availability || "Available on request"}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">Delivery Time</h3>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{service.deliveryTime || "To be discussed"}</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="features" className="mt-4">
                <ul className="space-y-2">
                  {service.features?.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </li>
                  )) || <p className="text-muted-foreground">No features listed for this service.</p>}
                </ul>
              </TabsContent>
              <TabsContent value="reviews" className="mt-4">
                <Reviews service={service} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="space-y-6">
          {/* Price Card */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  {service.discount ? (
                    <>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-destructive">
                          KSh {(service.price - (service.price * service.discount / 100)).toFixed(0)}
                        </span>
                        {service.priceType && <span className="text-sm text-muted-foreground ml-2">{service.priceType}</span>}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-muted-foreground line-through mr-2">KSh {service.price}</span>
                        <span className="text-sm text-destructive font-medium">Save {service.discount}%</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-bold">KSh {service.price}</span>
                      {service.priceType && <span className="text-sm text-muted-foreground">{service.priceType}</span>}
                    </div>
                  )}
                </div>
                {service.discount && (
                  <div className="rounded-md bg-red-50 p-2 text-red-700">
                    <span className="font-medium">{service.discount}% OFF</span> - Limited time offer!
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">Book this service</h3>
                  <BookingCalendar serviceId={service._id} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Provider Card */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="font-medium">About the Provider</h3>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={service.provider?.profileImage} alt={service.provider?.name || ""} />
                    <AvatarFallback>
                      {service.provider?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{service.provider?.name}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="mr-1 h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>
                        {service.provider?.rating || 0} ({service.provider?.reviewCount || 0})
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {service.provider?.bio || "No bio available."}
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/providers/${service.provider?._id}`}>View Profile</Link>
                  </Button>
                  {isAuthenticated && user?._id !== service.provider?._id && (
                    <Button asChild className="w-full">
                      <Link href={`/messages?recipient=${service.provider?._id}`}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Contact
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Similar Services */}
          <div className="space-y-4">
            <h3 className="font-medium">Similar Services</h3>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

