"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Star, MessageSquare, ThumbsUp, Flag, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import ReviewForm from "@/components/review-form"
import { reviewService } from "@/lib/services/review-service"
import { useAuth } from "@/contexts/auth-context"
import { handleApiError } from "@/lib/api-client"
import type { Review, Service } from "@/lib/types"

interface ReviewsProps {
  service: Service
}

export default function Reviews({ service }: ReviewsProps) {
  const { token, user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set())
  const [reportedReviews, setReportedReviews] = useState<Set<string>>(new Set())

  // Check if user has already reviewed this service
  const [userHasReviewed, setUserHasReviewed] = useState(false)

  // Open review dialog if URL has review=true
  useEffect(() => {
    if (searchParams.get("review") === "true") {
      setShowReviewDialog(true)
    }
  }, [searchParams])

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true)
        const response = await reviewService.getServiceReviews(service._id)
        setReviews(response.data)

        // Check if user has already reviewed
        if (user) {
          const hasReviewed = response.data.some((review) => review.reviewer._id === user._id)
          setUserHasReviewed(hasReviewed)
        }
      } catch (error) {
        handleApiError(error, "Failed to load reviews")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [service._id, user])

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => review.rating === rating).length
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
    return { rating, count, percentage }
  })

  // Handle marking review as helpful
  const handleMarkHelpful = (reviewId: string) => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in to mark reviews as helpful",
        variant: "destructive",
      })
      return
    }

    const newHelpfulReviews = new Set(helpfulReviews)

    if (helpfulReviews.has(reviewId)) {
      newHelpfulReviews.delete(reviewId)
    } else {
      newHelpfulReviews.add(reviewId)
    }

    setHelpfulReviews(newHelpfulReviews)

    // In a real implementation, you would call an API to record this
    toast({
      title: helpfulReviews.has(reviewId) ? "Removed as helpful" : "Marked as helpful",
      description: "Thank you for your feedback",
    })
  }

  // Handle reporting review
  const handleReportReview = (reviewId: string) => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in to report reviews",
        variant: "destructive",
      })
      return
    }

    if (reportedReviews.has(reviewId)) {
      toast({
        title: "Already reported",
        description: "You have already reported this review",
      })
      return
    }

    const newReportedReviews = new Set(reportedReviews)
    newReportedReviews.add(reviewId)
    setReportedReviews(newReportedReviews)

    // In a real implementation, you would call an API to record this
    toast({
      title: "Review reported",
      description: "Thank you for helping keep our community safe",
    })
  }

  // Handle review submission
  const handleReviewSubmitted = () => {
    setShowReviewDialog(false)

    // Refresh reviews
    const fetchReviews = async () => {
      try {
        const response = await reviewService.getServiceReviews(service._id)
        setReviews(response.data)
        setUserHasReviewed(true)
      } catch (error) {
        handleApiError(error, "Failed to refresh reviews")
      }
    }

    fetchReviews()
  }

  // Render stars for a rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Customer Reviews</h3>

            <div className="flex items-center gap-2 mb-4">
              <div className="text-3xl font-bold">{service.rating?.toFixed(1) || "0.0"}</div>
              <div>
                {renderStars(service.rating || 0)}
                <p className="text-sm text-muted-foreground">
                  {service.reviewCount || 0} {service.reviewCount === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <div className="w-12 text-sm">{rating} stars</div>
                  <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                    <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className="w-8 text-sm text-right">{count}</div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
              <DialogTrigger asChild>
                <Button className="w-full" disabled={!user || userHasReviewed}>
                  {userHasReviewed ? "You've already reviewed" : "Write a Review"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                  <DialogDescription>Share your experience with {service.title}</DialogDescription>
                </DialogHeader>
                <ReviewForm service={service} onReviewSubmitted={handleReviewSubmitted} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="md:w-2/3">
          <h3 className="text-lg font-medium mb-4">Reviews</h3>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={review.reviewer.profileImage} alt={review.reviewer.name} />
                        <AvatarFallback>
                          {review.reviewer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.reviewer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(review.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div>{renderStars(review.rating)}</div>
                  </div>

                  <p className="mt-3">{review.comment}</p>

                  <div className="flex gap-4 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => handleMarkHelpful(review._id)}
                    >
                      <ThumbsUp className={`h-4 w-4 mr-1 ${helpfulReviews.has(review._id) ? "fill-primary" : ""}`} />
                      Helpful
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => handleReportReview(review._id)}
                      disabled={reportedReviews.has(review._id)}
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      {reportedReviews.has(review._id) ? "Reported" : "Report"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-2 font-medium">No reviews yet</p>
              <p className="text-sm text-muted-foreground">Be the first to review this service</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

