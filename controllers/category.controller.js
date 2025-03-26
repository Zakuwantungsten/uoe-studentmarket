const Category = require("../models/category.model")
const Service = require("../models/service.model")

// Create a new category (admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body

    // Check if category already exists
    const existingCategory = await Category.findOne({ name })
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      })
    }

    // Create category
    const category = await Category.create({
      name,
      description,
      icon,
    })

    res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully",
    })
  } catch (error) {
    console.error("Error creating category:", error)
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    })
  }
}

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    // Get categories
    const categories = await Category.find().sort("name")

    // Get service count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Service.countDocuments({ category: category._id })
        return {
          ...category.toObject(),
          serviceCount: count,
        }
      }),
    )

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categoriesWithCount,
    })
  } catch (error) {
    console.error("Error getting categories:", error)
    res.status(500).json({
      success: false,
      message: "Error getting categories",
      error: error.message,
    })
  }
}

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    // Get service count for this category
    const serviceCount = await Service.countDocuments({ category: req.params.id })

    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        serviceCount,
      },
    })
  } catch (error) {
    console.error("Error getting category:", error)
    res.status(500).json({
      success: false,
      message: "Error getting category",
      error: error.message,
    })
  }
}

// Update category (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body

    // Check if category exists
    let category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    // Check if name is being changed and already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name })
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category name already exists",
        })
      }
    }

    // Update category
    category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: { name, description, icon } },
      { new: true, runValidators: true },
    )

    res.status(200).json({
      success: true,
      data: category,
      message: "Category updated successfully",
    })
  } catch (error) {
    console.error("Error updating category:", error)
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    })
  }
}

// Delete category (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    // Check if category exists
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    // Check if category has services
    const serviceCount = await Service.countDocuments({ category: req.params.id })
    if (serviceCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with associated services",
        serviceCount,
      })
    }

    // Delete category
    await Category.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    })
  }
}

// Get services by category
exports.getCategoryServices = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Check if category exists
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    // Get services
    const services = await Service.find({ category: req.params.id })
      .populate("provider", "name email image")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt")

    // Get total count
    const total = await Service.countDocuments({ category: req.params.id })

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      category: {
        _id: category._id,
        name: category.name,
        description: category.description,
        icon: category.icon,
      },
      data: services,
    })
  } catch (error) {
    console.error("Error getting category services:", error)
    res.status(500).json({
      success: false,
      message: "Error getting category services",
      error: error.message,
    })
  }
}

