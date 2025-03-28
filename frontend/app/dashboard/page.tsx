"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, MessageSquare, Star, DollarSign, ShoppingBag, Clock, ChevronRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StatsCard from "@/components/stats-card"
import RecentActivities from "@/components/recent-activities"
import EarningsSummary from "@/components/earnings-summary"
import UpcomingBookings from "@/components/upcoming-bookings"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, handleApiError } from "@/lib/api-client"

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
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

        // Set the stats directly since the frontend API route already formats the data
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

        {user?.role === "PROVIDER" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
                <CardDescription>How your services are performing</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="views">
                  <TabsList className="mb-4">
                    <TabsTrigger value="views">Views</TabsTrigger>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  </TabsList>
                  <TabsContent value="views">
                    <div className="h-[300px] flex items-center justify-center border rounded-md">
                      <p className="text-muted-foreground">Service views chart coming soon</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="bookings">
                    <div className="h-[300px] flex items-center justify-center border rounded-md">
                      <p className="text-muted-foreground">Booking trends chart coming soon</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="revenue">
                    <div className="h-[300px] flex items-center justify-center border rounded-md">
                      <p className="text-muted-foreground">Revenue analysis chart coming soon</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Insights</CardTitle>
                <CardDescription>Who's booking your services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Customer insights coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
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
      </div>
    </div>
  )
}

