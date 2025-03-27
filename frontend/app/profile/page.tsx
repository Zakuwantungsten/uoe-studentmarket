"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Edit, MapPin, Mail, Phone, Star, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ServiceCard from "@/components/service-card"
import { useAuth } from "@/contexts/auth-context"
import { serviceService } from "@/lib/services/service-service"
import { reviewService } from "@/lib/services/review-service"
import type { Service, Review } from "@/lib/types"
import { handleApiError } from "@/lib/api-client"

export default function ProfilePage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login?redirect=/profile"
      return
    }

    const fetchProfileData = async () => {
      if (!token) return

      try {
        setIsLoading(true)

        // Fetch user's services if they are a provider
        if (user?.role === "PROVIDER") {
          const servicesResponse = await serviceService.getMyServices(token)
          setServices(servicesResponse.data)
        }

        // Fetch user's reviews
        const reviewsResponse = await reviewService.getUserReviews(token)
        setReviews(reviewsResponse.data)
      } catch (error) {
        handleApiError(error, "Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchProfileData()
    }
  }, [token, user, authLoading, isAuthenticated])

  if (authLoading || isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
          <div className="h-40 bg-muted animate-pulse rounded-lg"></div>
          <div className="h-60 bg-muted animate-pulse rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <p className="text-muted-foreground mt-2">Please log in to view your profile.</p>
        <Button asChild className="mt-4">
          <Link href="/login?redirect=/profile">Log In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profileImage} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground">{user.role === "PROVIDER" ? "Service Provider" : "Customer"}</p>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {/* Skills badges */}
                  {user.skills && user.skills.length > 0 && user.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {user.role === "PROVIDER" && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <Star className="mr-1 h-3 w-3 fill-current" />
                      {user.rating || 0} ({user.reviewCount || 0} reviews)
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{user.address || "Location not specified"}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>{user.phone || "Phone not specified"}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex justify-center md:justify-end">
                  <Button asChild>
                    <Link href="/settings">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">
              {user.bio || "No bio information provided yet."}
            </p>
                {/* Skills Section */}
                {user.skills && user.skills.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="font-medium mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Education Section */}
                {user.education && user.education.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="font-medium mb-2">Education</h3>
                      <div className="space-y-3">
                        {user.education.map((edu, index) => (
                          <div key={index} className="border-l-2 border-muted pl-4">
                            <div className="font-medium">{edu.institution}</div>
                            <div>{edu.degree} in {edu.field}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(edu.from).toLocaleDateString()} - 
                              {edu.current ? ' Present' : edu.to ? ` ${new Date(edu.to).toLocaleDateString()}` : ''}
                            </div>
                            {edu.description && <p className="text-sm mt-1">{edu.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Certifications Section */}
                {user.certifications && user.certifications.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="font-medium mb-2">Certifications</h3>
                      <div className="space-y-3">
                        {user.certifications.map((cert, index) => (
                          <div key={index} className="border-l-2 border-muted pl-4">
                            <div className="font-medium">{cert.name}</div>
                            <div className="text-sm">Issued by {cert.organization}</div>
                            <div className="text-sm text-muted-foreground">
                              Issued: {new Date(cert.issueDate).toLocaleDateString()}
                              {cert.expiryDate && ` - Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                            </div>
                            {cert.credentialId && (
                              <div className="text-sm">Credential ID: {cert.credentialId}</div>
                            )}
                            {cert.credentialUrl && (
                              <div className="text-sm">
                                <a 
                                  href={cert.credentialUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View Credential
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue={user.role === "PROVIDER" ? "services" : "reviews"}>
          <TabsList>
            {user.role === "PROVIDER" && <TabsTrigger value="services">My Services</TabsTrigger>}
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {user.role === "PROVIDER" && (
            <TabsContent value="services" className="mt-6">
              {services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <ServiceCard key={service._id} service={service} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg font-medium">No services found</p>
                  <p className="text-muted-foreground">You haven't created any services yet.</p>
                  <Button asChild className="mt-4">
                    <Link href="/my-services/create">Create a Service</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="reviews" className="mt-6">
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review._id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="sm:w-1/4">
                          <Link href={`/services/${review.service._id}`} className="hover:underline font-medium">
                            {review.service.title}
                          </Link>
                          <div className="flex mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-amber-500 text-amber-500" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="sm:w-3/4">
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg font-medium">No reviews found</p>
                <p className="text-muted-foreground">You haven't written any reviews yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/services">Browse Services</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}