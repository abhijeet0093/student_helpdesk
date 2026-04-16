const Complaint = require('../models/Complaint');
const Staff = require('../models/Staff');

/**
 * GET ASSIGNED COMPLAINTS (Staff Only)
 * GET /api/staff/complaints
 */
const getAssignedComplaints = async (req, res) => {
  try {
    const staffId = req.userId;
    const { status } = req.query;

    // Build query - only assigned complaints
    const query = { 
      assignedTo: staffId,
      assignedToModel: 'Staff'
    };
    
    if (status) {
      query.status = status;
    }

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('complaintId studentName studentRollNumber studentDepartment category description status imagePath createdAt updatedAt'),
      Complaint.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        complaints,
        total,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    });

  } catch (error) {
    console.error('Get assigned complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints'
    });
  }
};

/**
 * GET SINGLE COMPLAINT DETAILS (Staff - Only Assigned)
 * GET /api/staff/complaints/:id
 */
const getComplaintDetails = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const staffId = req.userId;

    const complaint = await Complaint.findOne({
      complaintId: complaintId,
      assignedTo: staffId,
      assignedToModel: 'Staff'
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found or not assigned to you'
      });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });

  } catch (error) {
    console.error('Get complaint details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint details'
    });
  }
};

/**
 * UPDATE COMPLAINT STATUS (Staff - Only Assigned)
 * PATCH /api/staff/complaints/:id/status
 */
const updateComplaintStatus = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { status, remark } = req.body;
    const staffId = req.userId;

    // Validate status
    const validStatuses = ['In Progress', 'Resolved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Find complaint - must be assigned to this staff
    const complaint = await Complaint.findOne({
      complaintId: complaintId,
      assignedTo: staffId,
      assignedToModel: 'Staff'
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found or not assigned to you'
      });
    }

    // Get staff details
    const staff = await Staff.findById(staffId);

    // Update complaint
    complaint.status = status;
    if (remark) {
      complaint.adminRemark = remark;
    }

    complaint.lastUpdatedBy = {
      userId: staff._id,
      userModel: 'Staff',
      userName: staff.name,
      timestamp: new Date()
    };

    // Add to status history
    complaint.statusHistory.push({
      status: status,
      changedBy: staff._id,
      changedByModel: 'Staff',
      changedByName: staff.name,
      timestamp: new Date(),
      note: remark || `Status changed to ${status}`
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      data: {
        complaintId: complaint.complaintId,
        status: complaint.status,
        updatedAt: complaint.updatedAt
      }
    });

  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status'
    });
  }
};

module.exports = {
  getAssignedComplaints,
  getComplaintDetails,
  updateComplaintStatus
};
