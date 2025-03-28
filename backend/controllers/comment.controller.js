const Comment = require("../models/comment.model")
const Discussion = require("../models/discussion.model")
const mongoose = require("mongoose")

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { content, discussionId } = req.body
    const userId = req.user._id

    // Check if discussion exists
    const discussion = await Discussion.findById(discussionId)
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      })
    }

    const comment = new Comment({
      content,
      author: userId,
      discussion: discussionId,
    })

    await comment.save()

    // Populate author details
    const populatedComment = await Comment.findById(comment._id).populate("author", "name email")

    res.status(201).json({
      success: true,
      data: populatedComment,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Get all comments for a discussion
exports.getCommentsByDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Check if discussion exists
    const discussion = await Discussion.findById(discussionId)
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      })
    }

    const comments = await Comment.find({ discussion: discussionId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name email")

    const total = await Comment.countDocuments({ discussion: discussionId })

    res.status(200).json({
      success: true,
      count: comments.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: comments,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body
    const userId = req.user._id
    const commentId = req.params.id

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    // Check if user is the author of the comment
    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this comment",
      })
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true, runValidators: true }
    ).populate("author", "name email")

    res.status(200).json({
      success: true,
      data: updatedComment,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const userId = req.user._id
    const commentId = req.params.id

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    // Check if user is the author of the comment
    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment",
      })
    }

    await Comment.findByIdAndDelete(commentId)

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}