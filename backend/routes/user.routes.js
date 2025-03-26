const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")
const authController = require("../controllers/auth.controller")

// Get all users (admin only)
router.get("/", authController.protect, authController.restrictTo("ADMIN"), userController.getAllUsers)

// Get user by ID
router.get("/:id", authController.protect, userController.getUserById)

// Update user
router.patch("/:id", authController.protect, userController.updateUser)

// Delete user (admin only)
router.delete("/:id", authController.protect, authController.restrictTo("ADMIN"), userController.deleteUser)

module.exports = router

