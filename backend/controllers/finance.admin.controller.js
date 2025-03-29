const Transaction = require("../models/transaction.model")
const Booking = require("../models/booking.model")
const Service = require("../models/service.model")
const Category = require("../models/category.model")
const User = require("../models/user.model")
const mongoose = require("mongoose")

// Get revenue by category
exports.getRevenueByCategory = async (req, res) => {
  try {
    // Set default date range to last 30 days if not provided
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date()
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000) // Default to last 30 days

    // Get revenue by category
    const revenueByCategory = await Booking.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "service",
        },
      },
      {
        $unwind: "$service",
      },
      {
        $lookup: {
          from: "categories",
          localField: "service.category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.name" },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { revenue: -1 },
      },
    ])

    // Get total revenue for the period
    const totalRevenue = revenueByCategory.reduce((sum, category) => sum + category.revenue, 0)

    // Calculate percentage for each category
    const formattedRevenueByCategory = revenueByCategory.map((category) => ({
      categoryId: category._id,
      categoryName: category.categoryName,
      revenue: category.revenue,
      count: category.count,
      percentage: totalRevenue > 0 ? Math.round((category.revenue / totalRevenue) * 100) : 0,
    }))

    res.status(200).json({
      success: true,
      dateRange: {
        startDate,
        endDate,
      },
      totalRevenue,
      data: formattedRevenueByCategory,
    })
  } catch (error) {
    console.error("Error getting revenue by category:", error)
    res.status(500).json({
      success: false,
      message: "Error getting revenue by category",
      error: error.message,
    })
  }
}

// Get revenue by month
exports.getRevenueByMonth = async (req, res) => {
  try {
    // Get last 12 months by default, or custom range if provided
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date()
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1) // Default to 1 year ago

    // Get revenue by month
    const revenueByMonth = await Booking.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ])

    // Format the results
    const formattedRevenueByMonth = revenueByMonth.map((item) => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
      revenue: item.revenue,
      bookings: item.count,
    }))

    // Calculate growth metrics
    let totalRevenue = 0
    let previousMonthRevenue = 0
    let currentMonthRevenue = 0

    if (formattedRevenueByMonth.length > 0) {
      totalRevenue = formattedRevenueByMonth.reduce((sum, month) => sum + month.revenue, 0)
      
      if (formattedRevenueByMonth.length > 1) {
        previousMonthRevenue = formattedRevenueByMonth[formattedRevenueByMonth.length - 2].revenue
        currentMonthRevenue = formattedRevenueByMonth[formattedRevenueByMonth.length - 1].revenue
      } else {
        currentMonthRevenue = formattedRevenueByMonth[0].revenue
      }
    }

    const monthlyGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0

    res.status(200).json({
      success: true,
      dateRange: {
        startDate,
        endDate,
      },
      totalRevenue,
      monthlyGrowth: parseFloat(monthlyGrowth.toFixed(2)),
      data: formattedRevenueByMonth,
    })
  } catch (error) {
    console.error("Error getting revenue by month:", error)
    res.status(500).json({
      success: false,
      message: "Error getting revenue by month",
      error: error.message,
    })
  }
}

// Get escrow payments
exports.getEscrowPayments = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Get bookings in escrow (completed but payment not released)
    const escrowBookings = await Booking.find({ 
      status: "completed", 
      paymentStatus: "in_escrow" 
    })
      .populate("service", "title price")
      .populate("customer", "name email image")
      .populate("provider", "name email image")
      .skip(skip)
      .limit(limit)
      .sort(req.query.sort || "-updatedAt")

    // Get total count for pagination
    const total = await Booking.countDocuments({ 
      status: "completed", 
      paymentStatus: "in_escrow" 
    })

    // Calculate total escrow amount
    const totalEscrowAmount = escrowBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)

    res.status(200).json({
      success: true,
      count: escrowBookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalEscrowAmount,
      data: escrowBookings,
    })
  } catch (error) {
    console.error("Error getting escrow payments:", error)
    res.status(500).json({
      success: false,
      message: "Error getting escrow payments",
      error: error.message,
    })
  }
}

// Release payment from escrow
exports.releasePayment = async (req, res) => {
  try {
    const { bookingId } = req.params

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate("service", "title")
      .populate("customer", "name email")
      .populate("provider", "name email")

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Check if booking is in escrow
    if (booking.status !== "completed" || booking.paymentStatus !== "in_escrow") {
      return res.status(400).json({
        success: false,
        message: "Payment is not in escrow or booking is not completed",
      })
    }

    // Start a session for transaction
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Update booking payment status
      booking.paymentStatus = "released"
      await booking.save({ session })

      // Create transaction record
      const transaction = await Transaction.create(
        [
          {
            booking: booking._id,
            service: booking.service._id,
            customer: booking.customer._id,
            provider: booking.provider._id,
            amount: booking.totalAmount,
            paymentMethod: booking.paymentMethod,
            type: "payment_release",
            status: "completed",
            description: `Released payment for booking #${booking._id}`,
            processedBy: req.user.id,
          },
        ],
        { session }
      )

      // Commit the transaction
      await session.commitTransaction()
      session.endSession()

      res.status(200).json({
        success: true,
        data: {
          booking,
          transaction: transaction[0],
        },
        message: "Payment released successfully",
      })
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction()
      session.endSession()
      throw error
    }
  } catch (error) {
    console.error("Error releasing payment:", error)
    res.status(500).json({
      success: false,
      message: "Error releasing payment",
      error: error.message,
    })
  }
}

// Get refund requests
exports.getRefundRequests = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Find bookings with refund requests
    const refundRequests = await Booking.find({ refundRequested: true })
      .populate("service", "title price")
      .populate("customer", "name email image")
      .populate("provider", "name email image")
      .skip(skip)
      .limit(limit)
      .sort(req.query.sort || "-updatedAt")

    // Get total count for pagination
    const total = await Booking.countDocuments({ refundRequested: true })

    // Calculate total refund amount
    const totalRefundAmount = refundRequests.reduce((sum, booking) => sum + booking.totalAmount, 0)

    res.status(200).json({
      success: true,
      count: refundRequests.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalRefundAmount,
      data: refundRequests,
    })
  } catch (error) {
    console.error("Error getting refund requests:", error)
    res.status(500).json({
      success: false,
      message: "Error getting refund requests",
      error: error.message,
    })
  }
}

// Process refund
exports.processRefund = async (req, res) => {
  try {
    const { bookingId } = req.params
    const { approved, reason } = req.body

    if (approved === undefined) {
      return res.status(400).json({
        success: false,
        message: "Refund approval status is required",
      })
    }

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate("service", "title")
      .populate("customer", "name email")
      .populate("provider", "name email")

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Check if booking has a refund request
    if (!booking.refundRequested) {
      return res.status(400).json({
        success: false,
        message: "No refund request found for this booking",
      })
    }

    // Start a session for transaction
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Update booking
      booking.refundRequested = false
      booking.refundProcessed = true
      booking.refundApproved = approved
      booking.refundReason = reason || booking.refundReason
      booking.refundProcessedAt = new Date()
      booking.refundProcessedBy = req.user.id

      if (approved) {
        booking.paymentStatus = "refunded"
        booking.status = "cancelled"
      }

      await booking.save({ session })

      // Create transaction record if refund approved
      let transaction = null
      if (approved) {
        transaction = await Transaction.create(
          [
            {
              booking: booking._id,
              service: booking.service._id,
              customer: booking.customer._id,
              provider: booking.provider._id,
              amount: booking.totalAmount,
              paymentMethod: booking.paymentMethod,
              type: "refund",
              status: "completed",
              description: `Refund for booking #${booking._id}: ${reason || booking.refundReason}`,
              processedBy: req.user.id,
            },
          ],
          { session }
        )
      }

      // Commit the transaction
      await session.commitTransaction()
      session.endSession()

      res.status(200).json({
        success: true,
        data: {
          booking,
          transaction: transaction ? transaction[0] : null,
        },
        message: approved ? "Refund approved and processed" : "Refund declined",
      })
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction()
      session.endSession()
      throw error
    }
  } catch (error) {
    console.error("Error processing refund:", error)
    res.status(500).json({
      success: false,
      message: "Error processing refund",
      error: error.message,
    })
  }
}

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object
    const filter = {}

    if (req.query.type) {
      filter.type = req.query.type
    }

    if (req.query.status) {
      filter.status = req.query.status
    }

    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      }
    }

    // Get transactions
    const transactions = await Transaction.find(filter)
      .populate("booking", "totalAmount status")
      .populate("service", "title")
      .populate("customer", "name email image")
      .populate("provider", "name email image")
      .populate("processedBy", "name")
      .skip(skip)
      .limit(limit)
      .sort(req.query.sort || "-createdAt")

    // Get total count for pagination
    const total = await Transaction.countDocuments(filter)

    // Get transaction count by type
    const typeCounts = await Transaction.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ])

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      typeCounts,
      data: transactions,
    })
  } catch (error) {
    console.error("Error getting transaction history:", error)
    res.status(500).json({
      success: false,
      message: "Error getting transaction history",
      error: error.message,
    })
  }
}