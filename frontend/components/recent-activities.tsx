"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, MessageSquare, Star, DollarSign, ShoppingBag } from "lucide-react"
import { format } from "date-fns"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { apiClient, handleApiError } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

interface Activity {
  _id: string
  type: "booking" | "message" | "review" | "payment" | "service"
  title: string
  description: string
  date: string
  status?: string
  user?: {
    _id: string
    name: string
    profileImage?: string
  }
  link?: string
}

export default function RecentActivities() {
  const { token } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      if (!token) return

      try {
        setIsLoading(true)

        // Use the user profile endpoint which is a valid endpoint
        await apiClient.get("/api/users/me", {
          token,
        })
        
        // Since we don't have a proper activities endpoint, just show placeholder data
        // In a real scenario, you would derive activities from bookings, services, etc.
        setActivities([])
      } catch (error) {
        handleApiError(error, "Failed to load recent activities")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchActivities()
    }
  }, [token])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4" />
      case "message":
        return <MessageSquare className="h-4 w-4" />
      case "review":
        return <Star className="h-4 w-4" />
      case "payment":
        return <DollarSign className="h-4 w-4" />
      case "service":
        return <ShoppingBag className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null

    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Confirmed
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
              <div className="h-3 w-1/2 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recent activities found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <div key={activity._id} className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-2 text-primary mt-1">{getActivityIcon(activity.type)}</div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {activity.link ? (
                  <Link href={activity.link} className="hover:underline">
                    {activity.title}
                  </Link>
                ) : (
                  activity.title
                )}
              </div>
              <div className="text-xs text-muted-foreground">{format(new Date(activity.date), "MMM d, h:mm a")}</div>
            </div>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
            <div className="flex items-center justify-between mt-2">
              {activity.user && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={activity.user.profileImage} alt={activity.user.name} />
                    <AvatarFallback className="text-xs">
                      {activity.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{activity.user.name}</span>
                </div>
              )}
              {getStatusBadge(activity.status)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

