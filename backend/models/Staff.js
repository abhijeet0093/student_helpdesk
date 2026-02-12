const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Staff Schema
 * Separate collection for staff authentication
 */
const staffSchema = new mongoose.Schema({
  // Core Identity
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  
  // Profile
  department: {
    type: String,
    required: true
  },
  
  // Role (fixed)
  role: {
    type: String,
    default: 'staff',
    immutable: true
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Security
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  
  // Timestamps
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
staffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
staffSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to check if account is locked
staffSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model('Staff', staffSchema);
