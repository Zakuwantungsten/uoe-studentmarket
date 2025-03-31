const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin.controller")
const authController = require("../controllers/auth.controller")
const reviewAdminController = require("../controllers/review.admin.controller")
const disputeController = require("../controllers/dispute.controller")
const financeAdminController = require("../controllers/finance.admin.controller")

// Get admin dashboard data
router.get("/dashboard", authController.protect, authController.restrictTo("ADMIN"), adminController.getDashboardStats)

// Get all users
router.get("/users", authController.protect, authController.restrictTo("ADMIN"), adminController.getAllUsers)

// Get recent activity
router.get("/activity", authController.protect, authController.restrictTo("ADMIN"), adminController.getRecentActivity)

// Get admin reports
router.get("/reports", authController.protect, authController.restrictTo("ADMIN"), adminController.generateReport)

// User statistics
router.get("/users/stats", authController.protect, authController.restrictTo("ADMIN"), adminController.getUserStats)

// Service management
router.get("/services", authController.protect, authController.restrictTo("ADMIN"), adminController.getAllServices)
router.get("/services/pending", authController.protect, authController.restrictTo("ADMIN"), adminController.getPendingServices)

// Service statistics
router.get("/services/stats", authController.protect, authController.restrictTo("ADMIN"), adminController.getServiceStats)

// Category distribution
router.get("/services/categories/distribution", authController.protect, authController.restrictTo("ADMIN"), adminController.getCategoryDistribution)

// Booking statistics
router.get("/bookings/stats", authController.protect, authController.restrictTo("ADMIN"), adminController.getBookingStats)

// Revenue statistics
router.get("/revenue/stats", authController.protect, authController.restrictTo("ADMIN"), adminController.getRevenueStats)

// Moderation
router.get("/moderation/flagged", authController.protect, authController.restrictTo("ADMIN"), adminController.getFlaggedContent)

// Review Management
router.get("/reviews", authController.protect, authController.restrictTo("ADMIN"), reviewAdminController.getAllReviews)
router.get("/reviews/flagged", authController.protect, authController.restrictTo("ADMIN"), reviewAdminController.getFlaggedReviews)
router.get("/reviews/analytics", authController.protect, authController.restrictTo("ADMIN"), reviewAdminController.getReviewAnalytics)
router.patch("/reviews/:id/status", authController.protect, authController.restrictTo("ADMIN"), reviewAdminController.updateReviewStatus)
router.post("/reviews/:id/flag", authController.protect, reviewAdminController.flagReview)

// Dispute Management
router.get("/disputes", authController.protect, authController.restrictTo("ADMIN"), disputeController.getAllDisputes)
router.get("/disputes/stats", authController.protect, authController.restrictTo("ADMIN"), disputeController.getDisputeStats)
router.patch("/disputes/:id/status", authController.protect, authController.restrictTo("ADMIN"), disputeController.updateDisputeStatus)
router.post("/disputes/:id/resolve", authController.protect, authController.restrictTo("ADMIN"), disputeController.resolveDispute)

// Finance Management
router.get("/finance/revenue", authController.protect, authController.restrictTo("ADMIN"), financeAdminController.getRevenueData)
router.get("/finance/revenue-by-category", authController.protect, authController.restrictTo("ADMIN"), financeAdminController.getRevenueByCategory)
router.get("/finance/revenue-by-month", authController.protect, authController.restrictTo("ADMIN"), financeAdminController.getRevenueByMonth)
router.get("/finance/escrow", authController.protect, authController.restrictTo("ADMIN"), financeAdminController.getEscrowPayments)
router.post("/finance/escrow/:bookingId/release", authController.protect, authController.restrictTo("ADMIN"), financeAdminController.releasePayment)
router.get("/finance/refunds", authController.protect, authController.restrictTo("ADMIN"), financeAdminController.getRefundRequests)
router.post("/finance/refunds/:bookingId/process", authController.protect, authController.restrictTo("ADMIN"), financeAdminController.processRefund)
router.get("/finance/transactions", authController.protect, authController.restrictTo("ADMIN"), financeAdminController.getTransactionHistory)

module.exports = router
