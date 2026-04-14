const mongoose = require('mongoose');

/**
 * MSBTEResult Schema — Structured Format
 * One document per student per semester.
 * Stores all subject marks + final semester percentage in a single record.
 * Hidden from students until admin approves (status: 'approved').
 */

const subjectMarkSchema = new mongoose.Schema({
  code:         { type: String, required: true, uppercase: true, trim: true },
  name:         { type: String, required: true, trim: true },
  // Legacy single-marks field kept for backward compatibility
  marks:        { type: Number, default: null, min: 0 },
  // New: theory + practical breakdown
  theoryMarks:  { type: Number, default: null, min: 0 },
  practicalMarks: { type: Number, default: null, min: 0 },
  totalMarks:   { type: Number, default: null, min: 0 },
  // Max marks from marking scheme (stored for display)
  theoryMax:    { type: Number, default: null },
  practicalMax: { type: Number, default: null },
  totalMax:     { type: Number, default: null },
}, { _id: false });

const msbteResultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true,
  },
  rollNo: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  department: { type: String, required: true },
  year:       { type: Number, required: true, min: 1, max: 3 },
  semester:   { type: Number, required: true, min: 1, max: 6, index: true },

  // All subject marks for this semester (compulsory + chosen elective)
  subjects: {
    type: [subjectMarkSchema],
    required: true,
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'At least one subject is required',
    },
  },

  // The elective chosen for this semester (null for sems 1–4)
  elective: {
    type: new mongoose.Schema(
      { code: { type: String, uppercase: true, trim: true },
        name: { type: String, trim: true } },
      { _id: false }
    ),
    default: null,
  },

  // Staff-entered overall semester percentage (official MSBTE figure)
  finalPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },

  // Computed grade from finalPercentage
  grade: { type: String, default: null },

  // Approval workflow
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },

  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null,
  },
  approvedAt:     { type: Date, default: null },
  rejectedReason: { type: String, default: null },

}, { timestamps: true });

// One result per student per semester — no duplicates
msbteResultSchema.index({ studentId: 1, semester: 1 }, { unique: true });

// Compute grade from finalPercentage before save
msbteResultSchema.pre('save', function (next) {
  const p = this.finalPercentage;
  if      (p >= 75) this.grade = 'Distinction';
  else if (p >= 60) this.grade = 'First Class';
  else if (p >= 45) this.grade = 'Second Class';
  else if (p >= 35) this.grade = 'Pass';
  else               this.grade = 'Fail';
  next();
});

module.exports = mongoose.model('MSBTEResult', msbteResultSchema);
