const Review = require("../models/review.model")
const Service = require("../models/service.model")
const Booking = require("../models/booking.model")
const mongoose = require("mongoose")

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { serviceId, rating, comment } = req.body

    // Check if service exists
    const service = await Service.findById(serviceId).populate("provider")
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      })
    }

    // Check if user has booked this service
    const booking = await Booking.findOne({
      service: serviceId,
      customer: req.user.id,
      status: "completed",
    })

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: "You can only review services you have booked and completed",
      })
    }

    // Check if user has already reviewed this service
    const existingReview = await Review.findOne({
      service: serviceId,
      reviewer: req.user.id,
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this service",
      })
    }

    // Create review
    const review = await Review.create({
      service: serviceId,
      serviceProvider: service.provider._id,
      reviewer: req.user.id,
      booking: booking._id,
      rating,
      comment,
    })

    // Populate review
    await review.populate("reviewer", "name image")
    await review.populate("service", "title")

    // Update service rating
    await updateServiceRating(serviceId)

    res.status(201).json({
      success: true,
      data: review,
      message: "Review submitted successfully",
    })
  } catch (error) {
    console.error("Error creating review:", error)
    res.status(500).json({
      success: false,
      message: "Error creating review",
      error: error.message,
    })
  }
}

// Get all reviews for a service
exports.getServiceReviews = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Check if service exists
    const service = await Service.findById(req.params.serviceId)
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      })
    }

    // Get reviews
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate("reviewer", "name image")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt")

    // Get total count for pagination
    const total = await Review.countDocuments({ service: req.params.serviceId })

    // Calculate average rating
    const ratings = reviews.map((review) => review.rating)
    const averageRating =
      ratings.length > 0 ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : 0

    // Get rating distribution
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }

    ratings.forEach((rating) => {
      ratingDistribution[rating]++
    })

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      averageRating,
      ratingDistribution,
      data: reviews,
    })
  } catch (error) {
    console.error("Error getting service reviews:", error)
    res.status(500).json({
      success: false,
      message: "Error getting service reviews",
      error: error.message,
    })
  }
}

// Get all reviews by a provider
exports.getProviderReviews = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Get reviews
    const reviews = await Review.find({ serviceProvider: req.params.providerId })
      .populate("reviewer", "name image")
      .populate("service", "title")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt")

    // Get total count for pagination
    const total = await Review.countDocuments({ serviceProvider: req.params.providerId })

    // Calculate average rating
    const ratings = reviews.map((review) => review.rating)
    const averageRating =
      ratings.length > 0 ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : 0

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      averageRating,
      data: reviews,
    })
  } catch (error) {
    console.error("Error getting provider reviews:", error)
    res.status(500).json({
      success: false,
      message: "Error getting provider reviews",
      error: error.message,
    })
  }
}

// Get my reviews (reviews I've written)
exports.getMyReviews = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Get reviews
    const reviews = await Review.find({ reviewer: req.user.id })
      .populate("service", "title images")
      .populate("serviceProvider", "name image")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt")

    // Get total count for pagination
    const total = await Review.countDocuments({ reviewer: req.user.id })

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: reviews,
    })
  } catch (error) {
    console.error("Error getting my reviews:", error)
    res.status(500).json({
      success: false,
      message: "Error getting my reviews",
      error: error.message,
    })
  }
}

// Get reviews for my services
exports.getReviewsForMyServices = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Get reviews
    const reviews = await Review.find({ serviceProvider: req.user.id })
      .populate("reviewer", "name image")
      .populate("service", "title")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt")

    // Get total count for pagination
    const total = await Review.countDocuments({ serviceProvider: req.user.id })

    // Calculate average rating
    const ratings = reviews.map((review) => review.rating)
    const averageRating =
      ratings.length > 0 ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : 0

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      averageRating,
      data: reviews,
    })
  } catch (error) {
    console.error("Error getting reviews for my services:", error)
    res.status(500).json({
      success: false,
      message: "Error getting reviews for my services",
      error: error.message,
    })
  }
}

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body

    // Find review
    let review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      })
    }

    // Check if user is the reviewer
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
      })
    }

    // Update review
    review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: { rating, comment } },
      { new: true, runValidators: true },
    )
      .populate("reviewer", "name image")
      .populate("service", "title")

    // Update service rating
    await updateServiceRating(review.service)

    res.status(200).json({
      success: true,
      data: review,
      message: "Review updated successfully",
    })
  } catch (error) {
    console.error("Error updating review:", error)
    res.status(500).json({
      success: false,
      message: "Error updating review",
      error: error.message,
    })
  }
}

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    // Find review
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      })
    }

    // Check if user is the reviewer or admin
    if (review.reviewer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      })
    }

    // Delete review
    await Review.findByIdAndDelete(req.params.id)

    // Update service rating
    await updateServiceRating(review.service)

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting review:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting review",
      error: error.message,
    })
  }
}

// Helper function to update service rating
async function updateServiceRating(serviceId) {
  try {
    // Get all reviews for this service
    const reviews = await Review.find({ service: serviceId })

    // Calculate average rating
    const ratings = reviews.map((review) => review.rating)
    const averageRating =
      ratings.length > 0 ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : 0

    // Update service
    await Service.findByIdAndUpdate(serviceId, {
      $set: {
        rating: averageRating,
        reviewCount: reviews.length,
      },
    })
  } catch (error) {
    console.error("Error updating service rating:", error)
    throw error
  }
}

