const express = require("express")
const router = express.Router()
const disputeController = require("../controllers/dispute.controller")
const authController = require("../controllers/auth.controller")

// All routes require authentication
router.use(authController.protect)

// Create a new dispute
router.post("/", disputeController.createDispute)

// Get disputes for current user
router.get("/my-disputes", disputeController.getMyDisputes)

// Get a specific dispute
router.get("/:id", disputeController.getDispute)

// Add a message to a dispute
router.post("/:id/messages", disputeController.addMessage)

module.exports = router