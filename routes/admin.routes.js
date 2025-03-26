const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin.controller")
const authController = require("../controllers/auth.controller")

// Get admin dashboard data
router.get("/dashboard", authController.protect, authController.restrictTo("ADMIN"), adminController.getDashboardData)

// Get admin reports
router.get("/reports", authController.protect, authController.restrictTo("ADMIN"), adminController.getReports)

module.exports = router

