const { BulkNotification, BulkNotificationRecord } = require('../models/bulkNotification.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Create a new bulk notification
exports.createBulkNotification = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      recipientType, 
      notificationType, 
      customRecipients,
      customFilter,
      scheduledFor
    } = req.body;
    
    // Validate input
    if (!title || !content || !recipientType || !notificationType) {
      return res.status(400).json({
        success: false,
        message: "Title, content, recipient type, and notification type are required"
      });
    }
    
    // Validate recipient type
    if (recipientType === 'custom' && (!customRecipients || customRecipients.length === 0) && !customFilter) {
      return res.status(400).json({
        success: false,
        message: "Custom recipients or filter criteria are required for custom recipient type"
      });
    }
    
    // Create the bulk notification
    const bulkNotification = new BulkNotification({
      title,
      content, 
      recipientType,
      notificationType,
      status: scheduledFor ? 'scheduled' : 'draft',
      customRecipients,
      customFilter,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    await bulkNotification.save();
    
    return res.status(201).json({
      success: true,
      data: bulkNotification,
      message: scheduledFor ? "Bulk notification scheduled successfully" : "Bulk notification created as draft"
    });
  } catch (error) {
    console.error("Error creating bulk notification:", error);
    res.status(500).json({
      success: false,
      message: "Error creating bulk notification",
      error: error.message
    });
  }
};

// Get all bulk notifications with filtering and pagination
exports.getBulkNotifications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      recipientType,
      notificationType,
      createdBy,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Convert query params to appropriate types
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Prepare filter
    const filter = {};
    
    // Add status filter
    if (status) {
      filter.status = status;
    }
    
    // Add recipient type filter
    if (recipientType) {
      filter.recipientType = recipientType;
    }
    
    // Add notification type filter
    if (notificationType) {
      filter.notificationType = notificationType;
    }
    
    // Add created by filter
    if (createdBy) {
      filter.createdBy = createdBy;
    }
    
    // Add search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Prepare sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Find bulk notifications with pagination
    const bulkNotifications = await BulkNotification.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email image')
      .populate('updatedBy', 'name email image');
    
    // Count total bulk notifications matching the filter
    const total = await BulkNotification.countDocuments(filter);
    
    return res.status(200).json({
      success: true,
      data: bulkNotifications,
      count: bulkNotifications.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    console.error("Error getting bulk notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error getting bulk notifications",
      error: error.message
    });
  }
};

// Get a specific bulk notification by ID
exports.getBulkNotificationById = async (req, res) => {
  try {
    const bulkNotification = await BulkNotification.findById(req.params.id)
      .populate('createdBy', 'name email image')
      .populate('updatedBy', 'name email image')
      .populate('customRecipients', 'name email image');
    
    if (!bulkNotification) {
      return res.status(404).json({
        success: false,
        message: "Bulk notification not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      data: bulkNotification
    });
  } catch (error) {
    console.error("Error getting bulk notification:", error);
    res.status(500).json({
      success: false,
      message: "Error getting bulk notification",
      error: error.message
    });
  }
};

// Update a bulk notification
exports.updateBulkNotification = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      recipientType, 
      notificationType, 
      customRecipients,
      customFilter,
      scheduledFor
    } = req.body;
    
    // Find the bulk notification
    const bulkNotification = await BulkNotification.findById(req.params.id);
    
    if (!bulkNotification) {
      return res.status(404).json({
        success: false,
        message: "Bulk notification not found"
      });
    }
    
    // Check if notification is already sent
    if (bulkNotification.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: "Cannot update a notification that has already been sent"
      });
    }
    
    // Update the bulk notification
    if (title) bulkNotification.title = title;
    if (content) bulkNotification.content = content;
    if (recipientType) {
      bulkNotification.recipientType = recipientType;
      
      // Clear custom recipients if recipient type is not custom
      if (recipientType !== 'custom') {
        bulkNotification.customRecipients = [];
        bulkNotification.customFilter = undefined;
      }
    }
    if (notificationType) bulkNotification.notificationType = notificationType;
    
    // Update custom recipients if provided and recipient type is custom
    if (recipientType === 'custom' || bulkNotification.recipientType === 'custom') {
      if (customRecipients) bulkNotification.customRecipients = customRecipients;
      if (customFilter) bulkNotification.customFilter = customFilter;
    }
    
    // Update scheduled time
    if (scheduledFor) {
      bulkNotification.scheduledFor = new Date(scheduledFor);
      if (bulkNotification.status === 'draft') {
        bulkNotification.status = 'scheduled';
      }
    } else if (scheduledFor === null && bulkNotification.status === 'scheduled') {
      bulkNotification.scheduledFor = null;
      bulkNotification.status = 'draft';
    }
    
    // Update the updatedBy field
    bulkNotification.updatedBy = req.user.id;
    
    await bulkNotification.save();
    
    return res.status(200).json({
      success: true,
      data: bulkNotification,
      message: "Bulk notification updated successfully"
    });
  } catch (error) {
    console.error("Error updating bulk notification:", error);
    res.status(500).json({
      success: false,
      message: "Error updating bulk notification",
      error: error.message
    });
  }
};

// Delete a bulk notification
exports.deleteBulkNotification = async (req, res) => {
  try {
    // Find the bulk notification
    const bulkNotification = await BulkNotification.findById(req.params.id);
    
    if (!bulkNotification) {
      return res.status(404).json({
        success: false,
        message: "Bulk notification not found"
      });
    }
    
    // Don't allow deletion of sent notifications
    if (bulkNotification.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a notification that has already been sent"
      });
    }
    
    // Delete the notification
    await BulkNotification.findByIdAndDelete(req.params.id);
    
    // Delete any notification records associated with this bulk notification
    await BulkNotificationRecord.deleteMany({ bulkNotificationId: req.params.id });
    
    return res.status(200).json({
      success: true,
      message: "Bulk notification deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting bulk notification:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting bulk notification",
      error: error.message
    });
  }
};

// Send a bulk notification immediately
exports.sendBulkNotification = async (req, res) => {
  try {
    // Find the bulk notification
    const bulkNotification = await BulkNotification.findById(req.params.id);
    
    if (!bulkNotification) {
      return res.status(404).json({
        success: false,
        message: "Bulk notification not found"
      });
    }
    
    // Don't allow sending if already sent
    if (bulkNotification.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: "This notification has already been sent"
      });
    }
    
    // Get recipients based on recipient type
    let recipients = [];
    
    switch (bulkNotification.recipientType) {
      case 'all':
        recipients = await User.find().select('_id');
        break;
        
      case 'providers':
        recipients = await User.find({ role: 'PROVIDER' }).select('_id');
        break;
        
      case 'customers':
        recipients = await User.find({ role: 'USER' }).select('_id');
        break;
        
      case 'inactive':
        recipients = await User.find({ status: 'INACTIVE' }).select('_id');
        break;
        
      case 'custom':
        if (bulkNotification.customRecipients && bulkNotification.customRecipients.length > 0) {
          // If specific recipients are provided
          recipients = bulkNotification.customRecipients.map(id => ({ _id: id }));
        } else if (bulkNotification.customFilter) {
          // Build filter based on custom filter criteria
          const filter = {};
          
          if (bulkNotification.customFilter.roles && bulkNotification.customFilter.roles.length > 0) {
            filter.role = { $in: bulkNotification.customFilter.roles };
          }
          
          if (bulkNotification.customFilter.departments && bulkNotification.customFilter.departments.length > 0) {
            filter.department = { $in: bulkNotification.customFilter.departments };
          }
          
          if (bulkNotification.customFilter.joinedAfter) {
            filter.createdAt = { $gte: new Date(bulkNotification.customFilter.joinedAfter) };
          }
          
          if (bulkNotification.customFilter.joinedBefore) {
            filter.createdAt = { 
              ...filter.createdAt,
              $lte: new Date(bulkNotification.customFilter.joinedBefore) 
            };
          }
          
          // Add additional filter criteria as needed
          
          recipients = await User.find(filter).select('_id');
        }
        break;
    }
    
    // Update bulk notification status
    bulkNotification.status = 'sent';
    bulkNotification.sentAt = new Date();
    bulkNotification.deliveryStats.total = recipients.length;
    await bulkNotification.save();
    
    // Create notification records for each recipient
    const notificationPromises = recipients.map(async (recipient) => {
      // Create the notification record
      const notificationRecord = new BulkNotificationRecord({
        bulkNotificationId: bulkNotification._id,
        recipient: recipient._id,
        status: 'pending'
      });
      
      try {
        // Create the actual notification if in-app notification is enabled
        if (bulkNotification.notificationType === 'in-app' || bulkNotification.notificationType === 'both') {
          const notification = new Notification({
            recipient: recipient._id,
            type: 'system',
            title: bulkNotification.title,
            content: bulkNotification.content,
            read: false
          });
          
          await notification.save();
          
          // Update record with notification ID
          notificationRecord.notificationId = notification._id;
        }
        
        // Update record status
        notificationRecord.status = 'sent';
        notificationRecord.sentAt = new Date();
        
        await notificationRecord.save();
        
        // Update delivery stats
        await BulkNotification.updateOne(
          { _id: bulkNotification._id },
          { $inc: { 'deliveryStats.delivered': 1 } }
        );
        
        return true;
      } catch (error) {
        console.error(`Error sending notification to recipient ${recipient._id}:`, error);
        
        // Update record with failure
        notificationRecord.status = 'failed';
        notificationRecord.failureReason = error.message;
        await notificationRecord.save();
        
        // Update delivery stats
        await BulkNotification.updateOne(
          { _id: bulkNotification._id },
          { $inc: { 'deliveryStats.failed': 1 } }
        );
        
        return false;
      }
    });
    
    // Wait for all notifications to be processed
    await Promise.all(notificationPromises);
    
    // Refresh the bulk notification to get updated stats
    const updatedBulkNotification = await BulkNotification.findById(bulkNotification._id);
    
    return res.status(200).json({
      success: true,
      data: updatedBulkNotification,
      message: `Notification sent to ${updatedBulkNotification.deliveryStats.delivered} recipients with ${updatedBulkNotification.deliveryStats.failed} failures`
    });
  } catch (error) {
    console.error("Error sending bulk notification:", error);
    res.status(500).json({
      success: false,
      message: "Error sending bulk notification",
      error: error.message
    });
  }
};

// Get delivery records for a bulk notification
exports.getDeliveryRecords = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status 
    } = req.query;
    
    // Convert query params to appropriate types
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Prepare filter
    const filter = { bulkNotificationId: req.params.id };
    
    // Add status filter if provided
    if (status) {
      filter.status = status;
    }
    
    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Find delivery records with pagination
    const records = await BulkNotificationRecord.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('recipient', 'name email image')
      .populate('notificationId');
    
    // Count total records matching the filter
    const total = await BulkNotificationRecord.countDocuments(filter);
    
    return res.status(200).json({
      success: true,
      data: records,
      count: records.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    console.error("Error getting delivery records:", error);
    res.status(500).json({
      success: false,
      message: "Error getting delivery records",
      error: error.message
    });
  }
};