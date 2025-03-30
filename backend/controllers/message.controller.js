const Message = require("../models/message.model")
const User = require("../models/user.model")
const mongoose = require("mongoose")
const notificationController = require("../controllers/notification.controller")

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body

    // Safely convert user IDs to ObjectId
    let senderObjectId;
    try {
      senderObjectId = new mongoose.Types.ObjectId(req.user.id);
    } catch (error) {
      console.error("Invalid ObjectId format for sender:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid sender ID format",
        error: error.message,
      });
    }

    let recipientObjectId;
    try {
      recipientObjectId = new mongoose.Types.ObjectId(recipientId);
    } catch (error) {
      console.error("Invalid ObjectId format for recipient:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid recipient ID format",
        error: error.message,
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientObjectId)
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      })
    }

    // Create message
    const message = await Message.create({
      sender: senderObjectId,
      recipient: recipientObjectId,
      content,
    })

    // Populate sender and recipient
    await message.populate("sender", "name image")
    await message.populate("recipient", "name image")

    // Get sender info for notification
    const sender = await User.findById(senderObjectId);
    
    // Create notification for the recipient
    await notificationController.createNotification({
      recipient: recipientObjectId,
      type: "message",
      title: `New message from ${sender ? sender.name : "Someone"}`,
      content: content.length > 50 ? content.substring(0, 50) + "..." : content,
      data: {
        userId: senderObjectId,
        messageId: message._id
      }
    })

    res.status(201).json({
      success: true,
      data: message,
      message: "Message sent successfully",
    })
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message,
    })
  }
}

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Safely convert user IDs to ObjectId
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(req.user.id);
    } catch (error) {
      console.error("Invalid ObjectId format for current user:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
        error: error.message,
      });
    }

    let recipientObjectId;
    try {
      recipientObjectId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error("Invalid ObjectId format for recipient:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid recipient ID format",
        error: error.message,
      });
    }
    
    // Check if user exists
    const user = await User.findById(recipientObjectId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get messages
    const messages = await Message.find({
      $or: [
        { sender: userObjectId, recipient: recipientObjectId },
        { sender: recipientObjectId, recipient: userObjectId }
      ]
    })
      .populate('sender', 'name image')
      .populate('recipient', 'name image')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');
    
    // Get total count for pagination
    const total = await Message.countDocuments({
      $or: [
        { sender: userObjectId, recipient: recipientObjectId },
        { sender: recipientObjectId, recipient: userObjectId }
      ]
    });

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, recipient: req.user.id, read: false },
      { read: true, readAt: Date.now() }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: messages,
      user: {
        _id: user._id,
        name: user.name,
        image: user.image
      }
    });
  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({
      success: false,
      message: "Error getting conversation",
      error: error.message,
    });
  }
};
// Get all conversations
exports.getConversations = async (req, res) =>
{
  try {
    // Safely convert user ID to ObjectId
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(req.user.id);
    } catch (error) {
      console.error("Invalid ObjectId format:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
        error: error.message,
      });
    }

    // Convert userObjectId to string for comparisons
    const userIdStr = userObjectId.toString();

    // Get latest message from each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userObjectId },
            { recipient: userObjectId }
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: [{ $toString: "$sender" }, userIdStr] },
              then: "$recipient",
              else: "$sender"
            }
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: [{ $toString: "$recipient" }, userIdStr] },
                    { $eq: ["$read", false] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          unreadCount: 1,
          "user._id": 1,
          "user.name": 1,
          "user.image": 1,
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ])

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    })
  } catch (error) {
    console.error("Error getting conversations:", error)
    res.status(500).json({
      success: false,
      message: "Error getting conversations",
      error: error.message,
    })
  }
}

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    // Safely convert message ID to ObjectId
    let messageObjectId;
    try {
      messageObjectId = new mongoose.Types.ObjectId(req.params.id);
    } catch (error) {
      console.error("Invalid ObjectId format for message:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid message ID format",
        error: error.message,
      });
    }

    // Safely convert user ID to ObjectId
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(req.user.id);
    } catch (error) {
      console.error("Invalid ObjectId format for user:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
        error: error.message,
      });
    }

    // Find message
    const message = await Message.findById(messageObjectId)

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      })
    }

    // Check if user is the sender
    if (message.sender.toString() !== userObjectId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      })
    }

    // Delete message
    await Message.findByIdAndDelete(messageObjectId)

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting message:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting message",
      error: error.message,
    })
  }
}

// Get unread messages count
exports.getUnreadCount = async (req, res) => {
  try {
    // Safely convert user ID to ObjectId
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(req.user.id);
    } catch (error) {
      console.error("Invalid ObjectId format for user:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
        error: error.message,
      });
    }

    // Get unread messages count
    const unreadCount = await Message.countDocuments({
      recipient: userObjectId,
      read: false,
    })

    res.status(200).json({
      success: true,
      unreadCount,
    })
  } catch (error) {
    console.error("Error getting unread count:", error)
    res.status(500).json({
      success: false,
      message: "Error getting unread messages count",
      error: error.message,
    })
  }
}

// Mark conversation as read
exports.markConversationAsRead = async (req, res) => {
  try {
    const { userId } = req.params

    // Safely convert user IDs to ObjectId
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(req.user.id);
    } catch (error) {
      console.error("Invalid ObjectId format for current user:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
        error: error.message,
      });
    }

    let senderObjectId;
    try {
      senderObjectId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error("Invalid ObjectId format for sender:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid sender ID format",
        error: error.message,
      });
    }

    // Update messages
    const result = await Message.updateMany(
      { sender: senderObjectId, recipient: userObjectId, read: false },
      { $set: { read: true, readAt: Date.now() } },
    )

    res.status(200).json({
      success: true,
      message: "Conversation marked as read",
      count: result.nModified,
    })
  } catch (error) {
    console.error("Error marking conversation as read:", error)
    res.status(500).json({
      success: false,
      message: "Error marking conversation as read",
      error: error.message,
    })
  }
}

