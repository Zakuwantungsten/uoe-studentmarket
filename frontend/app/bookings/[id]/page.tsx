"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, MapPin, Phone, Mail, AlertCircle, CheckCircle } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { bookingService } from "@/lib/services/booking-service"
import { handleApiError } from "@/lib/api-client"
import type { Booking } from "@/lib/types"

export default function BookingDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { token, isAuthenticated, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/bookings/${id}`)
      return
    }

    const fetchBooking = async () => {
      if (!token || !id) return

      try {
        setIsLoading(true)
        const response = await bookingService.getBooking(id as string, token)
        setBooking(response.data)
      } catch (error) {
        handleApiError(error, "Failed to load booking details")
        router.push("/bookings")
      } finally {
        setIsLoading(false)
      }
    }

    if (token && id) {
      fetchBooking()
    }
  }, [token, id, authLoading, isAuthenticated, router])

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
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-64 bg-muted animate-pulse rounded mb-4"></div>
          <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">Booking not found</h1>
        <p className="text-muted-foreground mt-2">The booking you're looking for doesn't exist or you don't have access to it.</p>
        <Button asChild className="mt-4">
          <Link href="/bookings">Back to Bookings</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Booking Details</h1>
          <div className="flex gap-2">
            {getStatusBadge(booking.status)}
            {getPaymentStatusBadge(booking.paymentStatus)}
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-md">
                <Image
                  src={booking.service.images?.[0] || "/placeholder.svg?height=128&width=128"}
                  alt={booking.service.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium">
                  <Link href={`/services/${booking.service._id}`} className="hover:underline">
                    {booking.service.title}
                  </Link>
                </h3>
                <p className="text-muted-foreground">{booking.service.description}</p>
                <div className="mt-2 space-y-1 text-sm">
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
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Provider Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={booking.provider.profileImage} alt={booking.provider.name} />
                  <AvatarFallback>
                    {booking.provider.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{booking.provider.name}</p>
                  <p className="text-sm text-muted-foreground">Service Provider</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  <span>{booking.provider.email}</span>
                </div>
                {booking.provider.phone && (
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>{booking.provider.phone}</span>
                  </div>
                )}
              </div>
              <Button variant="outline" asChild className="w-full">
                <Link href={`/messages?recipient=${booking.provider._id}`}>
                  Contact Provider
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Service Fee:</span>
                  <span>KSh {booking.price}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total Amount:</span>
                  <span>KSh {booking.price}</span>
                </div>
              </div>

              {booking.paymentStatus === "pending" ? (
                <div className="bg-yellow-50 p-3 rounded-md flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-700">Payment is required to confirm this booking.</p>
                  </div>
                </div>
              ) : booking.paymentStatus === "paid" ? (
                <div className="bg-green-50 p-3 rounded-md flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-700">Payment completed on {format(new Date(booking.paidAt || booking.updatedAt), "PPP")}</p>
                  </div>
                </div>
              ) : null}

              {booking.status === "pending" && booking.paymentStatus === "pending" && (
                <Button asChild className="w-full">
                  <Link href={`/bookings/${booking._id}/payment`}>
                    Pay Now
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {booking.notes ? (
              <p>{booking.notes}</p>
            ) : (
              <p className="text-muted-foreground">No additional notes provided for this booking.</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/bookings">Back to Bookings</Link>
            </Button>
            {booking.status === "completed" && (
              <Button asChild>
                <Link href={`/services/${booking.service._id}?review=true`}>Write a Review</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  

