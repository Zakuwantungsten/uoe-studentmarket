const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/"
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueFilename)
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("Only image files are allowed!"), false)
  }
  cb(null, true)
}

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 5000000, // 5MB default
  },
  fileFilter: fileFilter,
}).single("file")

// Upload file
exports.uploadFile = (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({
        success: false,
        message: `Multer error: ${err.message}`,
      })
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }

    // Everything went fine
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      })
    }

    // Return file info
    res.status(200).json({
      success: true,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `${req.protocol}://${req.get("host")}/${req.file.path}`,
      },
      message: "File uploaded successfully",
    })
  })
}

// Upload multiple files
exports.uploadMultipleFiles = (req, res) => {
  const multiUpload = multer({
    storage: storage,
    limits: {
      fileSize: process.env.MAX_FILE_SIZE || 5000000, // 5MB default
    },
    fileFilter: fileFilter,
  }).array("files", 5) // Allow up to 5 files

  multiUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({
        success: false,
        message: `Multer error: ${err.message}`,
      })
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }

    // Everything went fine
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      })
    }

    // Return files info
    const filesInfo = req.files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url: `${req.protocol}://${req.get("host")}/${file.path}`,
    }))

    res.status(200).json({
      success: true,
      files: filesInfo,
      message: "Files uploaded successfully",
    })
  })
}

// Delete file
exports.deleteFile = (req, res) => {
  const { filename } = req.params

  if (!filename) {
    return res.status(400).json({
      success: false,
      message: "Filename is required",
    })
  }

  const filePath = path.join("uploads", filename)

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    })
  }

  // Delete file
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: `Error deleting file: ${err.message}`,
      })
    }

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    })
  })
}

