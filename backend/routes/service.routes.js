const express = require("express")
const router = express.Router()
const serviceController = require("../controllers/service.controller")
const authController = require("../controllers/auth.controller")

// Get all services
router.get("/", serviceController.getAllServices)

// Create a new service
router.post("/", authController.protect, serviceController.createService)

// Get service by ID
router.get("/:id", serviceController.getServiceById)

// Update service
router.patch("/:id", authController.protect, serviceController.updateService)

// Delete service
router.delete("/:id", authController.protect, serviceController.deleteService)

module.exports = router

