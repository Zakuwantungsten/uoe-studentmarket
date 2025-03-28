const Discussion = require("../models/discussion.model")
const Comment = require("../models/comment.model")
const mongoose = require("mongoose")

// Create a new discussion
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content } = req.body
    const userId = req.user._id // Assuming authentication middleware sets req.user

    const discussion = new Discussion({
      title,
      content,
      author: userId,
    })

    await discussion.save()
    res.status(201).json({
      success: true,
      data: discussion,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Get all discussions with pagination
exports.getAllDiscussions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const discussions = await Discussion.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name email")
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 }, limit: 5 },
        populate: { path: "author", select: "name email" },
      })

    const total = await Discussion.countDocuments()

    res.status(200).json({
      success: true,
      count: discussions.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: discussions,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Get a single discussion by ID
exports.getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate("author", "name email")
      .populate({
        path: "comments",
        populate: { path: "author", select: "name email" },
      })

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      })
    }

    res.status(200).json({
      success: true,
      data: discussion,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Update a discussion
exports.updateDiscussion = async (req, res) => {
  try {
    const { title, content } = req.body
    const userId = req.user._id

    const discussion = await Discussion.findById(req.params.id)

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      })
    }

    // Check if user is the author of the discussion
    if (discussion.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this discussion",
      })
    }

    const updatedDiscussion = await Discussion.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true, runValidators: true }
    ).populate("author", "name email")

    res.status(200).json({
      success: true,
      data: updatedDiscussion,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete a discussion
exports.deleteDiscussion = async (req, res) => {
  try {
    const userId = req.user._id
    const discussion = await Discussion.findById(req.params.id)

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      })
    }

    // Check if user is the author of the discussion
    if (discussion.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this discussion",
      })
    }

    // Delete all comments associated with this discussion
    await Comment.deleteMany({ discussion: req.params.id })

    // Delete the discussion
    await Discussion.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Discussion deleted successfully",
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}