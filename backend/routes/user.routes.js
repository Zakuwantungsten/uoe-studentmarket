const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")
const authController = require("../controllers/auth.controller")

// Public route for top providers
router.get("/top-providers", userController.getServiceProviders)

// Get current user profile (protected route)
router.get("/me", authController.protect, userController.getCurrentUser)

// Get user statistics (protected route)
router.get("/stats", authController.protect, userController.getUserStats)

// Get all users (admin only)
router.get("/", authController.protect, authController.restrictTo("ADMIN"), userController.getAllUsers)

// Get user by ID (protected route)
router.get("/:id", authController.protect, userController.getUserById)

// Update user profile (protected route)
router.patch("/", authController.protect, userController.updateUser)

// Delete user account (protected route)
router.delete("/", authController.protect, userController.deleteUser)

module.exports = router