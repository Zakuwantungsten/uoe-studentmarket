const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const morgan = require("morgan")
const path = require("path")

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Import routes
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const serviceRoutes = require("./routes/service.routes")
const categoryRoutes = require("./routes/category.routes")
const bookingRoutes = require("./routes/booking.routes")
const reviewRoutes = require("./routes/review.routes")
const messageRoutes = require("./routes/message.routes")
const adminRoutes = require("./routes/admin.routes")
const uploadRoutes = require("./routes/upload.routes")
const paymentRoutes = require("./routes/payment.routes")
const notificationRoutes = require("./routes/notification.routes")
const discussionRoutes = require("./routes/discussion.routes")
const commentRoutes = require("./routes/comment.routes")
const eventRoutes = require("./routes/event.routes")
const groupRoutes = require("./routes/group.routes")

// Use routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/services", serviceRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/discussions", discussionRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/groups", groupRoutes)

// Root route
app.get("/", (req, res) => {
  res.send("Student Marketplace API is running")
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

