const express = require("express")
const router = express.Router()
const serviceController = require("../controllers/service.controller")
const authController = require("../controllers/auth.controller")

// Get all services
router.get("/", serviceController.getAllServices)

// Get featured services
router.get("/featured", (req, res, next) => {
  req.query.featured = "true";
  next();
}, serviceController.getAllServices)

// Get my services
router.get("/my-services", authController.protect, serviceController.getMyServices)

// Create a new service
router.post("/", authController.protect, serviceController.createService)

// Get service by ID
router.get("/:id", serviceController.getServiceById)

// Update service
router.patch("/:id", authController.protect, serviceController.updateService)

// Delete service
router.delete("/:id", authController.protect, serviceController.deleteService)

// Toggle featured status (admin only)
router.patch("/:id/featured", authController.protect, authController.restrictTo("admin"), serviceController.toggleFeatured)

module.exports = router

