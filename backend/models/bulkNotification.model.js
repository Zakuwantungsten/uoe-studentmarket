const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bulkNotificationSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  recipientType: {
    type: String,
    enum: ['all', 'providers', 'customers', 'inactive', 'custom'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'cancelled'],
    default: 'draft'
  },
  notificationType: {
    type: String,
    enum: ['email', 'in-app', 'both'],
    default: 'both'
  },
  customRecipients: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  customFilter: {
    roles: [{
      type: String,
      enum: ['USER', 'PROVIDER', 'ADMIN']
    }],
    departments: [String],
    joinedAfter: Date,
    joinedBefore: Date,
    hasBookings: Boolean,
    hasServices: Boolean
  },
  scheduledFor: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  deliveryStats: {
    total: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Records of individual notifications created from the bulk notification
const bulkNotificationRecordSchema = new Schema({
  bulkNotificationId: {
    type: Schema.Types.ObjectId,
    ref: 'BulkNotification',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notificationId: {
    type: Schema.Types.ObjectId,
    ref: 'Notification'
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'opened'],
    default: 'pending'
  },
  sentAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  openedAt: {
    type: Date
  },
  failureReason: {
    type: String
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
bulkNotificationSchema.index({ status: 1, scheduledFor: 1 });
bulkNotificationSchema.index({ createdBy: 1 });
bulkNotificationSchema.index({ createdAt: -1 });

bulkNotificationRecordSchema.index({ bulkNotificationId: 1 });
bulkNotificationRecordSchema.index({ recipient: 1 });
bulkNotificationRecordSchema.index({ status: 1 });

const BulkNotification = mongoose.model('BulkNotification', bulkNotificationSchema);
const BulkNotificationRecord = mongoose.model('BulkNotificationRecord', bulkNotificationRecordSchema);

module.exports = {
  BulkNotification,
  BulkNotificationRecord
};