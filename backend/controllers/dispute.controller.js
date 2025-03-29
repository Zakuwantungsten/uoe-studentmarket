const Dispute = require("../models/dispute.model")
const Booking = require("../models/booking.model")
const User = require("../models/user.model")
const Service = require("../models/service.model")

// Create a new dispute
exports.createDispute = async (req, res) => {
  try {
    const { bookingId, type, description, desiredOutcome, evidence } = req.body

    if (!bookingId || !type || !description || !desiredOutcome) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      })
    }

    // Check if booking exists
    const booking = await Booking.findById(bookingId)
      .populate("service")
      .populate("customer")
      .populate("provider")

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Check if user is involved in this booking
    if (booking.customer._id.toString() !== req.user.id && booking.provider._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create a dispute for this booking",
      })
    }

    // Check if dispute already exists for this booking
    const existingDispute = await Dispute.findOne({ booking: bookingId })
    if (existingDispute) {
      return res.status(400).json({
        success: false,
        message: "A dispute already exists for this booking",
      })
    }

    // Create the dispute
    const dispute = await Dispute.create({
      booking: bookingId,
      service: booking.service._id,
      provider: booking.provider._id,
      customer: booking.customer._id,
      initiatedBy: req.user.id,
      type,
      description,
      desiredOutcome,
      evidence: evidence || [],
      messages: [
        {
          sender: req.user.id,
          content: description,
          isAdminMessage: false,
        },
      ],
    })

    // Populate the dispute fields
    await dispute.populate("initiatedBy", "name email image")
    await dispute.populate("booking")
    await dispute.populate("service", "title")

    res.status(201).json({
      success: true,
      data: dispute,
      message: "Dispute created successfully",
    })
  } catch (error) {
    console.error("Error creating dispute:", error)
    res.status(500).json({
      success: false,
      message: "Error creating dispute",
      error: error.message,
    })
  }
}

// Get my disputes (disputes I'm involved in)
exports.getMyDisputes = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Find disputes where user is either customer or provider
    const filter = {
      $or: [{ customer: req.user.id }, { provider: req.user.id }],
    }

    // Add status filter if provided
    if (req.query.status) {
      filter.status = req.query.status
    }

    // Get disputes
    const disputes = await Dispute.find(filter)
      .populate("service", "title")
      .populate("booking", "startDate endDate")
      .populate("customer", "name image")
      .populate("provider", "name image")
      .populate("initiatedBy", "name image")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const total = await Dispute.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: disputes.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: disputes,
    })
  } catch (error) {
    console.error("Error getting my disputes:", error)
    res.status(500).json({
      success: false,
      message: "Error getting disputes",
      error: error.message,
    })
  }
}

// Get a specific dispute
exports.getDispute = async (req, res) => {
  try {
    // Find the dispute
    const dispute = await Dispute.findById(req.params.id)
      .populate("service", "title")
      .populate("booking", "startDate endDate totalAmount")
      .populate("customer", "name email image")
      .populate("provider", "name email image")
      .populate("initiatedBy", "name email image")
      .populate("messages.sender", "name image role")

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found",
      })
    }

    // Check if user is involved in this dispute or is admin
    if (
      dispute.customer._id.toString() !== req.user.id &&
      dispute.provider._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this dispute",
      })
    }

    res.status(200).json({
      success: true,
      data: dispute,
    })
  } catch (error) {
    console.error("Error getting dispute:", error)
    res.status(500).json({
      success: false,
      message: "Error getting dispute",
      error: error.message,
    })
  }
}

// Add a message to a dispute
exports.addMessage = async (req, res) => {
  try {
    const { content } = req.body

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      })
    }

    // Find the dispute
    const dispute = await Dispute.findById(req.params.id)
      .populate("customer", "name email")
      .populate("provider", "name email")

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found",
      })
    }

    // Check if user is involved in this dispute or is admin
    if (
      dispute.customer._id.toString() !== req.user.id &&
      dispute.provider._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to message in this dispute",
      })
    }

    // Add message to dispute
    const message = {
      sender: req.user.id,
      content,
      timestamp: new Date(),
      isAdminMessage: req.user.role === "admin",
    }

    dispute.messages.push(message)
    await dispute.save()

    // Populate the new message
    await dispute.populate("messages.sender", "name image role")

    res.status(200).json({
      success: true,
      data: dispute.messages[dispute.messages.length - 1],
      message: "Message added successfully",
    })
  } catch (error) {
    console.error("Error adding message:", error)
    res.status(500).json({
      success: false,
      message: "Error adding message",
      error: error.message,
    })
  }
}

// Admin: Get all disputes
exports.getAllDisputes = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object
    const filter = {}

    if (req.query.status) {
      filter.status = req.query.status
    }

    if (req.query.type) {
      filter.type = req.query.type
    }

    if (req.query.search) {
      filter.$or = [
        { description: { $regex: req.query.search, $options: "i" } },
        { desiredOutcome: { $regex: req.query.search, $options: "i" } },
      ]
    }

    // Get disputes
    const disputes = await Dispute.find(filter)
      .populate("service", "title")
      .populate("booking", "startDate endDate totalAmount")
      .populate("customer", "name email image")
      .populate("provider", "name email image")
      .populate("initiatedBy", "name")
      .sort(req.query.sort || "-createdAt")
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const total = await Dispute.countDocuments(filter)

    // Get dispute count by status
    const statusCounts = await Dispute.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const formattedStatusCounts = {
      open: 0,
      under_review: 0,
      mediation: 0,
      resolved: 0,
      closed: 0,
    }

    statusCounts.forEach((status) => {
      formattedStatusCounts[status._id] = status.count
    })

    res.status(200).json({
      success: true,
      count: disputes.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      statusCounts: formattedStatusCounts,
      data: disputes,
    })
  } catch (error) {
    console.error("Error getting disputes:", error)
    res.status(500).json({
      success: false,
      message: "Error getting disputes",
      error: error.message,
    })
  }
}

// Admin: Update dispute status
exports.updateDisputeStatus = async (req, res) => {
  try {
    const { status, notes } = req.body

    // Validate status
    const validStatuses = ["open", "under_review", "mediation", "resolved", "closed"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        validStatuses,
      })
    }

    // Find the dispute
    const dispute = await Dispute.findById(req.params.id)

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found",
      })
    }

    // Update dispute status
    dispute.status = status
    
    // If dispute is being resolved or closed, add resolution details
    if (status === "resolved" || status === "closed") {
      dispute.resolutionNotes = notes || "Dispute resolved by admin"
      dispute.resolvedBy = req.user.id
      dispute.resolvedAt = new Date()
    }

    // Add status change message
    const statusMessage = {
      sender: req.user.id,
      content: `Dispute status changed to ${status}${notes ? `: ${notes}` : ''}`,
      timestamp: new Date(),
      isAdminMessage: true,
    }

    dispute.messages.push(statusMessage)
    
    await dispute.save()

    // Populate the dispute
    await dispute.populate("service", "title")
    await dispute.populate("customer", "name email")
    await dispute.populate("provider", "name email")
    await dispute.populate("resolvedBy", "name")
    await dispute.populate("messages.sender", "name role")

    res.status(200).json({
      success: true,
      data: dispute,
      message: `Dispute status updated to ${status}`,
    })
  } catch (error) {
    console.error("Error updating dispute status:", error)
    res.status(500).json({
      success: false,
      message: "Error updating dispute status",
      error: error.message,
    })
  }
}

// Admin: Resolve dispute
exports.resolveDispute = async (req, res) => {
  try {
    const { resolution, notes } = req.body

    if (!resolution) {
      return res.status(400).json({
        success: false,
        message: "Resolution is required",
      })
    }

    // Find the dispute
    const dispute = await Dispute.findById(req.params.id)

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found",
      })
    }

    // Update dispute
    dispute.status = "resolved"
    dispute.resolution = resolution
    dispute.resolutionNotes = notes
    dispute.resolvedBy = req.user.id
    dispute.resolvedAt = new Date()

    // Add resolution message
    const resolutionMessage = {
      sender: req.user.id,
      content: `Dispute resolved: ${resolution}${notes ? ` - ${notes}` : ''}`,
      timestamp: new Date(),
      isAdminMessage: true,
    }

    dispute.messages.push(resolutionMessage)
    
    await dispute.save()

    // Populate the dispute
    await dispute.populate("service", "title")
    await dispute.populate("customer", "name email")
    await dispute.populate("provider", "name email")
    await dispute.populate("resolvedBy", "name")
    await dispute.populate("messages.sender", "name role")

    res.status(200).json({
      success: true,
      data: dispute,
      message: "Dispute resolved successfully",
    })
  } catch (error) {
    console.error("Error resolving dispute:", error)
    res.status(500).json({
      success: false,
      message: "Error resolving dispute",
      error: error.message,
    })
  }
}

// Get dispute statistics (admin)
exports.getDisputeStats = async (req, res) => {
  try {
    // Get dispute counts by status
    const disputesByStatus = await Dispute.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // Get dispute counts by type
    const disputesByType = await Dispute.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ])

    // Get disputes over time
    const disputesByMonth = await Dispute.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ["$status", "resolved"] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ])

    // Format disputes over time
    const formattedDisputesByMonth = disputesByMonth.map((item) => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
      total: item.count,
      resolved: item.resolved,
    }))

    // Get average resolution time
    const resolvedDisputes = await Dispute.find({
      status: "resolved",
      resolvedAt: { $exists: true },
    })

    let totalResolutionTimeMs = 0
    let disputesWithResolutionTime = 0

    resolvedDisputes.forEach((dispute) => {
      if (dispute.resolvedAt) {
        const createdAt = new Date(dispute.createdAt).getTime()
        const resolvedAt = new Date(dispute.resolvedAt).getTime()
        totalResolutionTimeMs += resolvedAt - createdAt
        disputesWithResolutionTime++
      }
    })

    const avgResolutionTimeHours = disputesWithResolutionTime > 0
      ? Math.round(totalResolutionTimeMs / disputesWithResolutionTime / 1000 / 60 / 60)
      : 0

    res.status(200).json({
      success: true,
      data: {
        disputesByStatus,
        disputesByType,
        disputesByMonth: formattedDisputesByMonth,
        avgResolutionTimeHours,
        totalDisputes: await Dispute.countDocuments(),
        openDisputes: await Dispute.countDocuments({ status: "open" }),
        resolvedDisputes: await Dispute.countDocuments({ status: "resolved" }),
      },
    })
  } catch (error) {
    console.error("Error getting dispute stats:", error)
    res.status(500).json({
      success: false,
      message: "Error getting dispute statistics",
      error: error.message,
    })
  }
}