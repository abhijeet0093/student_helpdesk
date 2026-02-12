const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * STUDENT SCHEMA
 * 
 * CRITICAL RULES:
 * 1. Field names MUST match exactly in seed files and controllers
 * 2. Password is ALWAYS hashed before saving
 * 3. Never return password in responses
 * 4. Email is always lowercase for consistency
 */

const studentSchema = new mongoose.Schema({
  // Student Name
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },

  // Roll Number - Unique identifier for student
  rollNo: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    uppercase: true // Ensure consistency
  },

  // Enrollment Number - Another unique identifier
  enrollmentNo: {
    type: String,
    required: [true, 'Enrollment number is required'],
    unique: true,
    trim: true,
    uppercase: true // Ensure consistency
  },

  // Department - Restricted to specific values
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: {
      values: ['Computer', 'IT', 'ENTC'],
      message: '{VALUE} is not a valid department. Must be Computer, IT, or ENTC'
    }
  },

  // Year of study
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1, 'Year must be between 1 and 4'],
    max: [4, 'Year must be between 1 and 4']
  },

  // Email - Unique and lowercase
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true, // Always store in lowercase
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },

  // Password - Will be hashed before saving
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  // Role - Default to student
  role: {
    type: String,
    default: 'student',
    enum: ['student']
  },

  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * PRE-SAVE HOOK
 * 
 * WHY: Automatically hash password before saving to database
 * WHEN: Only when password is modified (new or changed)
 * SECURITY: Uses bcrypt with 10 salt rounds
 * 
 * IMPORTANT: This runs for both:
 * - API registration (new students)
 * - Seed file inserts (if using .save())
 */
studentSchema.pre('save', async function(next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * METHOD: Compare Password
 * 
 * WHY: Safely compare plain text password with hashed password
 * USAGE: Used in login controller
 * SECURITY: Never compares plain text directly
 */
studentSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

/**
 * METHOD: To JSON
 * 
 * WHY: Automatically exclude password from JSON responses
 * SECURITY: Password never sent to frontend
 */
studentSchema.methods.toJSON = function() {
  const student = this.toObject();
  delete student.password;
  delete student.__v;
  return student;
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
