const Event = require("../models/event.model")
const mongoose = require("mongoose")

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, location, startDate, endDate, image } = req.body
    const userId = req.user._id

    const event = new Event({
      title,
      description,
      location,
      startDate,
      endDate,
      image,
      organizer: userId,
    })

    await event.save()
    res.status(201).json({
      success: true,
      data: event,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Get all events with pagination and filtering
exports.getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Filter for upcoming events if specified
    const filter = {}
    if (req.query.upcoming === "true") {
      filter.startDate = { $gte: new Date() }
    }

    const events = await Event.find(filter)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit)
      .populate("organizer", "name email")

    const total = await Event.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: events.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: events,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("organizer", "name email")

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    res.status(200).json({
      success: true,
      data: event,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { title, description, location, startDate, endDate, image } = req.body
    const userId = req.user._id

    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    // Check if user is the organizer of the event
    if (event.organizer.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this event",
      })
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, location, startDate, endDate, image },
      { new: true, runValidators: true }
    ).populate("organizer", "name email")

    res.status(200).json({
      success: true,
      data: updatedEvent,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const userId = req.user._id
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    // Check if user is the organizer of the event
    if (event.organizer.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this event",
      })
    }

    await Event.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// RSVP to an event
exports.rsvpToEvent = async (req, res) => {
  try {
    const eventId = req.params.id
    const userId = req.user._id

    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    // Logic for RSVP would be implemented here
    // This is a placeholder for future implementation
    // For now, just return success

    res.status(200).json({
      success: true,
      message: "RSVP successful",
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}