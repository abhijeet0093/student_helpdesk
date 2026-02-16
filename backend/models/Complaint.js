const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentRollNumber: {
    type: String,
    required: true
  },
  studentDepartment: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Infrastructure', 'Academics', 'Hostel', 'Library', 'Canteen', 'Transport', 'IT Services', 'Sports', 'Other']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  image: {
    type: String,
    default: null
  },
  imagePath: {
    type: String,
    default: null
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'assignedToModel',
    default: null
  },
  assignedToModel: {
    type: String,
    enum: ['Staff', 'Admin'],
    required: false
  },
  assignedToName: {
    type: String,
    default: null
  },
  adminRemarks: {
    type: String,
    default: null
  },
  adminResponse: {
    type: String,
    default: null
  },
  complaintId: {
    type: String,
    unique: true
  },
  lastUpdatedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'lastUpdatedBy.userModel'
    },
    userModel: {
      type: String,
      enum: ['Admin', 'Staff', 'Student']
    },
    userName: String,
    timestamp: Date
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'statusHistory.changedByModel'
    },
    changedByModel: {
      type: String,
      enum: ['Admin', 'Staff', 'Student']
    },
    changedByName: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, {
  timestamps: true
});

// Generate complaint ID before saving
complaintSchema.pre('save', async function(next) {
  if (!this.complaintId) {
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintId = `CMP${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
