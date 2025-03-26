const express = require("express")
const router = express.Router()
const reviewController = require("../controllers/review.controller")
const authController = require("../controllers/auth.controller")

// Get reviews for a service or user
router.get("/", reviewController.getReviews)

// Create a new review
router.post("/", authController.protect, reviewController.createReview)

module.exports = router

