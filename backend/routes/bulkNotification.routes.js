const express = require("express");
const router = express.Router();
const bulkNotificationController = require("../controllers/bulkNotification.controller");
const authController = require("../controllers/auth.controller");

// All routes should be protected and restricted to admins
router.use(authController.protect);
router.use(authController.restrictTo("ADMIN"));

// GET /api/bulk-notifications - Get all bulk notifications
// POST /api/bulk-notifications - Create a new bulk notification
router.route("/")
  .get(bulkNotificationController.getBulkNotifications)
  .post(bulkNotificationController.createBulkNotification);

// GET /api/bulk-notifications/:id - Get bulk notification by ID
// PUT /api/bulk-notifications/:id - Update bulk notification
// DELETE /api/bulk-notifications/:id - Delete bulk notification
router.route("/:id")
  .get(bulkNotificationController.getBulkNotificationById)
  .put(bulkNotificationController.updateBulkNotification)
  .delete(bulkNotificationController.deleteBulkNotification);

// POST /api/bulk-notifications/:id/send - Send a bulk notification immediately
router.post(
  "/:id/send",
  bulkNotificationController.sendBulkNotification
);

// GET /api/bulk-notifications/:id/delivery-records - Get delivery records for a bulk notification
router.get(
  "/:id/delivery-records",
  bulkNotificationController.getDeliveryRecords
);

module.exports = router;