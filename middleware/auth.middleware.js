const jwt = require("jsonwebtoken")
const User = require("../models/user.model")

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from token
      const user = await User.findById(decoded.id).select("-password")

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        })
      }

      // Set user in request
      req.user = user
      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
        error: error.message,
      })
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Authorize roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      })
    }
    next()
  }
}

