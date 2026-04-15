const Complaint = require('../models/Complaint');
const Student   = require('../models/Student');
const Staff     = require('../models/Staff');
const Admin     = require('../models/Admin');

// Whitelist for complaint assignment — prevents dynamic require() path traversal
const ALLOWED_ASSIGNEE_MODELS = { Staff, Admin };

// ── Create Complaint (Student) ────────────────────────────────────────────────
async function createComplaint(req, res) {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }

    // Length guards
    if (title.trim().length > 200) {
      return res.status(400).json({ success: false, message: 'Title must be 200 characters or less' });
    }
    if (description.trim().length > 2000) {
      return res.status(400).json({ success: false, message: 'Description must be 2000 characters or less' });
    }

    const studentId = req.userId;
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.status && student.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Only active students can raise complaints.' });
    }

    const complaintData = {
      student:             studentId,
      studentName:         student.fullName,
      studentRollNumber:   student.rollNumber,
      studentDepartment:   student.department || 'N/A',
      title:               title.trim(),
      description:         description.trim(),
      category,
      priority:            priority || 'medium',
      status:              'Pending'
    };

    // Fix: store image under uploads/images/ (matches multerConfig destination)
    if (req.file) {
      complaintData.image     = `/uploads/images/${req.file.filename}`;
      complaintData.imagePath = `/uploads/images/${req.file.filename}`;
    }

    const complaint = await Complaint.create(complaintData);
    await complaint.populate('student', 'fullName rollNumber email');

    res.status(201).json({ success: true, message: 'Complaint created successfully', data: complaint });
  } catch (error) {
    console.error('Create complaint error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create complaint' });
  }
}

// ── Get Student's Own Complaints ──────────────────────────────────────────────
async function getMyComplaints(req, res) {
  try {
    const studentId = req.userId;
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const complaints = await Complaint.find({ student: studentId })
      .populate('student',    'fullName rollNumber')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    console.error('Get my complaints error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
  }
}

// ── Get Single Complaint by ID ────────────────────────────────────────────────
async function getComplaintById(req, res) {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student',    'fullName rollNumber email')
      .populate('assignedTo', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Students can only view their own complaints
    if (req.role === 'student' && complaint.student._id.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    console.error('Get complaint error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch complaint' });
  }
}

// ── Get All Complaints (Admin only — defense in depth) ────────────────────────
async function getAllComplaints(req, res) {
  try {
    // Defense in depth: enforce admin role inside controller
    if (req.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    }

    const complaints = await Complaint.find()
      .populate('student',    'fullName rollNumber email department')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    console.error('Get all complaints error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
  }
}

// ── Update Complaint Status (Admin/Staff) ─────────────────────────────────────
async function updateComplaintStatus(req, res) {
  try {
    // Defense in depth: only admin or staff
    if (req.role !== 'admin' && req.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { status, adminRemarks } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    // Validate adminRemarks length (max 500 chars)
    if (adminRemarks && adminRemarks.length > 500) {
      return res.status(400).json({ success: false, message: 'Admin remarks must be 500 characters or less' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status;
    if (status === 'Resolved' || status === 'Rejected') {
      complaint.isEscalated  = false;
      complaint.escalatedAt  = null;
    }
    if (adminRemarks) {
      complaint.adminRemarks = adminRemarks.trim();
    }

    await complaint.save();
    await complaint.populate('student',    'fullName rollNumber');
    await complaint.populate('assignedTo', 'name email');

    res.json({ success: true, message: 'Complaint updated successfully', data: complaint });
  } catch (error) {
    console.error('Update complaint error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update complaint' });
  }
}

// ── Assign Complaint to Staff (Admin only) ────────────────────────────────────
async function assignComplaint(req, res) {
  try {
    // Defense in depth: only admin can assign
    if (req.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    }

    const { staffId, assignToModel } = req.body;

    if (!staffId) {
      return res.status(400).json({ success: false, message: 'Staff ID is required' });
    }

    // Strict whitelist — no dynamic require()
    const modelType = assignToModel || 'Staff';
    if (!ALLOWED_ASSIGNEE_MODELS[modelType]) {
      return res.status(400).json({ success: false, message: 'Invalid assignee model. Must be Staff or Admin.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const Model    = ALLOWED_ASSIGNEE_MODELS[modelType];
    const assignee = await Model.findById(staffId);
    if (!assignee) {
      return res.status(404).json({ success: false, message: `${modelType} not found` });
    }

    complaint.assignedTo      = staffId;
    complaint.assignedToModel = modelType;
    complaint.assignedToName  = assignee.name || assignee.fullName;
    complaint.status          = 'In Progress';
    await complaint.save();

    await complaint.populate('student',    'fullName rollNumber');
    await complaint.populate('assignedTo', 'name email');

    res.json({ success: true, message: 'Complaint assigned successfully', data: complaint });
  } catch (error) {
    console.error('Assign complaint error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to assign complaint' });
  }
}

// ── Submit Feedback (Student — resolved complaints only) ──────────────────────
async function submitFeedback(req, res) {
  try {
    const { rating, comment } = req.body;
    const studentId = req.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Validate comment length
    if (comment && comment.length > 500) {
      return res.status(400).json({ success: false, message: 'Comment must be 500 characters or less' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.student.toString() !== studentId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted for resolved complaints' });
    }

    if (complaint.feedback?.rating) {
      return res.status(400).json({ success: false, message: 'Feedback already submitted' });
    }

    complaint.feedback = { rating, comment: comment?.trim() || '', submittedAt: new Date() };
    await complaint.save();

    res.json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
}

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  assignComplaint,
  submitFeedback
};
