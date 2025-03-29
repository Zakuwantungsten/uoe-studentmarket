const Announcement = require('../models/announcement.model');
const mongoose = require('mongoose');

// Create a new announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, description, type, displayLocation, startDate, endDate } = req.body;
    
    // Validate input
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required"
      });
    }
    
    // Create the announcement
    const announcement = new Announcement({
      title,
      description, 
      type: type || 'info',
      displayLocation: displayLocation || 'all',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    await announcement.save();
    
    return res.status(201).json({
      success: true,
      data: announcement,
      message: "Announcement created successfully"
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({
      success: false,
      message: "Error creating announcement",
      error: error.message
    });
  }
};

// Get all announcements with filtering and pagination
exports.getAnnouncements = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type, 
      displayLocation, 
      active = false,
      startDateBefore,
      startDateAfter,
      endDateBefore,
      endDateAfter
    } = req.query;
    
    // Convert query params to appropriate types
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Prepare filter
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (displayLocation) {
      filter.displayLocation = displayLocation;
    }
    
    // Filter for active announcements (current date is between start and end date)
    if (active === 'true') {
      const now = new Date();
      filter.status = 'active';
      filter.startDate = { $lte: now };
      filter.$or = [
        { endDate: { $gte: now } },
        { endDate: null }
      ];
    }
    
    // Date range filters
    if (startDateBefore) {
      filter.startDate = { ...filter.startDate, $lte: new Date(startDateBefore) };
    }
    
    if (startDateAfter) {
      filter.startDate = { ...filter.startDate, $gte: new Date(startDateAfter) };
    }
    
    if (endDateBefore) {
      filter.endDate = { ...filter.endDate, $lte: new Date(endDateBefore) };
    }
    
    if (endDateAfter) {
      filter.endDate = { ...filter.endDate, $gte: new Date(endDateAfter) };
    }
    
    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Find announcements with pagination
    const announcements = await Announcement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email image')
      .populate('updatedBy', 'name email image');
    
    // Count total announcements matching the filter
    const total = await Announcement.countDocuments(filter);
    
    return res.status(200).json({
      success: true,
      data: announcements,
      count: announcements.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    console.error("Error getting announcements:", error);
    res.status(500).json({
      success: false,
      message: "Error getting announcements",
      error: error.message
    });
  }
};

// Get a specific announcement by ID
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name email image')
      .populate('updatedBy', 'name email image');
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error("Error getting announcement:", error);
    res.status(500).json({
      success: false,
      message: "Error getting announcement",
      error: error.message
    });
  }
};

// Update an announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      type, 
      status, 
      displayLocation, 
      startDate, 
      endDate 
    } = req.body;
    
    // Find the announcement
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }
    
    // Update the announcement
    if (title) announcement.title = title;
    if (description) announcement.description = description;
    if (type) announcement.type = type;
    if (status) announcement.status = status;
    if (displayLocation) announcement.displayLocation = displayLocation;
    if (startDate) announcement.startDate = new Date(startDate);
    if (endDate) announcement.endDate = new Date(endDate);
    
    // Update the updatedBy field
    announcement.updatedBy = req.user.id;
    
    await announcement.save();
    
    return res.status(200).json({
      success: true,
      data: announcement,
      message: "Announcement updated successfully"
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({
      success: false,
      message: "Error updating announcement",
      error: error.message
    });
  }
};

// Delete an announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting announcement",
      error: error.message
    });
  }
};

// Get active announcements for the client side
exports.getActiveAnnouncements = async (req, res) => {
  try {
    const { displayLocation } = req.query;
    
    const now = new Date();
    const filter = {
      status: 'active',
      startDate: { $lte: now },
      $or: [
        { endDate: { $gte: now } },
        { endDate: null }
      ]
    };
    
    // Filter by display location if provided
    if (displayLocation) {
      filter.$or = [
        { displayLocation: 'all' },
        { displayLocation: displayLocation }
      ];
    }
    
    const announcements = await Announcement.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name');
    
    return res.status(200).json({
      success: true,
      data: announcements
    });
  } catch (error) {
    console.error("Error getting active announcements:", error);
    res.status(500).json({
      success: false,
      message: "Error getting active announcements",
      error: error.message
    });
  }
};

// Change the status of an announcement (activate/deactivate)
exports.changeAnnouncementStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Status must be 'active' or 'inactive'"
      });
    }
    
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }
    
    announcement.status = status;
    announcement.updatedBy = req.user.id;
    await announcement.save();
    
    return res.status(200).json({
      success: true,
      data: announcement,
      message: `Announcement ${status === 'active' ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error("Error changing announcement status:", error);
    res.status(500).json({
      success: false,
      message: "Error changing announcement status",
      error: error.message
    });
  }
};