const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    default: null,
    uppercase: true,
    trim: true,
    sparse: true, // allows multiple null values with unique index
    validate: {
      validator: function(v) {
        if (!v) return true; // null is allowed (pre-registered, not yet activated)
        // Accept any alphanumeric roll number (MSBTE, numeric, or custom formats)
        return /^[A-Z0-9]{2,20}$/.test(v);
      },
      message: 'Invalid roll number format'
    }
  },
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    default: null,
    lowercase: true,
    trim: true,
    sparse: true
  },
  password: {
    type: String,
    default: null,   // null until student self-activates
    minlength: 8
  },
  department: {
    type: String,
    required: true
  },
  course: {
    type: String,
    default: null,
    enum: {
      values: [null, 'Computer Engineering', 'Information Technology', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering'],
      message: 'Invalid course. Must be one of the allowed courses.'
    }
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4  // Diploma is 3 years, Degree is 4 years
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8  // Up to 8 semesters for degree programs
  },
  // Self-activation flag — false until student sets their own password
  isActivated: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: 'student',
    immutable: true
  },
  status: {
    type: String,
    enum: ['active', 'passed', 'archived'],
    default: 'active'
  },
  graduationYear: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving — only when password is set and modified
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
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

studentSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

studentSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model('Student', studentSchema);
