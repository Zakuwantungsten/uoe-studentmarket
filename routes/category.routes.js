const express = require("express")
const router = express.Router()
const categoryController = require("../controllers/category.controller")
const authController = require("../controllers/auth.controller")

// Get all categories
router.get("/", categoryController.getAllCategories)

// Create a new category (admin only)
router.post("/", authController.protect, authController.restrictTo("ADMIN"), categoryController.createCategory)

// Get category by ID with services
router.get("/:id", categoryController.getCategoryById)

// Update category (admin only)
router.patch("/:id", authController.protect, authController.restrictTo("ADMIN"), categoryController.updateCategory)

// Delete category (admin only)
router.delete("/:id", authController.protect, authController.restrictTo("ADMIN"), categoryController.deleteCategory)

module.exports = router

