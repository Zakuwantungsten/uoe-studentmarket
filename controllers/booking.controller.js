const Booking = require("../models/booking.model")
const Service = require("../models/service.model")
const User = require("../models/user.model")
const mongoose = require("mongoose")

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, date, startTime, endTime, notes } = req.body

    // Check if service exists
    const service = await Service.findById(serviceId).populate("provider")
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      })
    }

    // Check if user is booking their own service
    if (service.provider._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own service",
      })
    }

    // Calculate total amount
    const totalAmount = service.price

    // Create booking
    const booking = await Booking.create({
      service: serviceId,
      customer: req.user.id,
      provider: service.provider._id,
      date,
      startTime,
      endTime,
      notes,
      totalAmount,
      status: "pending",
    })

    // Populate booking
    await booking.populate("service", "title price")
    await booking.populate("customer", "name email phone image")
    await booking.populate("provider", "name email phone image")

    res.status(201).json({
      success: true,
      data: booking,
      message: "Booking created successfully",
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    })
  }
}

// Get all bookings (with pagination and filtering)
exports.getAllBookings = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object
    const filter = {}

    if (req.query.status) {
      filter.status = req.query.status
    }

    if (req.query.service) {
      filter.service = req.query.service
    }

    // Execute query with pagination
    const bookings = await Booking.find(filter)
      .populate("service", "title price")
      .populate("customer", "name email image")
      .populate("provider", "name email image")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt")

    // Get total count for pagination
    const total = await Booking.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: bookings,
    })
  } catch (error) {
    console.error("Error getting bookings:", error)
    res.status(500).json({
      success: false,
      message: "Error getting bookings",
      error: error.message,
    })
  }
}

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("service", "title description price images")
      .populate("customer", "name email phone image")
      .populate("provider", "name email phone image")

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Check if user is authorized to view this booking
    if (
      booking.customer._id.toString() !== req.user.id &&
      booking.provider._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      })
    }

    res.status(200).json({
      success: true,
      data: booking,
    })
  } catch (error) {
    console.error("Error getting booking:", error)
    res.status(500).json({
      success: false,
      message: "Error getting booking",
      error: error.message,
    })
  }
}

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body

    // Validate status
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        validStatuses,
      })
    }

    // Find booking
    let booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Check if user is authorized to update this booking
    if (
      (booking.provider.toString() !== req.user.id && req.user.role !== "admin") ||
      (status === "cancelled" &&
        booking.customer.toString() !== req.user.id &&
        booking.provider.toString() !== req.user.id &&
        req.user.role !== "admin")
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      })
    }

    // Update booking
    booking = await Booking.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true, runValidators: true })
      .populate("service", "title price")
      .populate("customer", "name email image")
      .populate("provider", "name email image")

    res.status(200).json({
      success: true,
      data: booking,
      message: `Booking ${status} successfully`,
    })
  } catch (error) {
    console.error("Error updating booking status:", error)
    res.status(500).json({
      success: false,
      message: "Error updating booking status",
      error: error.message,
    })
  }
}

// Get my bookings (as customer)
exports.getMyBookings = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object
    const filter = { customer: req.user.id }

    if (req.query.status) {
      filter.status = req.query.status
    }

    // Execute query with pagination
    const bookings = await Booking.find(filter)
      .populate("service", "title price images")
      .populate("provider", "name email image")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt")

    // Get total count for pagination
    const total = await Booking.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: bookings,
    })
  } catch (error) {
    console.error("Error getting my bookings:", error)
    res.status(500).json({
      success: false,
      message: "Error getting my bookings",
      error: error.message,
    })
  }
}

// Get bookings for my services (as provider)
exports.getMyServiceBookings = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object
    const filter = { provider: req.user.id }

    if (req.query.status) {
      filter.status = req.query.status
    }

    // Execute query with pagination
    const bookings = await Booking.find(filter)
      .populate("service", "title price images")
      .populate("customer", "name email image")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt")

    // Get total count for pagination
    const total = await Booking.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: bookings,
    })
  } catch (error) {
    console.error("Error getting service bookings:", error)
    res.status(500).json({
      success: false,
      message: "Error getting service bookings",
      error: error.message,
    })
  }
}

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    // Find booking
    let booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Check if user is authorized to cancel this booking
    if (
      booking.customer.toString() !== req.user.id &&
      booking.provider.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      })
    }

    // Check if booking can be cancelled
    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed booking",
      })
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      })
    }

    // Update booking
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: "cancelled",
          cancellationReason: req.body.reason || "No reason provided",
          cancelledBy: req.user.id,
          cancelledAt: Date.now(),
        },
      },
      { new: true, runValidators: true },
    )
      .populate("service", "title price")
      .populate("customer", "name email image")
      .populate("provider", "name email image")

    res.status(200).json({
      success: true,
      data: booking,
      message: "Booking cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message,
    })
  }
}

// Get booking statistics
exports.getBookingStats = async (req, res) => {
  try {
    // Get counts by status
    const statusCounts = await Booking.aggregate([
      {
        $match: {
          $or: [{ customer: mongoose.Types.ObjectId(req.user.id) }, { provider: mongoose.Types.ObjectId(req.user.id) }],
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // Format status counts
    const formattedStatusCounts = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count
      return acc
    }, {})

    // Get total bookings
    const totalBookings = await Booking.countDocuments({
      $or: [{ customer: req.user.id }, { provider: req.user.id }],
    })

    // Get upcoming bookings
    const upcomingBookings = await Booking.countDocuments({
      $or: [{ customer: req.user.id }, { provider: req.user.id }],
      status: { $in: ["pending", "confirmed"] },
      date: { $gte: new Date() },
    })

    // Get total earnings (for provider)
    const completedBookings = await Booking.find({
      provider: req.user.id,
      status: "completed",
    })

    const totalEarnings = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        upcomingBookings,
        totalEarnings,
        statusCounts: {
          pending: formattedStatusCounts.pending || 0,
          confirmed: formattedStatusCounts.confirmed || 0,
          completed: formattedStatusCounts.completed || 0,
          cancelled: formattedStatusCounts.cancelled || 0,
        },
      },
    })
  } catch (error) {
    console.error("Error getting booking stats:", error)
    res.status(500).json({
      success: false,
      message: "Error getting booking statistics",
      error: error.message,
    })
  }
}

// Get upcoming bookings
exports.getUpcomingBookings = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object
    const filter = {
      $or: [{ customer: req.user.id }, { provider: req.user.id }],
      status: { $in: ["pending", "confirmed"] },
      date: { $gte: new Date() },
    }

    // Execute query with pagination
    const bookings = await Booking.find(filter)
      .populate("service", "title price images")
      .populate("customer", "name email image")
      .populate("provider", "name email image")
      .skip(skip)
      .limit(limit)
      .sort("date startTime")

    // Get total count for pagination
    const total = await Booking.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: bookings,
    })
  } catch (error) {
    console.error("Error getting upcoming bookings:", error)
    res.status(500).json({
      success: false,
      message: "Error getting upcoming bookings",
      error: error.message,
    })
  }
}

// Check availability for a service
exports.checkAvailability = async (req, res) => {
  try {
    const { serviceId, date } = req.query

    if (!serviceId || !date) {
      return res.status(400).json({
        success: false,
        message: "Service ID and date are required",
      })
    }

    // Check if service exists
    const service = await Service.findById(serviceId)
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      })
    }

    // Get bookings for this service on the specified date
    const bookings = await Booking.find({
      service: serviceId,
      date: new Date(date),
      status: { $in: ["pending", "confirmed"] },
    }).select("startTime endTime")

    res.status(200).json({
      success: true,
      data: {
        date,
        service: {
          _id: service._id,
          title: service.title,
          price: service.price,
        },
        bookings,
      },
    })
  } catch (error) {
    console.error("Error checking availability:", error)
    res.status(500).json({
      success: false,
      message: "Error checking availability",
      error: error.message,
    })
  }
}

// Get recent bookings
exports.getRecentBookings = async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 5

    // Get recent bookings
    const bookings = await Booking.find({
      $or: [{ customer: req.user.id }, { provider: req.user.id }],
    })
      .populate("service", "title price")
      .populate("customer", "name image")
      .populate("provider", "name image")
      .limit(limit)
      .sort("-createdAt")

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    })
  } catch (error) {
    console.error("Error getting recent bookings:", error)
    res.status(500).json({
      success: false,
      message: "Error getting recent bookings",
      error: error.message,
    })
  }
}

// Get bookings by date range
exports.getBookingsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      })
    }

    // Build filter object
    const filter = {
      $or: [{ customer: req.user.id }, { provider: req.user.id }],
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }

    if (req.query.status) {
      filter.status = req.query.status
    }

    // Get bookings
    const bookings = await Booking.find(filter)
      .populate("service", "title price")
      .populate("customer", "name image")
      .populate("provider", "name image")
      .sort("date startTime")

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    })
  } catch (error) {
    console.error("Error getting bookings by date range:", error)
    res.status(500).json({
      success: false,
      message: "Error getting bookings by date range",
      error: error.message,
    })
  }
}

