const Service = require("../models/service.model")
const Category = require("../models/category.model")
const User = require("../models/user.model")
const Review = require("../models/review.model")
const mongoose = require("mongoose")

// Create a new service
exports.createService = async (req, res) => {
  try {
    // Check if category exists
    const category = await Category.findById(req.body.category)
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    // Create service
    const service = await Service.create({
      ...req.body,
      provider: req.user.id,
    })

    // Populate provider and category
    await service.populate("provider", "name email image")
    await service.populate("category", "name")

    res.status(201).json({
      success: true,
      data: service,
      message: "Service created successfully",
    })
  } catch (error) {
    console.error("Error creating service:", error)
    res.status(500).json({
      success: false,
      message: "Error creating service",
      error: error.message,
    })
  }
}

// Get all services (with pagination and filtering)
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

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {}
      if (req.query.minPrice) {
        filter.price.$gte = Number.parseFloat(req.query.minPrice)
      }
      if (req.query.maxPrice) {
        filter.price.$lte = Number.parseFloat(req.query.maxPrice)
      }
    }

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ]
    }

    // Handle sorting
    let sortOption = "-createdAt"; // Default sort by newest
    
    if (req.query.sort) {
      switch(req.query.sort) {
        case "price-low":
          sortOption = "price"; // Ascending price
          break;
        case "price-high":
          sortOption = "-price"; // Descending price
          break;
        case "newest":
          sortOption = "-createdAt"; // Descending creation date
          break;
        case "rating":
          sortOption = "-averageRating"; // Descending rating
          break;
        default:
          sortOption = req.query.sort;
      }
    }

    // Execute query with pagination
    const services = await Service.find(filter)
      .populate("provider", "name email image")
      .populate("category", "name")
      .skip(skip)
      .limit(limit)
      .sort(sortOption)

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

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("provider", "name email phone bio image department yearOfStudy")
      .populate("category", "name")

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      })
    }

    // Get reviews for this service
    const reviews = await Review.find({ service: req.params.id }).populate("reviewer", "name image").sort("-createdAt")

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0

    res.status(200).json({
      success: true,
      data: {
        ...service.toObject(),
        reviews,
        reviewsCount: reviews.length,
        averageRating,
      },
    })
  } catch (error) {
    console.error("Error getting service:", error)
    res.status(500).json({
      success: false,
      message: "Error getting service",
      error: error.message,
    })
  }
}

// Update service
exports.updateService = async (req, res) => {
  try {
    // Find service
    let service = await Service.findById(req.params.id)

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      })
    }

    // Check if user is the service provider
    if (service.provider.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this service",
      })
    }

    // If category is being updated, check if it exists
    if (req.body.category && req.body.category !== service.category.toString()) {
      const category = await Category.findById(req.body.category)
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        })
      }
    }

    // Update service
    service = await Service.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true })
      .populate("provider", "name email image")
      .populate("category", "name")

    res.status(200).json({
      success: true,
      data: service,
      message: "Service updated successfully",
    })
  } catch (error) {
    console.error("Error updating service:", error)
    res.status(500).json({
      success: false,
      message: "Error updating service",
      error: error.message,
    })
  }
}

// Delete service
exports.deleteService = async (req, res) => {
  try {
    // Find service
    const service = await Service.findById(req.params.id)

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      })
    }

    // Check if user is the service provider
    if (service.provider.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this service",
      })
    }

    // Start a session for transaction
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Delete service
      await Service.findByIdAndDelete(req.params.id).session(session)

      // Delete related reviews
      await Review.deleteMany({ service: req.params.id }).session(session)

      // Commit transaction
      await session.commitTransaction()
      session.endSession()

      res.status(200).json({
        success: true,
        message: "Service deleted successfully",
      })
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction()
      session.endSession()
      throw error
    }
  } catch (error) {
    console.error("Error deleting service:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting service",
      error: error.message,
    })
  }
}

// Get services by provider
exports.getServicesByProvider = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Check if provider exists
    const provider = await User.findById(req.params.providerId)
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      })
    }

    // Get services
    const services = await Service.find({ provider: req.params.providerId })
      .populate("category", "name")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt")

    // Get total count
    const total = await Service.countDocuments({ provider: req.params.providerId })

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: services,
    })
  } catch (error) {
    console.error("Error getting provider services:", error)
    res.status(500).json({
      success: false,
      message: "Error getting provider services",
      error: error.message,
    })
  }
}

// Get my services (services provided by current user)
exports.getMyServices = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Get services
    const services = await Service.find({ provider: req.user.id })
      .populate("category", "name")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt")

    // Get total count
    const total = await Service.countDocuments({ provider: req.user.id })

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: services,
    })
  } catch (error) {
    console.error("Error getting my services:", error)
    res.status(500).json({
      success: false,
      message: "Error getting my services",
      error: error.message,
    })
  }
}

// Toggle service featured status (admin only)
exports.toggleFeatured = async (req, res) => {
  try {
    // Find service
    let service = await Service.findById(req.params.id)

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      })
    }

    // Toggle featured status
    service = await Service.findByIdAndUpdate(req.params.id, { $set: { featured: !service.featured } }, { new: true })
      .populate("provider", "name email image")
      .populate("category", "name")

    res.status(200).json({
      success: true,
      data: service,
      message: `Service ${service.featured ? "featured" : "unfeatured"} successfully`,
    })
  } catch (error) {
    console.error("Error toggling featured status:", error)
    res.status(500).json({
      success: false,
      message: "Error toggling featured status",
      error: error.message,
    })
  }
}

