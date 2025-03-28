const Group = require("../models/group.model")
const mongoose = require("mongoose")

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, image } = req.body
    const userId = req.user._id

    const group = new Group({
      name,
      description,
      image,
      creator: userId,
      members: [userId], // Creator is automatically a member
    })

    await group.save()
    res.status(201).json({
      success: true,
      data: group,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Get all groups with pagination
exports.getAllGroups = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const groups = await Group.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("creator", "name email")
      .populate("members", "name email")

    const total = await Group.countDocuments()

    res.status(200).json({
      success: true,
      count: groups.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: groups,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Get a single group by ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("creator", "name email")
      .populate("members", "name email")

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      })
    }

    res.status(200).json({
      success: true,
      data: group,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Update a group
exports.updateGroup = async (req, res) => {
  try {
    const { name, description, image } = req.body
    const userId = req.user._id

    const group = await Group.findById(req.params.id)

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      })
    }

    // Check if user is the creator of the group
    if (group.creator.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this group",
      })
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      { name, description, image },
      { new: true, runValidators: true }
    )
      .populate("creator", "name email")
      .populate("members", "name email")

    res.status(200).json({
      success: true,
      data: updatedGroup,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete a group
exports.deleteGroup = async (req, res) => {
  try {
    const userId = req.user._id
    const group = await Group.findById(req.params.id)

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      })
    }

    // Check if user is the creator of the group
    if (group.creator.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this group",
      })
    }

    await Group.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Join a group
exports.joinGroup = async (req, res) => {
  try {
    const groupId = req.params.id
    const userId = req.user._id

    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      })
    }

    // Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this group",
      })
    }

    // Add user to members array
    group.members.push(userId)
    await group.save()

    const updatedGroup = await Group.findById(groupId)
      .populate("creator", "name email")
      .populate("members", "name email")

    res.status(200).json({
      success: true,
      message: "Successfully joined the group",
      data: updatedGroup,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Leave a group
exports.leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.id
    const userId = req.user._id

    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      })
    }

    // Check if user is a member
    if (!group.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this group",
      })
    }

    // Check if user is the creator
    if (group.creator.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "As the creator, you cannot leave the group. Transfer ownership or delete the group instead.",
      })
    }

    // Remove user from members array
    group.members = group.members.filter(
      (member) => member.toString() !== userId.toString()
    )
    await group.save()

    res.status(200).json({
      success: true,
      message: "Successfully left the group",
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}