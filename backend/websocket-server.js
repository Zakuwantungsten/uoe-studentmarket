const WebSocket = require("ws")
const http = require("http")
const jwt = require("jsonwebtoken")
const Message = require("./models/message.model")
const User = require("./models/user.model")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const notificationController = require("./controllers/notification.controller")

// Load environment variables
dotenv.config()

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected for WebSocket server"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Create HTTP server
const server = http.createServer()

// Create WebSocket server
const wss = new WebSocket.Server({ server })

// Store connected clients
const clients = new Map()

// Handle WebSocket connections
wss.on("connection", async (ws, req) => {
  // Get token from URL query parameters
  const url = new URL(req.url, "http://localhost")
  const token = url.searchParams.get("token")

  if (!token) {
    ws.close(4000, "Authentication required")
    return
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if user exists
    const user = await User.findById(decoded.id)
    if (!user) {
      ws.close(4001, "User not found")
      return
    }

    // Store user ID with WebSocket connection
    ws.userId = user._id.toString()
    clients.set(ws.userId, ws)

    console.log(`User ${ws.userId} connected`)

    // Send connection success message
    ws.send(
      JSON.stringify({
        type: "connection",
        message: "Connected to WebSocket server",
      }),
    )

    // Handle messages
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message)

        switch (data.type) {
          case "message":
            await handleChatMessage(ws, data)
            break
          case "typing":
            handleTypingIndicator(ws, data)
            break
          default:
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Unknown message type",
              }),
            )
        }
      } catch (error) {
        console.error("Error handling message:", error)
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Error processing message",
          }),
        )
      }
    })

    // Handle disconnection
    ws.on("close", () => {
      console.log(`User ${ws.userId} disconnected`)
      clients.delete(ws.userId)
    })
  } catch (error) {
    console.error("Authentication error:", error)
    ws.close(4002, "Authentication failed")
  }
})

// Handle chat messages
async function handleChatMessage(ws, data) {
  try {
    const { recipientId, content } = data

    if (!recipientId || !content) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Recipient ID and content are required",
        }),
      )
      return
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId)
    if (!recipient) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Recipient not found",
        }),
      )
      return
    }

    // Create message in database
    const message = await Message.create({
      content,
      sender: ws.userId,
      recipient: recipientId,
    })

    // Populate sender and recipient
    await message.populate("sender", "name image")
    await message.populate("recipient", "name image")

    // Get sender info for notification
    const sender = await User.findById(ws.userId);
    
    // Create notification for the recipient
    await notificationController.createNotification({
      recipient: recipientId,
      type: "message",
      title: `New message from ${sender ? sender.name : "Someone"}`,
      content: content.length > 50 ? content.substring(0, 50) + "..." : content,
      data: {
        userId: ws.userId,
        messageId: message._id
      }
    })

    // Send message to sender for confirmation
    ws.send(
      JSON.stringify({
        type: "message",
        message,
      }),
    )

    // Send message to recipient if online
    const recipientWs = clients.get(recipientId)
    if (recipientWs) {
      recipientWs.send(
        JSON.stringify({
          type: "message",
          message,
        }),
      )
    }
  } catch (error) {
    console.error("Error sending message:", error)
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Error sending message",
      }),
    )
  }
}

// Handle typing indicator
function handleTypingIndicator(ws, data) {
  const { recipientId, isTyping } = data

  if (!recipientId) {
    return
  }

  // Send typing indicator to recipient if online
  const recipientWs = clients.get(recipientId)
  if (recipientWs) {
    recipientWs.send(
      JSON.stringify({
        type: "typing",
        senderId: ws.userId,
        isTyping,
      }),
    )
  }
}

// Start WebSocket server
const PORT = process.env.WS_PORT || 5001
server.listen(PORT, '0.0.0.0', () => {
  console.log(`WebSocket server running on port ${PORT}`)
  console.log(`MongoDB connection state: ${mongoose.connection.readyState}`)
})
