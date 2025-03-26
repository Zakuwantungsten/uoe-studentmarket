"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { bookingService } from "@/lib/services/booking-service"
import { handleApiError } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

interface BookingCalendarProps {
  serviceId: string
}

export default function BookingCalendar({ serviceId }: BookingCalendarProps) {
  const { user, isAuthenticated, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [notes, setNotes] = useState<string>("")
  const [isBooking, setIsBooking] = useState<boolean>(false)

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to book this service",
        variant: "destructive",
      })
      router.push(`/login?redirect=/services/${serviceId}`)
      return
    }

    if (!date) {
      toast({
        title: "Date required",
        description: "Please select a date for your booking",
        variant: "destructive",
      })
      return
    }

    try {
      setIsBooking(true)

      await bookingService.createBooking(
        {
          serviceId,
          date: date.toISOString(),
          notes: notes.trim() || undefined,
        },
        token as string,
      )

      toast({
        title: "Booking successful",
        description: "Your booking has been submitted successfully!",
      })

      // Redirect to bookings page
      router.push("/bookings")
    } catch (error) {
      handleApiError(error, "Failed to create booking")
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Select date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Textarea
          placeholder="Add notes or special requests (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="resize-none"
        />
      </div>

      <Button className="w-full" onClick={handleBooking} disabled={isBooking}>
        {isBooking ? "Processing..." : "Book Now"}
      </Button>
    </div>
  )
}

