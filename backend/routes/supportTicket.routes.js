const express = require("express");
const router = express.Router();
const supportTicketController = require("../controllers/supportTicket.controller");
const authController = require("../controllers/auth.controller");

// All routes should be protected
router.use(authController.protect);

// Routes for all authenticated users
// GET /api/support-tickets - Get all tickets (filtered by user role)
// POST /api/support-tickets - Create a new ticket
router.route("/")
  .get(supportTicketController.getTickets)
  .post(supportTicketController.createTicket);

// GET /api/support-tickets/stats - Get ticket statistics (admin only)
router.get(
  "/stats",
  authController.restrictTo("ADMIN"),
  supportTicketController.getTicketStats
);

// GET /api/support-tickets/:id - Get ticket by ID
// POST /api/support-tickets/:id/responses - Add response to ticket
router.route("/:id")
  .get(supportTicketController.getTicketById);

router.post(
  "/:id/responses",
  supportTicketController.addResponse
);

// Admin-only routes
// PATCH /api/support-tickets/:id/status - Update ticket status
// PATCH /api/support-tickets/:id/assign - Assign ticket to admin
// PATCH /api/support-tickets/:id/priority - Update ticket priority
router.patch(
  "/:id/status",
  authController.restrictTo("ADMIN"),
  supportTicketController.updateTicketStatus
);

router.patch(
  "/:id/assign",
  authController.restrictTo("ADMIN"),
  supportTicketController.assignTicket
);

router.patch(
  "/:id/priority",
  authController.restrictTo("ADMIN"),
  supportTicketController.updateTicketPriority
);

module.exports = router;