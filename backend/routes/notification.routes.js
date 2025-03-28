const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authController = require("../controllers/auth.controller");

// All notification routes should be protected
// GET /api/notifications - Get user's notifications
router.get("/", authController.protect, notificationController.getNotifications);

// PATCH /api/notifications/:id/read - Mark a notification as read
router.patch("/:id/read", authController.protect, notificationController.markAsRead);

// PATCH /api/notifications/read-all - Mark all notifications as read
router.patch("/read-all", authController.protect, notificationController.markAllAsRead);

module.exports = router;