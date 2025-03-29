const SupportTicket = require('../models/supportTicket.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Create a new support ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, description, category } = req.body;
    
    // Validate input
    if (!subject || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Subject, description, and category are required"
      });
    }
    
    // Generate ticket ID
    const ticketId = await SupportTicket.generateTicketId();
    
    // Create the support ticket
    const supportTicket = new SupportTicket({
      ticketId,
      subject,
      description,
      category,
      user: req.user.id,
      messages: [{
        sender: req.user.id,
        content: description
      }],
      lastResponseBy: 'User',
      lastResponseAt: new Date()
    });
    
    await supportTicket.save();
    
    return res.status(201).json({
      success: true,
      data: supportTicket,
      message: "Support ticket created successfully"
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    res.status(500).json({
      success: false,
      message: "Error creating support ticket",
      error: error.message
    });
  }
};

// Get all support tickets with filtering and pagination
exports.getTickets = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      assignedTo,
      unassigned = false
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
    
    // Add category filter
    if (category) {
      filter.category = category;
    }
    
    // Add priority filter
    if (priority) {
      filter.priority = priority;
    }
    
    // Add assigned/unassigned filter
    if (unassigned === 'true') {
      filter.assignedTo = { $exists: false };
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
    
    // Add search filter
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // For regular users, only show their own tickets
    // For admins, show all tickets
    if (req.user.role !== 'ADMIN') {
      filter.user = req.user.id;
    }
    
    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Prepare sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Find support tickets with pagination
    const tickets = await SupportTicket.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email image')
      .populate('assignedTo', 'name email image');
    
    // Count total support tickets matching the filter
    const total = await SupportTicket.countDocuments(filter);
    
    return res.status(200).json({
      success: true,
      data: tickets,
      count: tickets.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    console.error("Error getting support tickets:", error);
    res.status(500).json({
      success: false,
      message: "Error getting support tickets",
      error: error.message
    });
  }
};

// Get a specific support ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email image')
      .populate('assignedTo', 'name email image')
      .populate('messages.sender', 'name email image role');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found"
      });
    }
    
    // Check if user has access to this ticket
    if (req.user.role !== 'ADMIN' && ticket.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this ticket"
      });
    }
    
    return res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error("Error getting support ticket:", error);
    res.status(500).json({
      success: false,
      message: "Error getting support ticket",
      error: error.message
    });
  }
};

// Add a response to a ticket
exports.addResponse = async (req, res) => {
  try {
    const { content, attachments } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }
    
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found"
      });
    }
    
    // Check if user has access to this ticket
    if (req.user.role !== 'ADMIN' && ticket.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to respond to this ticket"
      });
    }
    
    // Create new message
    const newMessage = {
      sender: req.user.id,
      content,
      attachments: attachments || []
    };
    
    // Add message to the ticket
    ticket.messages.push(newMessage);
    
    // Update last response info
    ticket.lastResponseBy = req.user.role === 'ADMIN' ? 'Admin' : 'User';
    ticket.lastResponseAt = new Date();
    
    // If the ticket is closed, reopen it
    if (ticket.status === 'Closed') {
      ticket.status = 'Open';
    }
    
    // If admin is responding to an Open ticket, change status to In Progress
    if (req.user.role === 'ADMIN' && ticket.status === 'Open') {
      ticket.status = 'In Progress';
      
      // If the ticket isn't assigned yet, assign it to the responding admin
      if (!ticket.assignedTo) {
        ticket.assignedTo = req.user.id;
      }
    }
    
    await ticket.save();
    
    // Populate the new message's sender
    await SupportTicket.populate(ticket, {
      path: 'messages.sender',
      select: 'name email image role',
      model: 'User'
    });
    
    return res.status(200).json({
      success: true,
      data: ticket,
      message: "Response added successfully"
    });
  } catch (error) {
    console.error("Error adding response to ticket:", error);
    res.status(500).json({
      success: false,
      message: "Error adding response to ticket",
      error: error.message
    });
  }
};

// Update ticket status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate input
    if (!status || !['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status (Open, In Progress, Resolved, Closed) is required"
      });
    }
    
    // Only admins can update ticket status
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Only administrators can update ticket status"
      });
    }
    
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found"
      });
    }
    
    // Update status
    ticket.status = status;
    
    // Record timestamps for Resolved and Closed statuses
    if (status === 'Resolved' && !ticket.resolvedAt) {
      ticket.resolvedAt = new Date();
    } else if (status === 'Closed' && !ticket.closedAt) {
      ticket.closedAt = new Date();
    }
    
    await ticket.save();
    
    return res.status(200).json({
      success: true,
      data: ticket,
      message: `Ticket status updated to ${status} successfully`
    });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating ticket status",
      error: error.message
    });
  }
};

// Assign ticket to an admin
exports.assignTicket = async (req, res) => {
  try {
    const { adminId } = req.body;
    
    // Validate admin ID
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required"
      });
    }
    
    // Only admins can assign tickets
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Only administrators can assign tickets"
      });
    }
    
    // Check if the assigned user is an admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: "The assigned user must be an administrator"
      });
    }
    
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found"
      });
    }
    
    // Assign ticket to admin
    ticket.assignedTo = adminId;
    
    // If the ticket is still open, change status to In Progress
    if (ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }
    
    await ticket.save();
    
    return res.status(200).json({
      success: true,
      data: ticket,
      message: "Ticket assigned successfully"
    });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning ticket",
      error: error.message
    });
  }
};

// Update ticket priority
exports.updateTicketPriority = async (req, res) => {
  try {
    const { priority } = req.body;
    
    // Validate input
    if (!priority || !['Low', 'Medium', 'High', 'Critical'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Valid priority (Low, Medium, High, Critical) is required"
      });
    }
    
    // Only admins can update ticket priority
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Only administrators can update ticket priority"
      });
    }
    
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found"
      });
    }
    
    // Update priority
    ticket.priority = priority;
    
    await ticket.save();
    
    return res.status(200).json({
      success: true,
      data: ticket,
      message: `Ticket priority updated to ${priority} successfully`
    });
  } catch (error) {
    console.error("Error updating ticket priority:", error);
    res.status(500).json({
      success: false,
      message: "Error updating ticket priority",
      error: error.message
    });
  }
};

// Get ticket statistics
exports.getTicketStats = async (req, res) => {
  try {
    // Only admins can view ticket statistics
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Only administrators can view ticket statistics"
      });
    }
    
    // Get ticket counts by status
    const statusCounts = await SupportTicket.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get ticket counts by category
    const categoryCounts = await SupportTicket.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get ticket counts by priority
    const priorityCounts = await SupportTicket.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate average response time
    const tickets = await SupportTicket.find({
      'messages.1': { $exists: true } // At least 2 messages
    });
    
    let totalResponseTime = 0;
    let responseCount = 0;
    
    tickets.forEach(ticket => {
      if (ticket.messages.length < 2) return;
      
      for (let i = 1; i < ticket.messages.length; i++) {
        const prevMessage = ticket.messages[i-1];
        const currMessage = ticket.messages[i];
        
        // If previous message is from user and current from admin (or vice versa)
        if (
          (prevMessage.sender.toString() === ticket.user.toString() && 
           currMessage.sender.toString() !== ticket.user.toString()) ||
          (prevMessage.sender.toString() !== ticket.user.toString() && 
           currMessage.sender.toString() === ticket.user.toString())
        ) {
          const responseTime = new Date(currMessage.createdAt) - new Date(prevMessage.createdAt);
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    });
    
    const averageResponseTime = responseCount > 0 ? 
      Math.round(totalResponseTime / responseCount / (1000 * 60 * 60)) : 0; // in hours
    
    // Prepare response
    const statistics = {
      totalTickets: await SupportTicket.countDocuments(),
      byStatus: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byCategory: categoryCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byPriority: priorityCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      averageResponseTime: `${averageResponseTime}h`, // in hours
      ticketsToday: await SupportTicket.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      resolvedToday: await SupportTicket.countDocuments({
        resolvedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      })
    };
    
    return res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error("Error getting ticket statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error getting ticket statistics",
      error: error.message
    });
  }
};