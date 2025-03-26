"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Mail, MapPin, Phone, Calendar, Star, Award, MessageSquare, ExternalLink } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import ServiceCard from "@/components/service-card"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, handleApiError } from "@/lib/api-client"
import type { User, Service, Review } from "@/lib/types"

export default function UserProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user: currentUser, token } = useAuth()

  const [user, setUser] = useState<User | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("about")

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)

        // Fetch user profile
        const userResponse = await apiClient.get<{ success: boolean; data: User }>(`/users/${id}`)
        setUser(userResponse.data)

        // Fetch user's services if they are a provider
        if (userResponse.data.role === "provider") {
          const servicesResponse = await apiClient.get<{ success: boolean; data: Service[] }>(
            `/services?providerId=${id}`,
          )
          setServices(servicesResponse.data)
        }

        // Fetch reviews received by the user
        const reviewsResponse = await apiClient.get<{ success: boolean; data: Review[] }>(`/reviews?userId=${id}`)
        setReviews(reviewsResponse.data)
      } catch (error) {
        handleApiError(error, "Failed to load user profile")
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchUserProfile()
    }
  }, [id, router])

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-64 bg-muted animate-pulse rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
            <div className="md:col-span-2">
              <div className="h-12 w-48 bg-muted animate-pulse rounded mb-4"></div>
              <div className="h-4 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-4 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-4 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="text-muted-foreground mt-2">The user you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="mt-4">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-6">
          <Image src="/placeholder.svg?height=256&width=1024" alt="Profile cover" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-background">
                <AvatarImage src={user.profileImage} alt={user.name} />
                <AvatarFallback className="text-xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-white/80">{user.role === "provider" ? "Service Provider" : "Customer"}</p>
              </div>
            </div>

            {currentUser && currentUser._id !== user._id && (
              <div className="flex gap-2">
                <Button asChild variant="outline" className="bg-background/80 backdrop-blur-sm">
                  <Link href={`/messages?recipient=${user._id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            {user.role === "provider" && <TabsTrigger value="services">Services</TabsTrigger>}
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Joined {format(new Date(user.createdAt), "MMMM yyyy")}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.bio ? <p>{user.bio}</p> : <p className="text-muted-foreground">No bio provided</p>}

                    {user.role === "provider" && (
                      <>
                        <Separator className="my-4" />

                        <div className="space-y-4">
                          {user.badges && user.badges.length > 0 && (
                            <div>
                              <h3 className="text-sm font-medium mb-2">Badges</h3>
                              <div className="flex flex-wrap gap-2">
                                {user.badges.map((badge, index) => (
                                  <Badge key={index} variant="secondary" className="flex items-center">
                                    <Award className="h-3 w-3 mr-1" />
                                    {badge}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <h3 className="text-sm font-medium mb-2">Rating</h3>
                            <div className="flex items-center">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= (user.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="ml-2 text-sm">
                                {user.rating?.toFixed(1) || "0.0"} ({user.totalReviews || 0} reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {user.role === "provider" && (
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle>Services Offered</CardTitle>
                  <CardDescription>Browse services offered by {user.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services.map((service) => (
                        <ServiceCard key={service._id} service={service} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No services available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
                <CardDescription>
                  {user.role === "provider" ? "Reviews received for services" : "Reviews written by this user"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border rounded-lg p-4">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  user.role === "provider"
                                    ? review.reviewer.profileImage
                                    : review.service.provider.profileImage
                                }
                                alt={user.role === "provider" ? review.reviewer.name : review.service.provider.name}
                              />
                              <AvatarFallback>
                                {(user.role === "provider" ? review.reviewer.name : review.service.provider.name)
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {user.role === "provider" ? review.reviewer.name : review.service.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(review.createdAt), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="mt-3">{review.comment}</p>

                        <div className="mt-2">
                          <Button variant="link" size="sm" asChild className="h-auto p-0">
                            <Link href={`/services/${review.service._id}`}>
                              View Service <ExternalLink className="h-3 w-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No reviews available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

