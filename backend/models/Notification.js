const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['Student', 'Admin', 'Staff']
  },
  type: {
    type: String,
    required: true,
    enum: [
      'complaint_status_changed',
      'complaint_assigned',
      'complaint_updated',
      'new_complaint',
      'complaint_escalated',
      'complaint_feedback',
      'post_liked',
      'post_commented'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Complaint', 'Post', null]
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expireAt: {
    type: Date,
    required: true
    // Student → 30 days, Admin/Staff → 60 days (set in createNotification)
  }
});

// Index for faster queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// TTL index: MongoDB auto-deletes document when current time passes expireAt
notificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
