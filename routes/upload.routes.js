const express = require("express")
const router = express.Router()
const { protect } = require("../middleware/auth.middleware")
const uploadController = require("../controllers/upload.controller")

// Upload routes
router.post("/file", protect, uploadController.uploadFile)
router.post("/files", protect, uploadController.uploadMultipleFiles)
router.delete("/file/:filename", protect, uploadController.deleteFile)

module.exports = router

