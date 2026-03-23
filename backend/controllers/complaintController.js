const Complaint = require('../models/Complaint');

// Create Complaint (Student)
async function createComplaint(req, res) {
  try {
    const { title, description, category, priority } = req.body;
    
    console.log('=== CREATE COMPLAINT DEBUG ===');
    console.log('Request body:', { title, description, category, priority });
    
    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }
    
    // Get user ID from JWT middleware
    console.log('req.user:', req.user);
    console.log('req.userId:', req.userId);
    
    const studentId = req.user?.userId || req.userId;
    console.log('Extracted studentId:', studentId);
    
    if (!studentId) {
      console.error('❌ No studentId found!');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Get student details
    const Student = require('../models/Student');
    const student = await Student.findById(studentId);
    
    if (!student) {
      console.error('❌ Student not found with ID:', studentId);
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    console.log('✅ Student found:', student.fullName, student.rollNumber);

    // Only active students can raise complaints
    if (student.status && student.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Only active students can raise complaints.'
      });
    }
    
    // Create complaint data
    const complaintData = {
      student: studentId,
      studentName: student.fullName,
      studentRollNumber: student.rollNumber,
      studentDepartment: student.department || 'N/A',
      title: title.trim(),
      description: description.trim(),
      category,
      priority: priority || 'medium',
      status: 'Pending'
    };
    
    console.log('Complaint data to save:', complaintData);
    
    // Handle image if uploaded
    if (req.file) {
      complaintData.image = `/uploads/complaints/${req.file.filename}`;
      complaintData.imagePath = `/uploads/complaints/${req.file.filename}`;
    }
    
    // Create complaint
    const complaint = await Complaint.create(complaintData);
    console.log('✅ Complaint created with _id:', complaint._id);
    console.log('   student field:', complaint.student);
    
    // Populate student details
    await complaint.populate('student', 'fullName rollNumber email');
    
    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create complaint'
    });
  }
}

// Get Student's Own Complaints
async function getMyComplaints(req, res) {
  try {
    // Debug logging
    console.log('=== GET MY COMPLAINTS DEBUG ===');
    console.log('req.user:', req.user);
    console.log('req.userId:', req.userId);
    console.log('req.role:', req.role);
    
    const studentId = req.user?.userId || req.userId;
    console.log('Extracted studentId:', studentId);
    
    if (!studentId) {
      console.error('❌ No studentId found!');
      return res.status(401).json({
        success: false,
        message: 'Student ID not found in request'
      });
    }
    
    console.log('Querying complaints with filter:', { student: studentId });
    
    const complaints = await Complaint.find({ student: studentId })
      .populate('student', 'fullName rollNumber')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${complaints.length} complaints`);
    if (complaints.length > 0) {
      console.log('First complaint:', {
        id: complaints[0]._id,
        title: complaints[0].title,
        student: complaints[0].student,
        status: complaints[0].status
      });
    }
    
    res.json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error('Get my complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints'
    });
  }
}

// Get Single Complaint by ID
async function getComplaintById(req, res) {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'fullName rollNumber email')
      .populate('assignedTo', 'name email');
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Check if student owns this complaint
    const studentId = req.user?.userId || req.userId;
    const userRole = req.user?.role || req.role;
    
    if (userRole === 'student' && complaint.student._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint'
    });
  }
}

// Get All Complaints (Admin)
async function getAllComplaints(req, res) {
  try {
    const complaints = await Complaint.find()
      .populate('student', 'fullName rollNumber email department')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints'
    });
  }
}

// Update Complaint Status (Admin/Staff)
async function updateComplaintStatus(req, res) {
  try {
    const { status, adminRemarks } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    complaint.status = status;
    if (adminRemarks) {
      complaint.adminRemarks = adminRemarks;
    }
    
    await complaint.save();
    
    // Populate for response
    await complaint.populate('student', 'fullName rollNumber');
    await complaint.populate('assignedTo', 'name email');
    
    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint'
    });
  }
}

// Assign Complaint to Staff (Admin)
async function assignComplaint(req, res) {
  try {
    const { staffId, assignToModel } = req.body;
    
    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'Staff ID is required'
      });
    }
    
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Determine the model type (Staff or Admin)
    const modelType = assignToModel || 'Staff';
    
    // Verify the staff/admin exists
    const Model = require(`../models/${modelType}`);
    const assignee = await Model.findById(staffId);
    
    if (!assignee) {
      return res.status(404).json({
        success: false,
        message: `${modelType} not found`
      });
    }
    
    complaint.assignedTo = staffId;
    complaint.assignedToModel = modelType;
    complaint.assignedToName = assignee.name || assignee.fullName;
    complaint.status = 'In Progress';
    await complaint.save();
    
    await complaint.populate('student', 'fullName rollNumber');
    await complaint.populate('assignedTo', 'name email');
    
    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign complaint'
    });
  }
}

// Submit feedback for a resolved complaint (Student)
async function submitFeedback(req, res) {
  try {
    const { rating, comment } = req.body;
    const studentId = req.user?.userId || req.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
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

    complaint.feedback = { rating, comment: comment || '', submittedAt: new Date() };
    await complaint.save();

    res.json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
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
