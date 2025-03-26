const express = require("express")
const router = express.Router()
const reviewController = require("../controllers/review.controller")
const authController = require("../controllers/auth.controller")

// Get reviews for a specific service
router.get("/service/:serviceId", reviewController.getServiceReviews)

// Get reviews for a specific provider
router.get("/provider/:providerId", reviewController.getProviderReviews)

// Get reviews written by the current user (requires auth)
router.get("/my-reviews", authController.protect, reviewController.getMyReviews)

// Get reviews for services owned by current user (provider dashboard)
router.get("/my-service-reviews", authController.protect, reviewController.getReviewsForMyServices)

// Create a new review (requires auth)
router.post("/", authController.protect, reviewController.createReview)

// Update a review (requires auth)
router.patch("/:id", authController.protect, reviewController.updateReview)

// Delete a review (requires auth)
router.delete("/:id", authController.protect, reviewController.deleteReview)

module.exports = router