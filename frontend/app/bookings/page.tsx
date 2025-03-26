"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { bookingService } from "@/lib/services/booking-service"
import type { Booking } from "@/lib/types"
import { handleApiError } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

export default function BookingsPage() {
  const { token, isAuthenticated, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login?redirect=/bookings"
      return
    }

    const fetchBookings = async () => {
      if (!token) return

      try {
        setIsLoading(true)

        const filters: any = {}
        if (activeTab !== "all") {
          filters.status = activeTab
        }

        const response = await bookingService.getBookings(filters, token)
        setBookings(response.data)
      } catch (error) {
        handleApiError(error, "Failed to load bookings")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchBookings()
    }
  }, [token, activeTab, authLoading, isAuthenticated])

  const handleCancelBooking = async () => {
    if (!cancelBookingId || !token) return

    try {
      setIsCancelling(true)

      await bookingService.cancelBooking(cancelBookingId, token)

      // Update the booking status in the UI
      setBookings(
        bookings.map((booking) => (booking._id === cancelBookingId ? { ...booking, status: "cancelled" } : booking)),
      )

      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully.",
      })

      setCancelBookingId(null)
      setCancelReason("")
    } catch (error) {
      handleApiError(error, "Failed to cancel booking")
    } finally {
      setIsCancelling(false)
    }
  }

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

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Payment Pending
          </Badge>
        )
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Paid
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Refunded
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
          <div className="h-10 w-96 bg-muted animate-pulse rounded"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">Manage your service bookings</p>
        </div>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>

        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking._id}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={booking.service.images?.[0] || "/placeholder.svg?height=96&width=96"}
                            alt={booking.service.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="font-medium">
                              <Link href={`/services/${booking.service._id}`} className="hover:underline">
                                {booking.service.title}
                              </Link>
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                              {getStatusBadge(booking.status)}
                              {getPaymentStatusBadge(booking.paymentStatus)}
                            </div>
                          </div>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4" />
                              <span>
                                {format(new Date(booking.date), "PPP")} at {format(new Date(booking.date), "p")}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4" />
                              <span>{booking.service.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              <span>{booking.service.deliveryTime || "To be discussed"}</span>
                            </div>
                          </div>
                          {booking.notes && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Notes:</span> {booking.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="text-right">
                          <p className="text-lg font-bold">KSh {booking.price}</p>
                          <p className="text-sm text-muted-foreground">
                            Booked on {format(new Date(booking.createdAt), "PP")}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 mt-4">
                        <Button asChild variant="outline">
                          <Link href={`/bookings/${booking._id}`}>View Details</Link>
                        </Button>
                        {booking.status === "pending" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive" onClick={() => setCancelBookingId(booking._id)}>
                                Cancel Booking
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Cancel Booking</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to cancel this booking? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="flex items-start space-x-2">
                                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                                  <div className="text-sm text-muted-foreground">
                                    Cancellation policies may apply. Please check the service terms.
                                  </div>
                                </div>
                                <Textarea
                                  placeholder="Reason for cancellation (optional)"
                                  value={cancelReason}
                                  onChange={(e) => setCancelReason(e.target.value)}
                                />
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setCancelBookingId(null)}>
                                  Keep Booking
                                </Button>
                                <Button variant="destructive" onClick={handleCancelBooking} disabled={isCancelling}>
                                  {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        {booking.status === "completed" && (
                          <Button asChild>
                            <Link href={`/services/${booking.service._id}?review=true`}>Write a Review</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg font-medium">No bookings found</p>
            <p className="text-muted-foreground">
              {activeTab === "all" ? "You haven't made any bookings yet." : `You don't have any ${activeTab} bookings.`}
            </p>
            <Button asChild className="mt-4">
              <Link href="/services">Browse Services</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

