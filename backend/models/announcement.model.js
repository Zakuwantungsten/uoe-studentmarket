const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const announcementSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  displayLocation: {
    type: String,
    enum: ['all', 'dashboard', 'services', 'booking', 'profile'],
    default: 'all'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
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

// Index to query active announcements
announcementSchema.index({ status: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);