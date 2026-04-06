const mongoose = require('mongoose');

const backupLogSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PARTIAL'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  dbBackupPath: {
    type: String,
    default: null
  },
  uploadsBackupPath: {
    type: String,
    default: null
  },
  backupDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Keep only last 30 logs — TTL on createdAt
backupLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('BackupLog', backupLogSchema);
