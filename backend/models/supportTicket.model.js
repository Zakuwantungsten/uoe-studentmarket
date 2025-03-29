const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the message schema for conversations within a support ticket
const ticketMessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    type: String // URLs to attachments
  }],
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const supportTicketSchema = new Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Technical Issues', 'Billing', 'Account', 'Service Issues', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  messages: [ticketMessageSchema],
  lastResponseBy: {
    type: String,
    enum: ['User', 'Admin'],
  },
  lastResponseAt: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Function to generate the next ticket ID
supportTicketSchema.statics.generateTicketId = async function() {
  const latestTicket = await this.findOne().sort('-createdAt');
  
  if (!latestTicket || !latestTicket.ticketId) {
    return 'TK1000'; // Starting ticket ID
  }
  
  // Extract the numeric part and increment
  const currentId = latestTicket.ticketId;
  const numericPart = parseInt(currentId.replace(/[^0-9]/g, ''));
  const nextId = `TK${numericPart + 1}`;
  
  return nextId;
};

// Indexes for efficient querying
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ user: 1 });
supportTicketSchema.index({ assignedTo: 1 });
supportTicketSchema.index({ category: 1 });
supportTicketSchema.index({ createdAt: -1 });
supportTicketSchema.index({ lastResponseAt: -1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);