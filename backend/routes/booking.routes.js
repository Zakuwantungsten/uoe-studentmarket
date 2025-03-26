const express = require("express")
const router = express.Router()
const bookingController = require("../controllers/booking.controller")
const authController = require("../controllers/auth.controller")

// Get all bookings for current user
router.get("/", authController.protect, bookingController.getAllBookings)

// Create a new booking
router.post("/", authController.protect, bookingController.createBooking)

// Get booking by ID
router.get("/:id", authController.protect, bookingController.getBookingById)

// Update booking
router.patch("/:id", authController.protect, bookingController.updateBookingStatus)

// Delete booking
router.delete("/:id", authController.protect, bookingController.deleteBooking)

module.exports = router

