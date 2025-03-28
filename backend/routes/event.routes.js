const express = require("express")
const router = express.Router()
const eventController = require("../controllers/event.controller")
const { protect } = require("../middleware/auth.middleware")

// Event routes
router.route("/")
  .get(eventController.getAllEvents)
  .post(protect, eventController.createEvent)

router.route("/:id")
  .get(eventController.getEventById)
  .put(protect, eventController.updateEvent)
  .delete(protect, eventController.deleteEvent)

// RSVP to an event
router.route("/:id/rsvp")
  .post(protect, eventController.rsvpToEvent)

// Export the router
module.exports = router