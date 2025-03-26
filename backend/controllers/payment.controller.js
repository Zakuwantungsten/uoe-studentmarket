const Transaction = require("../models/transaction.model")
const Booking = require("../models/booking.model")
const User = require("../models/user.model")
const Service = require("../models/service.model")

// Process payment
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, transactionDetails } = req.body

    // Check if booking exists
    const booking = await Booking.findById(bookingId).populate("service").populate("customer").populate("provider")

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Check if user is authorized to make payment
    if (booking.customer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to make payment for this booking",
      })
    }

    // Check if booking is already paid
    if (booking.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Booking is already paid",
      })
    }

    // Create transaction
    const transaction = await Transaction.create({
      booking: bookingId,
      customer: req.user.id,
      provider: booking.provider._id,
      amount: booking.totalAmount,
      paymentMethod,
      status: "completed",
      details: transactionDetails,
    })

    // Update booking
    booking.isPaid = true
    booking.paidAt = Date.now()
    booking.transaction = transaction._id
    booking.status = "confirmed"
    await booking.save()

    res.status(200).json({
      success: true,
      data: {
        transaction,
        booking,
      },
      message: "Payment processed successfully",
    })
  } catch (error) {
    console.error("Error processing payment:", error)
    res.status(500).json({
      success: false,
      message: "Error processing payment",
      error: error.message,
    })
  }
}

// Get transaction by ID
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("booking")
      .populate("customer", "name email image")
      .populate("provider", "name email image")

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      })
    }

    // Check if user is authorized to view this transaction
    if (
      transaction.customer._id.toString() !== req.user.id &&
      transaction.provider._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this transaction",
      })
    }

    res.status(200).json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    console.error("Error getting transaction:", error)
    res.status(500).json({
      success: false,
      message: "Error getting transaction",
      error: error.message,
    })
  }
}

// Get my transactions
exports.getMyTransactions = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object
    const filter = {
      $or: [{ customer: req.user.id }, { provider: req.user.id }],
    }

    if (req.query.status) {
      filter.status = req.query.status
    }

    // Execute query with pagination
    const transactions = await Transaction.find(filter)
      .populate("booking")
      .populate("customer", "name image")
      .populate("provider", "name image")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt")

    // Get total count for pagination
    const total = await Transaction.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: transactions,
    })
  } catch (error) {
    console.error("Error getting my transactions:", error)
    res.status(500).json({
      success: false,
      message: "Error getting my transactions",
      error: error.message,
    })
  }
}

// Get all transactions (admin only)
exports.getAllTransactions = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object
    const filter = {}

    if (req.query.status) {
      filter.status = req.query.status
    }

    if (req.query.paymentMethod) {
      filter.paymentMethod = req.query.paymentMethod
    }

    // Execute query with pagination
    const transactions = await Transaction.find(filter)
      .populate("booking")
      .populate("customer", "name email image")
      .populate("provider", "name email image")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt")

    // Get total count for pagination
    const total = await Transaction.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: transactions,
    })
  } catch (error) {
    console.error("Error getting transactions:", error)
    res.status(500).json({
      success: false,
      message: "Error getting transactions",
      error: error.message,
    })
  }
}

// Process M-Pesa payment
exports.processMpesaPayment = async (req, res) => {
  try {
    const { bookingId, phoneNumber } = req.body

    // Check if booking exists
    const booking = await Booking.findById(bookingId).populate("service").populate("customer").populate("provider")

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Check if user is authorized to make payment
    if (booking.customer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to make payment for this booking",
      })
    }

    // Check if booking is already paid
    if (booking.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Booking is already paid",
      })
    }

    // In a real implementation, you would integrate with M-Pesa API here
    // For now, we'll simulate a successful payment

    // Create transaction
    const transaction = await Transaction.create({
      booking: bookingId,
      customer: req.user.id,
      provider: booking.provider._id,
      amount: booking.totalAmount,
      paymentMethod: "mpesa",
      status: "pending",
      details: {
        phoneNumber,
        mpesaReference: `MP-${Math.floor(Math.random() * 1000000)}`,
      },
    })

    res.status(200).json({
      success: true,
      data: {
        transaction,
        message: "M-Pesa payment initiated. Please complete the payment on your phone.",
      },
    })
  } catch (error) {
    console.error("Error processing M-Pesa payment:", error)
    res.status(500).json({
      success: false,
      message: "Error processing M-Pesa payment",
      error: error.message,
    })
  }
}

// M-Pesa callback
exports.mpesaCallback = async (req, res) => {
  try {
    // In a real implementation, this would handle the callback from M-Pesa
    const { transactionId, status, mpesaReceiptNumber } = req.body

    // Find transaction
    const transaction = await Transaction.findById(transactionId)

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      })
    }

    // Update transaction
    transaction.status = status
    transaction.details.mpesaReceiptNumber = mpesaReceiptNumber
    await transaction.save()

    // If payment is successful, update booking
    if (status === "completed") {
      const booking = await Booking.findById(transaction.booking)

      if (booking) {
        booking.isPaid = true
        booking.paidAt = Date.now()
        booking.status = "confirmed"
        await booking.save()
      }
    }

    res.status(200).json({
      success: true,
      message: "M-Pesa callback processed successfully",
    })
  } catch (error) {
    console.error("Error processing M-Pesa callback:", error)
    res.status(500).json({
      success: false,
      message: "Error processing M-Pesa callback",
      error: error.message,
    })
  }
}

