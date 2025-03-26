const express = require("express")
const router = express.Router()
const messageController = require("../controllers/message.controller")
const authController = require("../controllers/auth.controller")

// Get conversations
router.get("/", authController.protect, messageController.getConversations)

// Send a new message (using existing sendMessage export)
router.post("/", authController.protect, messageController.sendMessage)

module.exports = router