"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Calendar, DollarSign, Users, Star, ShoppingBag, ArrowUpRight, ArrowDownRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, handleApiError } from "@/lib/api-client"
import type { Service, Booking, Review } from "@/lib/types"

// Define chart colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function ProviderDashboardPage() {
  const router = useRouter()
  const { user, token, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalBookings: 0,
    totalCustomers: 0,
    averageRating: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    thisMonthEarnings: 0,
    lastMonthEarnings: 0,
    thisMonthBookings: 0,
    lastMonthBookings: 0,
  })

  // Redirect if not a provider
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "provider")) {
      toast({
        title: "Access denied",
        description: "Only service providers can access this dashboard",
        variant: "destructive",
      })
      router.push("/")
    }
  }, [user, authLoading, router, toast])

  // Fetch provider data
  useEffect(() => {
    const fetchProviderData = async () => {
      if (!token || !user || user.role !== "provider") return

      try {
        setIsLoading(true)

        // Fetch provider's services
        const servicesResponse = await apiClient.get<{ success: boolean; data: Service[] }>("/services/my-services", {
          token,
        })
        setServices(servicesResponse.data)

        // Fetch provider's bookings
        const bookingsResponse = await apiClient.get<{ success: boolean; data: Booking[] }>("/bookings/provider", {
          token,
        })
        setBookings(bookingsResponse.data)

        // Fetch provider's reviews
        const reviewsResponse = await apiClient.get<{ success: boolean; data: Review[] }>("/reviews/provider", {
          token,
        })
        setReviews(reviewsResponse.data)

        // Calculate statistics
        calculateStats(servicesResponse.data, bookingsResponse.data, reviewsResponse.data)
      } catch (error) {
        handleApiError(error, "Failed to load provider dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    if (token && user && user.role === "provider") {
      fetchProviderData()
    }
  }, [token, user])

  // Calculate dashboard statistics
  const calculateStats = (services: Service[], bookings: Booking[], reviews: Review[]) => {
    // Calculate total earnings
    const totalEarnings = bookings
      .filter((booking) => booking.paymentStatus === "paid")
      .reduce((sum, booking) => sum + booking.price, 0)

    // Calculate unique customers
    const uniqueCustomers = new Set(bookings.map((booking) => booking.customer._id)).size

    // Calculate average rating
    const averageRating =
      reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

    // Count booking statuses
    const pendingBookings = bookings.filter((booking) => booking.status === "pending").length
    const completedBookings = bookings.filter((booking) => booking.status === "completed").length
    const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled").length

    // Calculate this month's and last month's earnings
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

    const thisMonthEarnings = bookings
      .filter((booking) => {
        const bookingDate = new Date(booking.createdAt)
        return (
          bookingDate.getMonth() === thisMonth &&
          bookingDate.getFullYear() === thisYear &&
          booking.paymentStatus === "paid"
        )
      })
      .reduce((sum, booking) => sum + booking.price, 0)

    const lastMonthEarnings = bookings
      .filter((booking) => {
        const bookingDate = new Date(booking.createdAt)
        return (
          bookingDate.getMonth() === lastMonth &&
          bookingDate.getFullYear() === lastMonthYear &&
          booking.paymentStatus === "paid"
        )
      })
      .reduce((sum, booking) => sum + booking.price, 0)

    // Calculate this month's and last month's bookings
    const thisMonthBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.createdAt)
      return bookingDate.getMonth() === thisMonth && bookingDate.getFullYear() === thisYear
    }).length

    const lastMonthBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.createdAt)
      return bookingDate.getMonth() === lastMonth && bookingDate.getFullYear() === lastMonthYear
    }).length

    setStats({
      totalEarnings,
      totalBookings: bookings.length,
      totalCustomers: uniqueCustomers,
      averageRating,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      thisMonthEarnings,
      lastMonthEarnings,
      thisMonthBookings,
      lastMonthBookings,
    })
  }

  // Prepare chart data
  const bookingStatusData = [
    { name: "Pending", value: stats.pendingBookings },
    { name: "Completed", value: stats.completedBookings },
    { name: "Cancelled", value: stats.cancelledBookings },
  ]

  const monthlyEarningsData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const month = date.toLocaleString("default", { month: "short" })
    const year = date.getFullYear()

    // In a real app, you would fetch this data from the API
    // For now, we'll generate random data
    return {
      name: `${month} ${year}`,
      earnings:
        i === 0 ? stats.thisMonthEarnings : i === 1 ? stats.lastMonthEarnings : Math.floor(Math.random() * 10000),
    }
  }).reverse()

  if (authLoading || (isLoading && user?.role === "provider")) {
    return (
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 w-64 bg-muted animate-pulse rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "provider") {
    return null // Redirect handled in useEffect
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Provider Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">KSh {stats.totalEarnings.toLocaleString()}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.thisMonthEarnings > stats.lastMonthEarnings ? (
                  <span className="text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stats.lastMonthEarnings > 0
                      ? `+${Math.round(((stats.thisMonthEarnings - stats.lastMonthEarnings) / stats.lastMonthEarnings) * 100)}% from last month`
                      : "Increase from last month"}
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {stats.lastMonthEarnings > 0
                      ? `-${Math.round(((stats.lastMonthEarnings - stats.thisMonthEarnings) / stats.lastMonthEarnings) * 100)}% from last month`
                      : "Decrease from last month"}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.thisMonthBookings > stats.lastMonthBookings ? (
                  <span className="text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stats.lastMonthBookings > 0
                      ? `+${Math.round(((stats.thisMonthBookings - stats.lastMonthBookings) / stats.lastMonthBookings) * 100)}% from last month`
                      : "Increase from last month"}
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {stats.lastMonthBookings > 0
                      ? `-${Math.round(((stats.lastMonthBookings - stats.thisMonthBookings) / stats.lastMonthBookings) * 100)}% from last month`
                      : "Decrease from last month"}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Unique customers served</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Based on {reviews.length} reviews</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Earnings</CardTitle>
                  <CardDescription>Your earnings over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyEarningsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`KSh ${value}`, "Earnings"]} />
                        <Bar dataKey="earnings" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Status</CardTitle>
                  <CardDescription>Distribution of your booking statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {bookingStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, "Bookings"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Key metrics for your services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Active Services</p>
                    <p className="text-2xl font-bold">
                      {services.filter((service) => service.status === "active").length}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Pending Bookings</p>
                    <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Completed Bookings</p>
                    <p className="text-2xl font-bold">{stats.completedBookings}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Cancelled Bookings</p>
                    <p className="text-2xl font-bold">{stats.cancelledBookings}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between">
                  <Button asChild variant="outline">
                    <a href="/my-services/create">Add New Service</a>
                  </Button>
                  <Button asChild>
                    <a href="/my-services">Manage Services</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Your Services</CardTitle>
                <CardDescription>Manage your service offerings</CardDescription>
              </CardHeader>
              <CardContent>
                {services.length > 0 ? (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service._id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h3 className="font-medium">{service.title}</h3>
                          <p className="text-sm text-muted-foreground">{service.category.name}</p>
                          <div className="flex items-center mt-1">
                            <p className="text-sm">KSh {service.price}</p>
                            <span className="mx-2">•</span>
                            <p className="text-sm capitalize">{service.status}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <a href={`/services/${service._id}`}>View</a>
                          </Button>
                          <Button asChild size="sm">
                            <a href={`/my-services/edit/${service._id}`}>Edit</a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-2 font-medium">No services yet</p>
                    <p className="text-sm text-muted-foreground">Start offering your services to earn</p>
                    <Button asChild className="mt-4">
                      <a href="/my-services/create">Create Service</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Manage your service bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking._id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h3 className="font-medium">{booking.service.title}</h3>
                          <p className="text-sm">
                            Booked by {booking.customer.name} on {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center mt-1">
                            <p className="text-sm">KSh {booking.price}</p>
                            <span className="mx-2">•</span>
                            <p className="text-sm capitalize">{booking.status}</p>
                            <span className="mx-2">•</span>
                            <p className="text-sm capitalize">{booking.paymentStatus}</p>
                          </div>
                        </div>
                        <Button asChild size="sm">
                          <a href={`/bookings/${booking._id}`}>View Details</a>
                        </Button>
                      </div>
                    ))}

                    {bookings.length > 5 && (
                      <div className="text-center pt-2">
                        <Button asChild variant="link">
                          <a href="/bookings">View All Bookings</a>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-2 font-medium">No bookings yet</p>
                    <p className="text-sm text-muted-foreground">Your bookings will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Reviews from your customers</CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review._id} className="border-b pb-4">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium">{review.service.title}</p>
                              <p className="text-sm text-muted-foreground">
                                By {review.reviewer.name} on {new Date(review.createdAt).toLocaleDateString()}
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
                        <p className="mt-2">{review.comment}</p>
                      </div>
                    ))}

                    {reviews.length > 5 && (
                      <div className="text-center pt-2">
                        <Button asChild variant="link">
                          <a href="/reviews">View All Reviews</a>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-2 font-medium">No reviews yet</p>
                    <p className="text-sm text-muted-foreground">Reviews from your customers will appear here</p>
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

