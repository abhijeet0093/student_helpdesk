const Complaint = require('../models/Complaint');
const Admin = require('../models/Admin');
const Staff = require('../models/Staff');

/**
 * GET ALL COMPLAINTS (Admin Only)
 * GET /api/admin/complaints
 */
const getAllComplaints = async (req, res) => {
  try {
    const { status, category, department } = req.query;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }

    if (department) {
      query.studentDepartment = department;
    }

    // Fetch all complaints
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .select('_id complaintId studentName studentRollNumber studentDepartment category description status imagePath assignedToName createdAt updatedAt');

    // Get statistics
    const statistics = {
      total: await Complaint.countDocuments(),
      pending: await Complaint.countDocuments({ status: 'Pending' }),
      inProgress: await Complaint.countDocuments({ status: 'In Progress' }),
      resolved: await Complaint.countDocuments({ status: 'Resolved' }),
      rejected: await Complaint.countDocuments({ status: 'Rejected' })
    };

    res.status(200).json({
      success: true,
      data: {
        complaints: complaints,
        statistics: statistics
      }
    });

  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints'
    });
  }
};

/**
 * ASSIGN COMPLAINT TO STAFF (Admin Only)
 * POST /api/admin/complaints/:id/assign
 */
const assignComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { staffId, note } = req.body;
    const adminId = req.userId;

    console.log('=== ASSIGN COMPLAINT DEBUG ===');
    console.log('Complaint ID from params:', complaintId);
    console.log('Staff ID from body:', staffId);
    console.log('Admin ID:', adminId);

    // Validate staffId
    if (!staffId) {
      console.error('ERROR: Staff ID is missing');
      return res.status(400).json({
        success: false,
        message: 'Staff ID is required'
      });
    }

    // Validate staffId format (MongoDB ObjectId)
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      console.error('ERROR: Invalid Staff ID format:', staffId);
      return res.status(400).json({
        success: false,
        message: 'Invalid Staff ID format'
      });
    }

    // Find complaint
    console.log('Finding complaint with complaintId:', complaintId);
    const complaint = await Complaint.findOne({ complaintId: complaintId });
    if (!complaint) {
      console.error('ERROR: Complaint not found:', complaintId);
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    console.log('Complaint found:', complaint._id);

    // Find staff member
    console.log('Finding staff with ID:', staffId);
    const staff = await Staff.findById(staffId);
    if (!staff) {
      console.error('ERROR: Staff member not found:', staffId);
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    console.log('Staff found:', staff.name);

    // Get admin details
    const admin = await Admin.findById(adminId);
    if (!admin) {
      console.error('ERROR: Admin not found:', adminId);
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    console.log('Admin found:', admin.username);

    // Update complaint
    complaint.assignedTo = staff._id;
    complaint.assignedToModel = 'Staff';
    complaint.assignedToName = staff.name;
    complaint.status = 'In Progress';
    complaint.lastUpdatedBy = {
      userId: admin._id,
      userModel: 'Admin',
      userName: admin.username,
      timestamp: new Date()
    };

    // Add to status history
    complaint.statusHistory.push({
      status: 'In Progress',
      changedBy: admin._id,
      changedByModel: 'Admin',
      changedByName: admin.username,
      timestamp: new Date(),
      note: note || `Assigned to ${staff.name}`
    });

    console.log('Saving complaint...');
    await complaint.save();
    console.log('Complaint saved successfully');

    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully',
      data: {
        complaintId: complaint.complaintId,
        assignedTo: staff.name,
        status: complaint.status
      }
    });

  } catch (error) {
    console.error('=== ASSIGN COMPLAINT ERROR ===');
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign complaint'
    });
  }
};

/**
 * GET COMPLAINT DETAILS (Admin)
 * GET /api/admin/complaints/:id
 */
const getComplaintDetails = async (req, res) => {
  try {
    const complaintId = req.params.id;

    const complaint = await Complaint.findOne({ complaintId: complaintId });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
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
 * UPDATE COMPLAINT STATUS (Admin)
 * PATCH /api/admin/complaints/:id
 */
async function updateComplaintStatus(req, res) {
  try {
    const complaintId = req.params.id;
    const { status, adminResponse } = req.body;
    const adminId = req.userId;

    // Validate status
    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Find complaint
    const complaint = await Complaint.findOne({ complaintId: complaintId });
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Get admin details
    const admin = await Admin.findById(adminId);

    // Update complaint
    complaint.status = status;
    if (adminResponse) {
      complaint.adminResponse = adminResponse;
    }
    
    complaint.lastUpdatedBy = {
      userId: admin._id,
      userModel: 'Admin',
      userName: admin.username,
      timestamp: new Date()
    };

    // Add to status history
    complaint.statusHistory.push({
      status: status,
      changedBy: admin._id,
      changedByModel: 'Admin',
      changedByName: admin.username,
      timestamp: new Date(),
      note: adminResponse || `Status changed to ${status}`
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      data: {
        complaintId: complaint.complaintId,
        status: complaint.status
      }
    });

  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status'
    });
  }
}

/**
 * GET STAFF LIST (Admin)
 * GET /api/admin/staff
 */
async function getStaffList(req, res) {
  try {
    const { department, active } = req.query;

    // Build query
    const query = {};
    
    if (department) {
      query.department = department;
    }
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    // Fetch staff members
    const staffList = await Staff.find(query)
      .select('name email department designation isActive createdAt')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: staffList.length,
      data: staffList
    });

  } catch (error) {
    console.error('Get staff list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff list'
    });
  }
}

module.exports = {
  getAllComplaints,
  assignComplaint,
  getComplaintDetails,
  updateComplaintStatus,
  getStaffList
};
