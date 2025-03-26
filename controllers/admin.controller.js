const User = require("../models/user.model")
const Service = require("../models/service.model")
const Booking = require("../models/booking.model")
const Review = require("../models/review.model")
const Category = require("../models/category.model")
const Transaction = require("../models/transaction.model")
const mongoose = require("mongoose")

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get user counts
    const totalUsers = await User.countDocuments()
    const totalProviders = await User.countDocuments({ role: "provider" })
    const totalCustomers = await User.countDocuments({ role: "customer" })
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    })

    // Get service counts
    const totalServices = await Service.countDocuments()
    const featuredServices = await Service.countDocuments({ featured: true })
    const newServicesToday = await Service.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    })

    // Get booking counts
    const totalBookings = await Booking.countDocuments()
    const pendingBookings = await Booking.countDocuments({ status: "pending" })
    const confirmedBookings = await Booking.countDocuments({ status: "confirmed" })
    const completedBookings = await Booking.countDocuments({ status: "completed" })
    const cancelledBookings = await Booking.countDocuments({ status: "cancelled" })
    const bookingsToday = await Booking.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    })

    // Get revenue statistics
    const completedBookingsData = await Booking.find({ status: "completed" })
    const totalRevenue = completedBookingsData.reduce((sum, booking) => sum + booking.totalAmount, 0)

    // Get top categories
    const topCategories = await Service.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: "$category._id",
          name: "$category.name",
          count: 1,
        },
      },
    ])

    // Get recent activities
    const recentActivities = await Promise.all([
      User.find().sort("-createdAt").limit(5).select("name email role createdAt"),
      Service.find().sort("-createdAt").limit(5).populate("provider", "name").select("title price createdAt"),
      Booking.find()
        .sort("-createdAt")
        .limit(5)
        .populate("customer", "name")
        .populate("service", "title")
        .select("status totalAmount createdAt"),
    ])

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          providers: totalProviders,
          customers: totalCustomers,
          newToday: newUsersToday,
        },
        services: {
          total: totalServices,
          featured: featuredServices,
          newToday: newServicesToday,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          today: bookingsToday,
        },
        revenue: {
          total: totalRevenue,
        },
        topCategories,
        recentActivities: {
          users: recentActivities[0],
          services: recentActivities[1],
          bookings: recentActivities[2],
        },
      },
    })
  } catch (error) {
    console.error("Error getting dashboard stats:", error)
    res.status(500).json({
      success: false,
      message: "Error getting dashboard statistics",
      error: error.message,
    })
  }
}

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    // Get user counts by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ])

    // Get user counts by department
    const usersByDepartment = await User.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ])

    // Get user counts by year of study
    const usersByYearOfStudy = await User.aggregate([
      {
        $group: {
          _id: "$yearOfStudy",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    // Get user registration over time
    const userRegistrationByMonth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ])

    // Format user registration data
    const formattedUserRegistration = userRegistrationByMonth.map((item) => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
      count: item.count,
    }))

    res.status(200).json({
      success: true,
      data: {
        usersByRole,
        usersByDepartment,
        usersByYearOfStudy,
        userRegistration: formattedUserRegistration,
      },
    })
  } catch (error) {
    console.error("Error getting user stats:", error)
    res.status(500).json({
      success: false,
      message: "Error getting user statistics",
      error: error.message,
    })
  }
}

// Get service statistics
exports.getServiceStats = async (req, res) => {
  try {
    // Get service counts by category
    const servicesByCategory = await Service.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: "$category._id",
          name: "$category.name",
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ])

    // Get average service price by category
    const avgPriceByCategory = await Service.aggregate([
      {
        $group: {
          _id: "$category",
          avgPrice: { $avg: "$price" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: "$category._id",
          name: "$category.name",
          avgPrice: 1,
        },
      },
      {
        $sort: { avgPrice: -1 },
      },
    ])

    // Get service creation over time
    const serviceCreationByMonth = await Service.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ])

    // Format service creation data
    const formattedServiceCreation = serviceCreationByMonth.map((item) => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
      count: item.count,
    }))

    res.status(200).json({
      success: true,
      data: {
        servicesByCategory,
        avgPriceByCategory,
        serviceCreation: formattedServiceCreation,
      },
    })
  } catch (error) {
    console.error("Error getting service stats:", error)
    res.status(500).json({
      success: false,
      message: "Error getting service statistics",
      error: error.message,
    })
  }
}

// Get booking statistics
exports.getBookingStats = async (req, res) => {
  try {
    // Get booking counts by status
    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // Get booking counts by month
    const bookingsByMonth = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0],
            },
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ])

    // Format booking data
    const formattedBookingsByMonth = bookingsByMonth.map((item) => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
      bookings: item.count,
      revenue: item.revenue,
    }))

    // Get top booked services
    const topBookedServices = await Booking.aggregate([
      {
        $group: {
          _id: "$service",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "service",
        },
      },
      {
        $unwind: "$service",
      },
      {
        $project: {
          _id: "$service._id",
          title: "$service.title",
          price: "$service.price",
          count: 1,
        },
      },
    ])

    res.status(200).json({
      success: true,
      data: {
        bookingsByStatus,
        bookingsByMonth: formattedBookingsByMonth,
        topBookedServices,
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

// Get revenue statistics
exports.getRevenueStats = async (req, res) => {
  try {
    // Get total revenue
    const completedBookings = await Booking.find({ status: "completed" })
    const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)

    // Get revenue by month
    const revenueByMonth = await Booking.aggregate([
      {
        $match: { status: "completed" },
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

    // Format revenue data
    const formattedRevenueByMonth = revenueByMonth.map((item) => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
      revenue: item.revenue,
      bookings: item.count,
    }))

    // Get revenue by category
    const revenueByCategory = await Booking.aggregate([
      {
        $match: { status: "completed" },
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
        $group: {
          _id: "$service.category",
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: "$category._id",
          name: "$category.name",
          revenue: 1,
          count: 1,
        },
      },
      {
        $sort: { revenue: -1 },
      },
    ])

    // Get top earning providers
    const topEarningProviders = await Booking.aggregate([
      {
        $match: { status: "completed" },
      },
      {
        $group: {
          _id: "$provider",
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { revenue: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "provider",
        },
      },
      {
        $unwind: "$provider",
      },
      {
        $project: {
          _id: "$provider._id",
          name: "$provider.name",
          email: "$provider.email",
          image: "$provider.image",
          revenue: 1,
          bookings: "$count",
        },
      },
    ])

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        revenueByMonth: formattedRevenueByMonth,
        revenueByCategory,
        topEarningProviders,
      },
    })
  } catch (error) {
    console.error("Error getting revenue stats:", error)
    res.status(500).json({
      success: false,
      message: "Error getting revenue statistics",
      error: error.message,
    })
  }
}

// Get all users (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object
    const filter = {}

    if (req.query.role) {
      filter.role = req.query.role
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ]
    }

    // Execute query with pagination
    const users = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort(req.query.sort || "-createdAt")

    // Get total count for pagination
    const total = await User.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: users,
    })
  } catch (error) {
    console.error("Error getting users:", error)
    res.status(500).json({
      success: false,
      message: "Error getting users",
      error: error.message,
    })
  }
}

// Update user role (admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body

    // Validate role
    const validRoles = ["customer", "provider", "admin"]
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
        validRoles,
      })
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true, runValidators: true },
    ).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: user,
      message: `User role updated to ${role} successfully`,
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    res.status(500).json({
      success: false,
      message: "Error updating user role",
      error: error.message,
    })
  }
}

// Delete user (admin)
exports.deleteUser = async (req, res) => {
  try {
    // Start a session for transaction
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Delete user
      const user = await User.findByIdAndDelete(req.params.id).session(session)

      if (!user) {
        await session.abortTransaction()
        session.endSession()
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      // Delete user's services
      await Service.deleteMany({ provider: req.params.id }).session(session)

      // Delete user's bookings
      await Booking.deleteMany({
        $or: [{ customer: req.params.id }, { provider: req.params.id }],
      }).session(session)

      // Delete user's reviews
      await Review.deleteMany({
        $or: [{ reviewer: req.params.id }, { serviceProvider: req.params.id }],
      }).session(session)

      // Commit transaction
      await session.commitTransaction()
      session.endSession()

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      })
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction()
      session.endSession()
      throw error
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    })
  }
}

// Get all services (admin)
exports.getAllServices = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object
    const filter = {}

    if (req.query.category) {
      filter.category = req.query.category
    }

    if (req.query.provider) {
      filter.provider = req.query.provider
    }

    if (req.query.featured === "true") {
      filter.featured = true
    }

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ]
    }

    // Execute query with pagination
    const services = await Service.find(filter)
      .populate("provider", "name email image")
      .populate("category", "name")
      .skip(skip)
      .limit(limit)
      .sort(req.query.sort || "-createdAt")

    // Get total count for pagination
    const total = await Service.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: services,
    })
  } catch (error) {
    console.error("Error getting services:", error)
    res.status(500).json({
      success: false,
      message: "Error getting services",
      error: error.message,
    })
  }
}

// Get all bookings (admin)
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

    if (req.query.customer) {
      filter.customer = req.query.customer
    }

    if (req.query.provider) {
      filter.provider = req.query.provider
    }

    // Execute query with pagination
    const bookings = await Booking.find(filter)
      .populate("service", "title price")
      .populate("customer", "name email image")
      .populate("provider", "name email image")
      .skip(skip)
      .limit(limit)
      .sort(req.query.sort || "-createdAt")

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

// Generate reports
exports.generateReport = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Report type is required",
      })
    }

    let report = {}
    const dateFilter = {}

    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    switch (type) {
      case "users":
        report = await generateUserReport(dateFilter)
        break
      case "services":
        report = await generateServiceReport(dateFilter)
        break
      case "bookings":
        report = await generateBookingReport(dateFilter)
        break
      case "revenue":
        report = await generateRevenueReport(dateFilter)
        break
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid report type",
          validTypes: ["users", "services", "bookings", "revenue"],
        })
    }

    res.status(200).json({
      success: true,
      reportType: type,
      dateRange: {
        startDate: startDate || "All time",
        endDate: endDate || "All time",
      },
      data: report,
    })
  } catch (error) {
    console.error("Error generating report:", error)
    res.status(500).json({
      success: false,
      message: "Error generating report",
      error: error.message,
    })
  }
}

// Helper function to generate user report
async function generateUserReport(dateFilter) {
  // Get user counts
  const totalUsers = await User.countDocuments(dateFilter)
  const usersByRole = await User.aggregate([
    {
      $match: dateFilter,
    },
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ])

  // Get user registration over time
  const userRegistrationByMonth = await User.aggregate([
    {
      $match: dateFilter,
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ])

  // Format user registration data
  const formattedUserRegistration = userRegistrationByMonth.map((item) => ({
    date: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
    count: item.count,
  }))

  // Get user counts by department
  const usersByDepartment = await User.aggregate([
    {
      $match: dateFilter,
    },
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ])

  return {
    totalUsers,
    usersByRole,
    userRegistration: formattedUserRegistration,
    usersByDepartment,
  }
}

// Helper function to generate service report
async function generateServiceReport(dateFilter) {
  // Get service counts
  const totalServices = await Service.countDocuments(dateFilter)

  // Get services by category
  const servicesByCategory = await Service.aggregate([
    {
      $match: dateFilter,
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $project: {
        _id: "$category._id",
        name: "$category.name",
        count: 1,
      },
    },
    {
      $sort: { count: -1 },
    },
  ])

  // Get service creation over time
  const serviceCreationByMonth = await Service.aggregate([
    {
      $match: dateFilter,
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ])

  // Format service creation data
  const formattedServiceCreation = serviceCreationByMonth.map((item) => ({
    date: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
    count: item.count,
  }))

  return {
    totalServices,
    servicesByCategory,
    serviceCreation: formattedServiceCreation,
  }
}

// Helper function to generate booking report
async function generateBookingReport(dateFilter) {
  // Get booking counts
  const totalBookings = await Booking.countDocuments(dateFilter)

  // Get bookings by status
  const bookingsByStatus = await Booking.aggregate([
    {
      $match: dateFilter,
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ])

  // Get bookings over time
  const bookingsByMonth = await Booking.aggregate([
    {
      $match: dateFilter,
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ])

  // Format booking data
  const formattedBookingsByMonth = bookingsByMonth.map((item) => ({
    date: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
    count: item.count,
  }))

  return {
    totalBookings,
    bookingsByStatus,
    bookingsByMonth: formattedBookingsByMonth,
  }
}

// Helper function to generate revenue report
async function generateRevenueReport(dateFilter) {
  // Add status filter for completed bookings
  const filter = { ...dateFilter, status: "completed" }

  // Get total revenue
  const completedBookings = await Booking.find(filter)
  const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)

  // Get revenue by month
  const revenueByMonth = await Booking.aggregate([
    {
      $match: filter,
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

  // Format revenue data
  const formattedRevenueByMonth = revenueByMonth.map((item) => ({
    date: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
    revenue: item.revenue,
    bookings: item.count,
  }))

  // Get revenue by category
  const revenueByCategory = await Booking.aggregate([
    {
      $match: filter,
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
      $group: {
        _id: "$service.category",
        revenue: { $sum: "$totalAmount" },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $project: {
        _id: "$category._id",
        name: "$category.name",
        revenue: 1,
        count: 1,
      },
    },
    {
      $sort: { revenue: -1 },
    },
  ])

  return {
    totalRevenue,
    revenueByMonth: formattedRevenueByMonth,
    revenueByCategory,
  }
}

