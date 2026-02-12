const Complaint = require('../models/Complaint');

// Create Complaint (Student)
async function createComplaint(req, res) {
  try {
    const { title, description, category, priority } = req.body;
    
    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }
    
    // Get user ID from JWT middleware
    const studentId = req.user?.userId || req.userId;
    
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Get student details
    const Student = require('../models/Student');
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
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
    
    // Handle image if uploaded
    if (req.file) {
      complaintData.image = `/uploads/complaints/${req.file.filename}`;
      complaintData.imagePath = `/uploads/complaints/${req.file.filename}`;
    }
    
    // Create complaint
    const complaint = await Complaint.create(complaintData);
    
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
    const studentId = req.user?.userId || req.userId;
    
    const complaints = await Complaint.find({ student: studentId })
      .populate('student', 'fullName rollNumber')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
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
    const { staffId } = req.body;
    
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
    
    complaint.assignedTo = staffId;
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

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  assignComplaint
};
