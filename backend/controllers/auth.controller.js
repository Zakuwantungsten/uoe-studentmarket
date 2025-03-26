const User = require("../models/user.model")
const jwt = require("jsonwebtoken")

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, studentId } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      studentId,
    })

    // Generate token
    const token = generateToken(user._id)

    // Remove password from response
    user.password = undefined

    res.status(201).json({
      user,
      token,
    })
  } catch (error) {
    next(error)
  }
}

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" })
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select("+password")
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Generate token
    const token = generateToken(user._id)

    // Remove password from response
    user.password = undefined

    res.status(200).json({
      user,
      token,
    })
  } catch (error) {
    next(error)
  }
}

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
      return res.status(401).json({ message: "You are not logged in. Please log in to get access." })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if user still exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) {
      return res.status(401).json({ message: "The user belonging to this token no longer exists." })
    }

    // Check if user is active
    if (currentUser.status !== "ACTIVE") {
      return res.status(401).json({ message: "Your account is not active. Please contact support." })
    }

    // Grant access to protected route
    req.user = currentUser
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token. Please log in again." })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Your token has expired. Please log in again." })
    }
    next(error)
  }
}

// Restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action" })
    }
    next()
  }
}

// Get current user
exports.getMe = (req, res) => {
  res.status(200).json({ user: req.user })
}

