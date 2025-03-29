"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  Calendar, 
  MessageSquare, 
  Star, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  ChevronRight,
  FileText,
  Plus,
  Download,
  Filter
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import StatsCard from "@/components/stats-card"
import RecentActivities from "@/components/recent-activities"
import EarningsSummary from "@/components/earnings-summary"
import UpcomingBookings from "@/components/upcoming-bookings"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, handleApiError } from "@/lib/api-client"
import { reviewService } from "@/lib/services/review-service"
import { serviceService } from "@/lib/services/service-service"
import { bookingService } from "@/lib/services/booking-service"
import type { Booking, Review, Service } from "@/lib/types"

interface DashboardStats {
  totalBookings: number
  pendingBookings: number
  completedBookings: number
  totalEarnings: number
  totalServices: number
  totalReviews: number
  averageRating: number
  unreadMessages: number
}

export default function DashboardPage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  
  const [activeTab, setActiveTab] = useState(tabParam || "dashboard")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [report, setReport] = useState<any>(null)
  const [reportType, setReportType] = useState("bookings")
  const [reportPeriod, setReportPeriod] = useState("month")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/dashboard")
      return
    }

    const fetchDashboardData = async () => {
      if (!token) return

      try {
        setIsLoading(true)

        const response = await apiClient.get<DashboardStats>("/users/dashboard-stats", {
          token,
        })

        // Set the stats
        setStats(response)
      } catch (error) {
        handleApiError(error, "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchDashboardData()
    }
  }, [token, authLoading, isAuthenticated, router])

  // Fetch data for the active tab
  useEffect(() => {
    const fetchTabData = async () => {
      if (!token) return

      try {
        setIsLoading(true)

        if (activeTab === "my-listings" && user?.role === "PROVIDER") {
          const response = await serviceService.getMyServices(token)
          setServices(response.data)
        } 
        else if (activeTab === "bookings") {
          const response = await bookingService.getBookings(undefined, token)
          setBookings(response.data)
        }
        else if (activeTab === "reviews") {
          const response = await reviewService.getUserReviews(token)
          setReviews(response.data)
        }
        else if (activeTab === "reports") {
          // Fetch report data based on type and period
          const response = await apiClient.get(`/users/dashboard/reports?type=${reportType}&period=${reportPeriod}`, { token })
          setReport(response)
        }
      } catch (error) {
        handleApiError(error, `Failed to load ${activeTab} data`)
      } finally {
        setIsLoading(false)
      }
    }

    if (token && activeTab !== "dashboard") {
      fetchTabData()
    }
  }, [token, activeTab, reportType, reportPeriod, user?.role])

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab === "dashboard") {
      router.replace("/dashboard")
    } else {
      router.replace(`/dashboard?tab=${activeTab}`)
    }
  }, [activeTab, router])

  // Update active tab from URL parameter
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleGenerateReport = async () => {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await apiClient.get(`/users/dashboard/reports?type=${reportType}&period=${reportPeriod}`, { token })
      setReport(response)
    } catch (error) {
      handleApiError(error, "Failed to generate report")
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
          <div className="h-80 bg-muted animate-pulse rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}! Here's an overview of your activity.</p>
        </div>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="my-listings">My Listings</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Dashboard Overview Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Bookings"
                value={stats?.totalBookings || 0}
                description="All time bookings"
                icon={Calendar}
                trend={{
                  value: "+12%",
                  label: "from last month",
                  positive: true,
                }}
              />
              <StatsCard
                title="Unread Messages"
                value={stats?.unreadMessages || 0}
                description="Pending responses"
                icon={MessageSquare}
                trend={{
                  value: "-3",
                  label: "from yesterday",
                  positive: true,
                }}
              />
              {user?.role === "PROVIDER" ? (
                <>
                  <StatsCard
                    title="Total Earnings"
                    value={`KSh ${stats?.totalEarnings || 0}`}
                    description="All time earnings"
                    icon={DollarSign}
                    trend={{
                      value: "+18%",
                      label: "from last month",
                      positive: true,
                    }}
                  />
                  <StatsCard
                    title="Average Rating"
                    value={stats?.averageRating?.toFixed(1) || "0.0"}
                    description={`From ${stats?.totalReviews || 0} reviews`}
                    icon={Star}
                    trend={{
                      value: "+0.2",
                      label: "from last month",
                      positive: true,
                    }}
                  />
                </>
              ) : (
                <>
                  <StatsCard
                    title="Active Services"
                    value={stats?.totalServices || 0}
                    description="Services you've booked"
                    icon={ShoppingBag}
                  />
                  <StatsCard
                    title="Pending Bookings"
                    value={stats?.pendingBookings || 0}
                    description="Awaiting confirmation"
                    icon={Clock}
                  />
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest interactions on the platform</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/bookings">
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <RecentActivities />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{user?.role === "PROVIDER" ? "Earnings Summary" : "Upcoming Bookings"}</CardTitle>
                  <CardDescription>
                    {user?.role === "PROVIDER" ? "Your earnings over time" : "Your scheduled services"}
                  </CardDescription>
                </CardHeader>
                <CardContent>{user?.role === "PROVIDER" ? <EarningsSummary /> : <UpcomingBookings />}</CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button asChild>
                {user?.role === "PROVIDER" ? (
                  <Link href="/my-services/create">Create New Service</Link>
                ) : (
                  <Link href="/services">Browse Services</Link>
                )}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/messages">View Messages</Link>
              </Button>
            </div>
          </TabsContent>

          {/* My Listings Tab */}
          <TabsContent value="my-listings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Listings</CardTitle>
                  <CardDescription>Manage your service listings</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/my-services/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Service
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {services && services.length > 0 ? (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <Card key={service._id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="font-medium">
                                  <Link href={`/services/${service._id}`} className="hover:underline">
                                    {service.title}
                                  </Link>
                                </h3>
                                <Badge variant="outline" className={
                                  service.status === "active" 
                                    ? "bg-green-50 text-green-700 border-green-200" 
                                    : service.status === "inactive"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                }>
                                  {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{service.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="secondary">{service.category?.name || "Uncategorized"}</Badge>
                                <Badge variant="secondary">KSh {service.price}</Badge>
                                {service.featured && (
                                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/my-services/edit/${service._id}`}>
                                  Edit
                                </Link>
                              </Button>
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/services/${service._id}`}>
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-2 font-medium">No services found</p>
                    <p className="text-sm text-muted-foreground">You haven't created any services yet.</p>
                    <Button asChild className="mt-4">
                      <Link href="/my-services/create">Create a Service</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/services">Browse All Services</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/my-services">Manage All Services</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Bookings</CardTitle>
                  <CardDescription>View and manage your bookings</CardDescription>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bookings</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking._id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="font-medium">
                                  {booking.service?.title || "Untitled Service"}
                                </h3>
                                <Badge variant="outline" className={
                                  booking.status === "confirmed" 
                                    ? "bg-green-50 text-green-700 border-green-200" 
                                    : booking.status === "pending"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : booking.status === "completed"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }>
                                  {booking.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                                <span className="text-muted-foreground">
                                  Date: {new Date(booking.date).toLocaleDateString()}
                                </span>
                                <span className="text-muted-foreground">
                                  Time: {new Date(booking.date).toLocaleTimeString() || "N/A"}
                                </span>
                                <span className="text-muted-foreground">
                                  Amount: KSh {booking.price || 0}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/bookings/${booking._id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-2 font-medium">No bookings found</p>
                    <p className="text-sm text-muted-foreground">You haven't made any bookings yet.</p>
                    <Button asChild className="mt-4">
                      <Link href="/services">Browse Services</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/bookings">
                    View All Bookings
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Reviews</CardTitle>
                  <CardDescription>Reviews you've received and given</CardDescription>
                </div>
                <Tabs defaultValue="received">
                  <TabsList>
                    <TabsTrigger value="received">Received</TabsTrigger>
                    <TabsTrigger value="given">Given</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                <Link
                                  href={`/services/${review.service?._id}`}
                                  className="hover:underline"
                                >
                                  {review.service?.title || "Unknown Service"}
                                </Link>
                              </h4>
                              <span className="text-muted-foreground text-sm">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-2 text-sm font-medium">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{review.comment}</p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            By {review.reviewer?.name || "Anonymous User"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-2 font-medium">No reviews found</p>
                    <p className="text-sm text-muted-foreground">You haven't received any reviews yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
                <CardDescription>View and download reports about your activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="report-type">Report Type</Label>
                      <Select
                        value={reportType}
                        onValueChange={setReportType}
                      >
                        <SelectTrigger id="report-type" className="w-full">
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bookings">Bookings History</SelectItem>
                          <SelectItem value="services">Services Activity</SelectItem>
                          <SelectItem value="earnings">Earnings Summary</SelectItem>
                          <SelectItem value="reviews">Reviews Analysis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="report-period">Time Period</Label>
                      <Select
                        value={reportPeriod}
                        onValueChange={setReportPeriod}
                      >
                        <SelectTrigger id="report-period" className="w-full">
                          <SelectValue placeholder="Select time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Last Week</SelectItem>
                          <SelectItem value="month">Last Month</SelectItem>
                          <SelectItem value="quarter">Last Quarter</SelectItem>
                          <SelectItem value="year">Last Year</SelectItem>
                          <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full" onClick={handleGenerateReport}>
                        <Filter className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {report ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">
                          {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
                        </h3>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-xl font-bold">
                                {reportType === "bookings" && report.summary?.totalBookings}
                                {reportType === "services" && report.summary?.totalServices}
                                {reportType === "earnings" && `KSh ${report.summary?.totalEarnings}`}
                                {reportType === "reviews" && report.summary?.totalReviews}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {reportType === "bookings" && "Total Bookings"}
                                {reportType === "services" && "Total Services"}
                                {reportType === "earnings" && "Total Earnings"}
                                {reportType === "reviews" && "Total Reviews"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-xl font-bold">
                                {reportType === "bookings" && report.summary?.completedBookings}
                                {reportType === "services" && report.summary?.activeServices}
                                {reportType === "earnings" && `KSh ${report.summary?.averageEarning}`}
                                {reportType === "reviews" && report.summary?.averageRating.toFixed(1)}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {reportType === "bookings" && "Completed Bookings"}
                                {reportType === "services" && "Active Services"}
                                {reportType === "earnings" && "Average Earning"}
                                {reportType === "reviews" && "Average Rating"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-xl font-bold">
                                {reportType === "bookings" && `${(report.summary?.completionRate * 100).toFixed(0)}%`}
                                {reportType === "services" && report.summary?.viewCount}
                                {reportType === "earnings" && report.summary?.transactionCount}
                                {reportType === "reviews" && report.summary?.reviewsCount}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {reportType === "bookings" && "Completion Rate"}
                                {reportType === "services" && "Total Views"}
                                {reportType === "earnings" && "Transactions"}
                                {reportType === "reviews" && "Positive Reviews"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="border rounded-lg overflow-hidden">
                        <div className="p-4 bg-muted/50">
                          <h4 className="font-medium">Details</h4>
                        </div>
                        {report.details && report.details.length > 0 ? (
                          <div className="divide-y">
                            {report.details.map((item: any, index: number) => (
                              <div key={index} className="p-4 flex justify-between items-center">
                                <div>
                                  <span className="font-medium">{item.date}</span>
                                  <p className="text-sm text-muted-foreground">
                                    {item.description || `${item.count} ${reportType}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  {reportType === "earnings" && <span>KSh {item.amount}</span>}
                                  {reportType === "reviews" && (
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-3 w-3 ${
                                            i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center">
                            <p className="text-muted-foreground">No detailed data available for this report</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 font-medium">No report generated</p>
                      <p className="text-sm text-muted-foreground">Select report type and period, then click Generate</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}