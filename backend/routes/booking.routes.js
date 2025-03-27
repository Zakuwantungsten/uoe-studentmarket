const express = require("express")
const router = express.Router()
const bookingController = require("../controllers/booking.controller")
const authController = require("../controllers/auth.controller")

// Get all bookings for current user
router.get("/", authController.protect, bookingController.getAllBookings)

// Get my bookings (as customer)
router.get("/my-bookings", authController.protect, bookingController.getMyBookings)

// Get bookings for my services (as provider)
router.get("/my-services", authController.protect, bookingController.getMyServiceBookings)

// Get upcoming bookings
router.get("/upcoming", authController.protect, bookingController.getUpcomingBookings)

// Get recent bookings
router.get("/recent", authController.protect, bookingController.getRecentBookings)

// Get booking statistics
router.get("/stats", authController.protect, bookingController.getBookingStats)

// Get bookings by date range
router.get("/date-range", authController.protect, bookingController.getBookingsByDateRange)

// Check availability for a service
router.get("/availability", authController.protect, bookingController.checkAvailability)

// Create a new booking
router.post("/", authController.protect, bookingController.createBooking)

// Get booking by ID
router.get("/:id", authController.protect, bookingController.getBookingById)

// Update booking status
router.patch("/:id/status", authController.protect, bookingController.updateBookingStatus)

// Cancel booking
router.post("/:id/cancel", authController.protect, bookingController.cancelBooking)

// Delete booking (admin only)
router.delete("/:id", authController.protect, bookingController.deleteBooking)

module.exports = router

