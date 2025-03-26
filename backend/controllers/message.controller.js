const Message = require("../models/message.model")
const User = require("../models/user.model")
const mongoose = require("mongoose")

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body

    // Check if recipient exists
    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      })
    }

    // Create message
    const message = await Message.create({
      sender: req.user.id,
      recipient: recipientId,
      content,
    })

    // Populate sender and recipient
    await message.populate("sender", "name image")
    await message.populate("recipient", "name image")

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
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get messages
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: userId },
        { sender: userId, recipient: req.user.id }
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
        { sender: req.user.id, recipient: userId },
        { sender: userId, recipient: req.user.id }
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
    // Get latest message from each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: mongoose.Types.ObjectId(req.user.id) }, { recipient: mongoose.Types.ObjectId(req.user.id) }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", mongoose.Types.ObjectId(req.user.id)] }, "$recipient", "$sender"],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ["$recipient", mongoose.Types.ObjectId(req.user.id)] }, { $eq: ["$read", false] }],
                },
                1,
                0,
              ],
            },
          },
        },
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
    // Find message
    const message = await Message.findById(req.params.id)

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      })
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      })
    }

    // Delete message
    await Message.findByIdAndDelete(req.params.id)

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
    // Get unread messages count
    const unreadCount = await Message.countDocuments({
      recipient: req.user.id,
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

    // Update messages
    const result = await Message.updateMany(
      { sender: userId, recipient: req.user.id, read: false },
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

