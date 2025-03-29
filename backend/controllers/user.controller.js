const User = require("../models/user.model")
const Service = require("../models/service.model")
const Booking = require("../models/booking.model")
const Review = require("../models/review.model")
const mongoose = require("mongoose")

// Get all users (with pagination and filtering)
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
    const users = await User.find(filter).select("-password").skip(skip).limit(limit).sort({ createdAt: -1 })

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

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("skills")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Error getting user:", error)
    res.status(500).json({
      success: false,
      message: "Error getting user",
      error: error.message,
    })
  }
}

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate("skills")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Error getting current user:", error)
    res.status(500).json({
      success: false,
      message: "Error getting current user",
      error: error.message,
    })
  }
}

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    // Fields that users are allowed to update
    const allowedUpdates = {
      name: req.body.name,
      phone: req.body.phone,
      bio: req.body.bio,
      department: req.body.department,
      yearOfStudy: req.body.yearOfStudy,
      skills: req.body.skills,
      education: req.body.education,
      certifications: req.body.certifications,
      socialLinks: req.body.socialLinks,
      image: req.body.image,
    }
    
    // Special case: Allow users to upgrade themselves from USER to PROVIDER
    if (req.body.role === "PROVIDER") {
      // Get current user to check their role
      const currentUser = await User.findById(req.user.id)
      if (currentUser && currentUser.role === "USER") {
        // Only allow upgrade from USER to PROVIDER, not any other role changes
        allowedUpdates.role = "PROVIDER"
        console.log("User role upgrade to PROVIDER initiated")
      }
    }

    // Remove undefined fields
    Object.keys(allowedUpdates).forEach((key) => allowedUpdates[key] === undefined && delete allowedUpdates[key])

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: allowedUpdates },
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
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    })
  }
}

// Delete user account
exports.deleteUser = async (req, res) => {
  try {
    // Start a session for transaction
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Delete user
      const user = await User.findByIdAndDelete(req.user.id).session(session)

      if (!user) {
        await session.abortTransaction()
        session.endSession()
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      // Delete user's services
      await Service.deleteMany({ provider: req.user.id }).session(session)

      // Delete user's bookings
      await Booking.deleteMany({
        $or: [{ customer: req.user.id }, { provider: req.user.id }],
      }).session(session)

      // Delete user's reviews
      await Review.deleteMany({
        $or: [{ reviewer: req.user.id }, { serviceProvider: req.user.id }],
      }).session(session)

      // Commit transaction
      await session.commitTransaction()
      session.endSession()

      res.status(200).json({
        success: true,
        message: "User account deleted successfully",
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

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id

    // Get services count
    const servicesCount = await Service.countDocuments({ provider: userId })

    // Get bookings count
    const bookingsAsProvider = await Booking.countDocuments({ provider: userId })
    const bookingsAsCustomer = await Booking.countDocuments({ customer: userId })

    // Get reviews count and average rating
    const reviewsReceived = await Review.find({ serviceProvider: userId })
    const reviewsCount = reviewsReceived.length
    const totalRating = reviewsReceived.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviewsCount > 0 ? (totalRating / reviewsCount).toFixed(1) : 0

    // Get earnings (sum of completed bookings)
    const completedBookings = await Booking.find({
      provider: userId,
      status: "completed",
    })

    const totalEarnings = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)

    res.status(200).json({
      success: true,
      data: {
        servicesCount,
        bookingsAsProvider,
        bookingsAsCustomer,
        totalBookings: bookingsAsProvider + bookingsAsCustomer,
        reviewsCount,
        averageRating,
        totalEarnings,
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

// Get service providers (for featured providers)
exports.getServiceProviders = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Find users who are service providers and have services
    const providers = await User.aggregate([
      {
        $match: { role: "PROVIDER" },
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "provider",
          as: "services",
        },
      },
      {
        $match: { "services.0": { $exists: true } },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "serviceProvider",
          as: "reviews",
        },
      },
      {
        $addFields: {
          servicesCount: { $size: "$services" },
          reviewsCount: { $size: "$reviews" },
          averageRating: {
            $cond: [{ $eq: [{ $size: "$reviews" }, 0] }, 0, { $avg: "$reviews.rating" }],
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          bio: 1,
          department: 1,
          yearOfStudy: 1,
          image: 1,
          servicesCount: 1,
          reviewsCount: 1,
          averageRating: 1,
          createdAt: 1,
        },
      },
      { $sort: { averageRating: -1, reviewsCount: -1 } },
      { $skip: skip },
      { $limit: limit },
    ])

    // Get total count
    const total = await User.countDocuments({
      role: "PROVIDER",
      // Only count providers who have services
      $expr: {
        $gt: [{ $size: { $ifNull: ["$services", []] } }, 0],
      },
    })

    res.status(200).json({
      success: true,
      count: providers.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: providers,
    })
  } catch (error) {
    console.error("Error getting service providers:", error)
    res.status(500).json({
      success: false,
      message: "Error getting service providers",
      error: error.message,
    })
  }
}

// === ADD THIS NEW METHOD AT THE BOTTOM OF THE FILE ===
exports.getRecentActivities = async (req, res) => {
  try {
    const recentBookings = await Booking.find({
      $or: [{ customer: req.user.id }, { provider: req.user.id }]
    })
      .sort("-createdAt")
      .limit(5)
      .populate("service", "title")
      .populate("customer", "name")
      .populate("provider", "name");

    const recentServices = await Service.find({ provider: req.user.id })
      .sort("-createdAt")
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        bookings: recentBookings,
        services: recentServices,
        // Add other activity types if needed
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent activities",
      error: error.message
    });
  }
};

// Add a new method specifically for dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id

    // Get services count
    const servicesCount = await Service.countDocuments({ provider: userId })

    // Get bookings count
    const bookingsAsProvider = await Booking.countDocuments({ provider: userId })
    const bookingsAsCustomer = await Booking.countDocuments({ customer: userId })

    // Get reviews count and average rating
    const reviewsReceived = await Review.find({ serviceProvider: userId })
    const reviewsCount = reviewsReceived.length
    const totalRating = reviewsReceived.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviewsCount > 0 ? (totalRating / reviewsCount).toFixed(1) : 0

    // Get earnings (sum of completed bookings)
    const completedBookings = await Booking.find({
      provider: userId,
      status: "completed",
    })

    const totalEarnings = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)

    res.status(200).json({
      success: true,
      data: {
        servicesCount,
        bookingsAsProvider,
        bookingsAsCustomer,
        totalBookings: bookingsAsProvider + bookingsAsCustomer,
        reviewsCount,
        averageRating,
        totalEarnings,
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

// Get user reports for dashboard
exports.getUserReports = async (req, res) => {
  try {
    const userId = req.user.id
    const { type = 'bookings', period = 'month' } = req.query

    // Calculate date range based on period
    const endDate = new Date()
    let startDate = new Date()

    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date(0) // Beginning of time
        break
      default:
        startDate.setMonth(endDate.getMonth() - 1) // Default to month
    }

    let result = {
      success: true,
      data: {}
    }

    // Bookings report
    if (type === 'bookings') {
      // Get all user bookings in date range (as provider or customer)
      const bookings = await Booking.find({
        $or: [{ provider: userId }, { customer: userId }],
        createdAt: { $gte: startDate, $lte: endDate }
      })
        .populate('service', 'title price')
        .populate('customer', 'name')
        .populate('provider', 'name')
        .sort('-createdAt')

      // Calculate statistics
      const totalCount = bookings.length
      const completedCount = bookings.filter(b => b.status === 'completed').length
      const pendingCount = bookings.filter(b => b.status === 'pending').length
      const cancelledCount = bookings.filter(b => b.status === 'cancelled').length
      const completionRate = totalCount > 0 ? completedCount / totalCount : 0

      result.data = {
        totalCount,
        completedCount,
        pendingCount,
        cancelledCount,
        completionRate,
        bookings: bookings.map(booking => ({
          id: booking._id,
          date: booking.createdAt,
          service: booking.service?.title || 'Unknown Service',
          status: booking.status,
          customer: booking.customer?.name || 'Unknown User',
          provider: booking.provider?.name || 'Unknown Provider',
          amount: booking.totalAmount
        }))
      }
    }
    // Services report
    else if (type === 'services') {
      // Get all user services
      const services = await Service.find({
        provider: userId,
        createdAt: { $gte: startDate, $lte: endDate }
      })
        .populate('category', 'name')
        .sort('-createdAt')

      // Calculate statistics
      const totalCount = services.length
      const activeCount = services.filter(s => s.status === 'active').length
      const inactiveCount = services.filter(s => s.status === 'inactive').length
      const pendingCount = services.filter(s => s.status === 'pending').length

      // Calculate view count (if view tracking is implemented)
      const viewCount = services.reduce((sum, service) => sum + (service.viewCount || 0), 0)

      // Find most popular service
      let mostPopular = null
      if (services.length > 0) {
        mostPopular = services.reduce((prev, current) => {
          return (prev.viewCount || 0) > (current.viewCount || 0) ? prev : current
        })
      }

      result.data = {
        totalCount,
        activeCount,
        inactiveCount,
        pendingCount,
        viewCount,
        mostPopular: mostPopular ? {
          id: mostPopular._id,
          title: mostPopular.title,
          viewCount: mostPopular.viewCount || 0
        } : null,
        services: services.map(service => ({
          id: service._id,
          date: service.createdAt,
          title: service.title,
          status: service.status,
          category: service.category?.name || 'Uncategorized',
          price: service.price,
          viewCount: service.viewCount || 0
        }))
      }
    }
    // Earnings report
    else if (type === 'earnings') {
      // Get completed bookings
      const completedBookings = await Booking.find({
        provider: userId,
        status: 'completed',
        createdAt: { $gte: startDate, $lte: endDate }
      })
        .populate('service', 'title')
        .sort('-createdAt')

      // Calculate statistics
      const totalEarnings = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
      const transactionCount = completedBookings.length
      const averageEarning = transactionCount > 0 ? totalEarnings / transactionCount : 0

      // Group by month to find best month
      const earningsByMonth = completedBookings.reduce((acc, booking) => {
        const month = new Date(booking.createdAt).toLocaleString('default', { month: 'long' })
        if (!acc[month]) {
          acc[month] = 0
        }
        acc[month] += booking.totalAmount
        return acc
      }, {})

      let bestMonth = null
      let bestMonthAmount = 0
      
      for (const [month, amount] of Object.entries(earningsByMonth)) {
        if (amount > bestMonthAmount) {
          bestMonth = month
          bestMonthAmount = amount
        }
      }

      result.data = {
        totalEarnings,
        transactionCount,
        averageEarning,
        bestMonth: bestMonth ? { month: bestMonth, amount: bestMonthAmount } : null,
        transactions: completedBookings.map(booking => ({
          id: booking._id,
          date: booking.createdAt,
          service: booking.service?.title || 'Unknown Service',
          amount: booking.totalAmount,
          customer: booking.customer?.name || 'Unknown User'
        }))
      }
    }
    // Reviews report
    else if (type === 'reviews') {
      // Get reviews received by the user (as service provider)
      const reviews = await Review.find({
        serviceProvider: userId,
        createdAt: { $gte: startDate, $lte: endDate }
      })
        .populate('reviewer', 'name')
        .populate('service', 'title')
        .sort('-createdAt')

      // Calculate statistics
      const totalCount = reviews.length
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalCount > 0 ? totalRating / totalCount : 0
      const positiveCount = reviews.filter(review => review.rating >= 4).length
      const neutralCount = reviews.filter(review => review.rating === 3).length
      const negativeCount = reviews.filter(review => review.rating < 3).length

      result.data = {
        totalCount,
        averageRating,
        positiveCount,
        neutralCount,
        negativeCount,
        reviews: reviews.map(review => ({
          id: review._id,
          date: review.createdAt,
          service: review.service?.title || 'Unknown Service',
          rating: review.rating,
          comment: review.comment,
          reviewer: review.reviewer?.name || 'Anonymous User'
        }))
      }
    }

    res.status(200).json(result)
  } catch (error) {
    console.error("Error getting user reports:", error)
    res.status(500).json({
      success: false,
      message: "Error getting user reports",
      error: error.message,
    })
  }
}