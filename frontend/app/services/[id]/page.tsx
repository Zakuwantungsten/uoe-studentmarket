"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { MapPin, Calendar, Clock, Star, ChevronLeft, ChevronRight, Share2, Heart, MessageSquare } from "lucide-react"

// Helper function to normalize image URLs - same as in service-card.tsx
const normalizeImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  
  // If already absolute URL with protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Handle URL that includes 'uploads/' but may be missing the leading slash
  if (url.includes('uploads/') && !url.startsWith('/')) {
    return `/${url}`;
  }
  
  // If URL has a host but no protocol, add protocol
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  // If URL is a relative path without starting slash, add it
  if (!url.startsWith('/')) {
    return `/${url}`;
  }
  
  return url;
};

// Helper function to attempt URL repair if the initial URL fails to load
const attemptUrlRepair = (url: string): string => {
  // Skip if it's already a placeholder or empty
  if (!url || url.includes('placeholder')) {
    return "/placeholder.svg";
  }
  
  // Extract filename from URL
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  
  // Try direct /uploads/ path
  if (!url.includes('/uploads/')) {
    return `/uploads/${filename}`;
  }
  
  // If it's a full URL with hostname and uploads, try the relative path
  if (url.includes('://') && url.includes('/uploads/')) {
    return `/uploads/${filename}`;
  }
  
  // Try prefixing with API base URL
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000";
  if (!url.startsWith('http')) {
    return `${apiBase}${url.startsWith('/') ? url : `/${url}`}`;
  }
  
  // When all else fails, return placeholder
  return "/placeholder.svg";
};

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import BookingCalendar from "@/components/booking-calendar"
import Reviews from "@/components/reviews"
import ServiceCard from "@/components/service-card"
import { serviceService } from "@/lib/services/service-service"
import { reviewService } from "@/lib/services/review-service"
import type { Service, Review } from "@/lib/types"
import { handleApiError } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

// Similar Services Component
function SimilarServices({ serviceId, categoryId }: { serviceId: string, categoryId?: string }) {
  const [similarServices, setSimilarServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 6;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchSimilarServices = async () => {
      if (!categoryId) return;
      
      try {
        setIsLoading(true);
        const response = await serviceService.getServices({
          category: categoryId,
          page: currentPage,
          limit: servicesPerPage,
        });
        
        // Filter out the current service
        const filteredServices = response.data.filter(service => service._id !== serviceId);
        setSimilarServices(filteredServices);
        
        // Calculate total pages - using the total count from response
        // Handle different response structures safely
        const total = response.total || 0;
        setTotalPages(Math.ceil(total / servicesPerPage));
      } catch (error) {
        console.error("Failed to fetch similar services:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilarServices();
  }, [categoryId, serviceId, currentPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (similarServices.length === 0) {
    return <p className="text-center text-muted-foreground">No similar services found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarServices.map((service) => (
          <ServiceCard key={service._id} service={service} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            
            <span className="text-sm text-muted-foreground px-4">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}

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
            <div className="relative overflow-hidden rounded-lg border" style={{ height: "300px" }}>
              <Image
                src={normalizeImageUrl(selectedImage || service.images?.[0]) || "/placeholder.svg?height=300&width=600"}
                alt={service.title}
                fill
                className="object-contain"
                onError={(e) => {
                  // If image fails to load, try alternate URL format before using placeholder
                  const img = e.target as HTMLImageElement;
                  const origSrc = img.src;
                  
                  if ((selectedImage || service.images?.[0]) && !origSrc.includes("placeholder.svg")) {
                    // Try alternate URL format
                    const alternateUrl = attemptUrlRepair(selectedImage || service.images?.[0] || "");
                    console.error("Image failed to load, trying alternate format:", alternateUrl);
                    img.src = alternateUrl;
                  } else {
                    // Fall back to placeholder
                    img.src = "/placeholder.svg?height=400&width=800";
                  }
                }}
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
                      src={normalizeImageUrl(image) || "/placeholder.svg"}
                      alt={`${service.title} ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // If thumbnail fails to load, try alternate format
                        const img = e.target as HTMLImageElement;
                        if (image && !img.src.includes("placeholder")) {
                          img.src = attemptUrlRepair(image);
                        } else {
                          img.src = "/placeholder.svg";
                        }
                      }}
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
                    <Link href={`/profile/${service.provider?._id}`}>View Profile</Link>
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
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-center mb-6">Similar Services</h3>
            {isLoading || !service ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <SimilarServices serviceId={service._id} categoryId={service.category?._id} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

