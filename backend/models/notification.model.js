const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['booking', 'message', 'review', 'payment', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking'
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service'
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    },
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  }
}, {
  timestamps: true
});

// Index for querying notifications by recipient and read status
notificationSchema.index({ recipient: 1, read: 1 });
// Index for sorting by creation date
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);