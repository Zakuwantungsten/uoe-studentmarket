const Review = require("../models/review.model")
const Service = require("../models/service.model")
const User = require("../models/user.model")

// Get all reviews (admin)
exports.getAllReviews = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object
    const filter = {}

    if (req.query.status) {
      filter.status = req.query.status
    }

    if (req.query.flagged === "true") {
      filter.flagged = true
    }

    if (req.query.rating) {
      filter.rating = req.query.rating
    }

    if (req.query.service) {
      filter.service = req.query.service
    }

    if (req.query.search) {
      filter.$or = [
        { comment: { $regex: req.query.search, $options: "i" } },
      ]
    }

    // Execute query with pagination
    const reviews = await Review.find(filter)
      .populate("reviewer", "name email image")
      .populate("service", "title")
      .populate("flaggedBy", "name email")
      .skip(skip)
      .limit(limit)
      .sort(req.query.sort || "-createdAt")

    // Get total count for pagination
    const total = await Review.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: reviews,
    })
  } catch (error) {
    console.error("Error getting reviews:", error)
    res.status(500).json({
      success: false,
      message: "Error getting reviews",
      error: error.message,
    })
  }
}

// Get flagged reviews (admin)
exports.getFlaggedReviews = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Execute query with pagination
    const reviews = await Review.find({ flagged: true })
      .populate("reviewer", "name email image")
      .populate("service", "title")
      .populate("flaggedBy", "name email")
      .skip(skip)
      .limit(limit)
      .sort(req.query.sort || "-flaggedAt")

    // Get total count for pagination
    const total = await Review.countDocuments({ flagged: true })

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: reviews,
    })
  } catch (error) {
    console.error("Error getting flagged reviews:", error)
    res.status(500).json({
      success: false,
      message: "Error getting flagged reviews",
      error: error.message,
    })
  }
}

// Update review status (admin)
exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body

    // Validate status
    const validStatuses = ["published", "hidden", "flagged", "under_review"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        validStatuses,
      })
    }

    // Update review status
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          status,
          // If we're clearing a flag, update flagged status too
          ...(status !== "flagged" && { flagged: false }),
          // Add admin notes if provided
          ...(req.body.adminNotes && { adminNotes: req.body.adminNotes })
        } 
      },
      { new: true, runValidators: true },
    )
      .populate("reviewer", "name email image")
      .populate("service", "title")

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      })
    }

    res.status(200).json({
      success: true,
      data: review,
      message: `Review status updated to ${status}`,
    })
  } catch (error) {
    console.error("Error updating review status:", error)
    res.status(500).json({
      success: false,
      message: "Error updating review status",
      error: error.message,
    })
  }
}

// Flag a review
exports.flagReview = async (req, res) => {
  try {
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Flag reason is required",
      })
    }

    // Update review
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          flagged: true,
          flagReason: reason,
          flaggedBy: req.user.id,
          flaggedAt: new Date(),
          status: "flagged"
        } 
      },
      { new: true },
    )
      .populate("reviewer", "name email image")
      .populate("service", "title")

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      })
    }

    res.status(200).json({
      success: true,
      data: review,
      message: "Review flagged successfully",
    })
  } catch (error) {
    console.error("Error flagging review:", error)
    res.status(500).json({
      success: false,
      message: "Error flagging review",
      error: error.message,
    })
  }
}

// Get review analytics
exports.getReviewAnalytics = async (req, res) => {
  try {
    // Get total counts
    const totalReviews = await Review.countDocuments()
    const publishedReviews = await Review.countDocuments({ status: "published" })
    const flaggedReviews = await Review.countDocuments({ flagged: true })
    
    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    // Format rating distribution
    const formattedRatingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }

    ratingDistribution.forEach((item) => {
      formattedRatingDistribution[item._id] = item.count
    })

    // Get reviews over time
    const reviewsByMonth = await Review.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ])

    // Format reviews over time
    const reviewsTrend = reviewsByMonth.map((item) => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
      count: item.count,
      avgRating: parseFloat(item.avgRating.toFixed(1)),
    }))

    res.status(200).json({
      success: true,
      data: {
        totalReviews,
        publishedReviews,
        flaggedReviews,
        ratingDistribution: formattedRatingDistribution,
        reviewsTrend,
      },
    })
  } catch (error) {
    console.error("Error getting review analytics:", error)
    res.status(500).json({
      success: false,
      message: "Error getting review analytics",
      error: error.message,
    })
  }
}