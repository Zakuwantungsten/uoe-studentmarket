const express = require("express")
const router = express.Router()
const messageController = require("../controllers/message.controller")
const authController = require("../controllers/auth.controller")

// Get conversations or messages
router.get("/", authController.protect, messageController.getMessages)

// Create a new message
router.post("/", authController.protect, messageController.createMessage)

module.exports = router

