const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcement.controller");
const authController = require("../controllers/auth.controller");

// All routes should be protected
router.use(authController.protect);

// Admin-only routes
// GET /api/announcements - Get all announcements (admin)
// POST /api/announcements - Create announcement (admin)
router.route("/")
  .get(authController.restrictTo("ADMIN"), announcementController.getAnnouncements)
  .post(authController.restrictTo("ADMIN"), announcementController.createAnnouncement);

// GET /api/announcements/active - Get active announcements (all users)
router.get("/active", announcementController.getActiveAnnouncements);

// GET /api/announcements/:id - Get announcement by ID (admin)
// PUT /api/announcements/:id - Update announcement (admin)
// DELETE /api/announcements/:id - Delete announcement (admin)
router.route("/:id")
  .get(authController.restrictTo("ADMIN"), announcementController.getAnnouncementById)
  .put(authController.restrictTo("ADMIN"), announcementController.updateAnnouncement)
  .delete(authController.restrictTo("ADMIN"), announcementController.deleteAnnouncement);

// PATCH /api/announcements/:id/status - Change announcement status (admin)
router.patch(
  "/:id/status",
  authController.restrictTo("ADMIN"),
  announcementController.changeAnnouncementStatus
);

module.exports = router;