"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Calendar, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { apiClient, handleApiError } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

interface UpcomingBooking {
  _id: string
  service: {
    _id: string
    title: string
  }
  date: string
  status: string
}

export default function UpcomingBookings() {
  const { token } = useAuth()
  const [bookings, setBookings] = useState<UpcomingBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      if (!token) return

      try {
        setIsLoading(true)

        const response = await apiClient.get<{ success: boolean; data: UpcomingBooking[] }>("/bookings/upcoming", {
          token,
        })

        setBookings(response.data)
      } catch (error) {
        handleApiError(error, "Failed to load upcoming bookings")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchUpcomingBookings()
    }
  }, [token])

  const getStatusBadge = (status: string) => {
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
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
        ))}
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No upcoming bookings.</p>
        <Button asChild className="mt-4">
          <Link href="/services">Browse Services</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking._id} className="border rounded-md p-3">
          <div className="flex justify-between items-start">
            <Link href={`/bookings/${booking._id}`} className="font-medium hover:underline">
              {booking.service.title}
            </Link>
            {getStatusBadge(booking.status)}
          </div>
          <div className="text-sm text-muted-foreground mt-2 space-y-1">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{format(new Date(booking.date), "PPP")}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>{format(new Date(booking.date), "p")}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="text-center mt-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/bookings">View All Bookings</Link>
        </Button>
      </div>
    </div>
  )
}

