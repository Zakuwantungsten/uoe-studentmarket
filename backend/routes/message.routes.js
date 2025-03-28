const express = require("express")
const router = express.Router()
const messageController = require("../controllers/message.controller")
const authController = require("../controllers/auth.controller")

// Get conversations (accessible at both endpoints for compatibility)
router.get("/", authController.protect, messageController.getConversations)
router.get("/conversations", authController.protect, messageController.getConversations)

// Get messages with a specific user
router.get("/:userId", authController.protect, messageController.getConversation)

// Mark messages as read
router.patch("/:id/read", authController.protect, messageController.markConversationAsRead)

// Get unread messages count
router.get("/unread/count", authController.protect, messageController.getUnreadCount)

// Send a new message
router.post("/", authController.protect, messageController.sendMessage)

// Delete a message
router.delete("/:id", authController.protect, messageController.deleteMessage)

module.exports = router