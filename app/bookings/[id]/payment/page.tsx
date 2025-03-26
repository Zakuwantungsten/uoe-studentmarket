"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { CreditCard, Phone, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { bookingService } from "@/lib/services/booking-service"
import { paymentService } from "@/lib/services/payment-service"
import { handleApiError } from "@/lib/api-client"
import type { Booking, Transaction } from "@/lib/types"

export default function PaymentPage() {
  const { id } = useParams()
  const router = useRouter()
  const { token, isAuthenticated, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("mpesa")
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [verificationInterval, setVerificationInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/bookings/${id}/payment`)
      return
    }

    const fetchBooking = async () => {
      if (!token || !id) return

      try {
        setIsLoading(true)
        const response = await bookingService.getBooking(id as string, token)
        setBooking(response.data)
        
        // Pre-fill phone number if available
        if (response.data.customer.phone) {
          setPhoneNumber(response.data.customer.phone)
        }
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

    // Clean up verification interval on unmount
    return () => {
      if (verificationInterval) {
        clearInterval(verificationInterval)
      }
    }
  }, [token, id, authLoading, isAuthenticated, router])

  const handlePayment = async () => {
    if (!token || !booking) return

    try {
      setIsProcessing(true)

      if (paymentMethod === "mpesa") {
        if (!phoneNumber.trim()) {
          toast({
            title: "Phone number required",
            description: "Please enter your M-Pesa phone number",
            variant: "destructive"
          })
          setIsProcessing(false)
          return
        }

        // Initiate M-Pesa payment
        const response = await paymentService.initiatePayment({
          bookingId: booking._id,
          phoneNumber
        }, token)

        setTransaction(response.data.transaction)

        toast({
          title: "Payment initiated",
          description: response.data.message
        })

        // Start checking payment status
        const interval = setInterval(async () => {
          try {
            const verifyResponse = await paymentService.verifyPayment(response.data.transaction._id, token)
            
            if (verifyResponse.data.status === "COMPLETED") {
              clearInterval(interval)
              setTransaction(verifyResponse.data)
              
              toast({
                title: "Payment successful",
                description: "Your booking has been confirmed",
                variant: "default"
              })

              // Redirect after 3 seconds
              setTimeout(() => {
                router.push(`/bookings/${id}`)
              }, 3000)
            }
          } catch (error) {
            console.error("Error verifying payment:", error)
          }
        }, 5000) // Check every 5 seconds

        setVerificationInterval(interval)
      }
    } catch (error) {
      handleApiError(error, "Payment processing failed")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-md mx-auto">
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
          <a href="/bookings">Back to Bookings</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Payment for Booking</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Complete your payment to confirm the booking</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {transaction && transaction.status === "COMPLETED" ? (
              <div className="bg-green-50 p-4 rounded-lg flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800">Payment Successful</h3>
                  <p className="text-green-700 text-sm">Your booking has been confirmed. Redirecting...</p>
                </div>
              </div>
            ) : transaction && transaction.status === "PENDING" ? (
              <div className="bg-yellow-50 p-4 rounded-lg flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
                </div>
                <div>
                  <h3 className="font-medium text-yellow-800">Payment Processing</h3>
                  <p className="text-yellow-700 text-sm">Please complete the payment on your phone. We'll update this page automatically.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Booking Summary</h3>
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="font-medium">{booking.service.title}</p>
                      <p className="text-sm text-muted-foreground">Date: {new Date(booking.date).toLocaleDateString()}</p>
                      <Separator className="my-2" />
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-bold">KSh {booking.price}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Payment Method</h3>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 border rounded-md p-3">
                        <RadioGroupItem value="mpesa" id="mpesa" />
                        <Label htmlFor="mpesa" className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          M-Pesa
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-3 mt-2 opacity-50">
                        <RadioGroupItem value="card" id="card" disabled />
                        <Label htmlFor="card" className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Credit/Debit Card (Coming Soon)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {paymentMethod === "mpesa" && (
                    <div>
                      <Label htmlFor="phone">M-Pesa Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="e.g. 07XXXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter the phone number registered with M-Pesa
                      </p>
                    </div>
                  )}

                  <div className="bg-blue-50 p-3 rounded-md flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      This is a demo implementation. No actual payment will be processed.
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()} disabled={isProcessing}>
              Back
            </Button>
            {!transaction || transaction.status !== "COMPLETED" ? (
              <Button onClick={handlePayment} disabled={isProcessing || (transaction?.status === "PENDING")}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : transaction?.status === "PENDING" ? (
                  "Waiting for payment..."
                ) : (
                  "Pay Now"
                )}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => router.push(`/bookings/${id}`)}>
                View Booking
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>\

