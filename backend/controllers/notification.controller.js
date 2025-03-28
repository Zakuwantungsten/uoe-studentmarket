const Notification = require('../models/notification.model');

// Get notifications with pagination and filtering options
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    // Convert query params to appropriate types
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const unreadOnlyBool = unreadOnly === 'true';
    
    // Prepare filter
    const filter = { 
      recipient: req.user.id 
    };
    
    // Add read filter if unreadOnly is true
    if (unreadOnlyBool) {
      filter.read = false;
    }
    
    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Find notifications with pagination
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('recipient', 'name email image');
    
    // Count total notifications matching the filter
    const total = await Notification.countDocuments(filter);
    
    // Return success response with paginated data
    return res.status(200).json({
      success: true,
      data: notifications,
      count: notifications.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error getting notifications",
      error: error.message,
    });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // Find and update the notification
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user.id },
      { read: true },
      { new: true }
    ).populate('recipient', 'name email image');
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or you do not have permission to update it'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    // Update all unread notifications for the user
    const result = await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    
    return res.status(200).json({
      success: true,
      data: { success: true, count: result.modifiedCount },
      message: `${result.modifiedCount} notifications marked as read`
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking all notifications as read",
      error: error.message,
    });
  }
};

// Create a notification (for internal use by other controllers)
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};