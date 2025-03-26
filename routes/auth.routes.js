const express = require("express")
const router = express.Router()
const authController = require("../controllers/auth.controller")

// Register a new user
router.post("/register", authController.register)

// Login user
router.post("/login", authController.login)

// Get current user
router.get("/me", authController.protect, authController.getMe)

module.exports = router

