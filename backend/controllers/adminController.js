const Complaint = require('../models/Complaint');
const Admin = require('../models/Admin');
const Staff = require('../models/Staff');
const { createNotification } = require('./notificationController');

/**
 * GET ALL COMPLAINTS (Admin Only) with search, filter, analytics, pagination
 * GET /api/admin/complaints
 */
const getAllComplaints = async (req, res) => {
  try {
    const { status, category, department, priority, search, from, to } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const query = {};
    if (status)     query.status = status;
    if (category)   query.category = category;
    if (department) query.studentDepartment = department;
    if (priority)   query.priority = priority;

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to)   query.createdAt.$lte = new Date(to);
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { studentName: regex },
        { studentRollNumber: regex },
        { complaintId: regex },
        { title: regex }
      ];
    }

    // Single aggregation for all status counts — avoids 6 separate DB round-trips
    const [complaints, total, statusCounts, byCategory, byPriority] = await Promise.all([
      Complaint.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('_id complaintId title studentName studentRollNumber studentDepartment category description priority status imagePath assignedToName isEscalated escalatedAt feedback createdAt updatedAt'),

      Complaint.countDocuments(query),

      Complaint.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      Complaint.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    // Map aggregation result to named keys
    const countMap = Object.fromEntries(statusCounts.map(s => [s._id, s.count]));
    const statistics = {
      total:      await Complaint.estimatedDocumentCount(), // fast, no filter
      pending:    countMap['Pending']     || 0,
      inProgress: countMap['In Progress'] || 0,
      resolved:   countMap['Resolved']    || 0,
      rejected:   countMap['Rejected']    || 0,
      escalated:  countMap['Escalated']   || 0
    };

    // Resolution rate — last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [recentTotal, recentResolved] = await Promise.all([
      Complaint.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Complaint.countDocuments({ status: 'Resolved', createdAt: { $gte: thirtyDaysAgo } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        complaints,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        statistics,
        analytics: {
          byCategory,
          byPriority,
          resolutionRate: recentTotal > 0 ? Math.round((recentResolved / recentTotal) * 100) : 0,
          recentTotal,
          recentResolved
        }
      }
    });
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
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

    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Escalated'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const complaint = await Complaint.findOne({ complaintId: complaintId });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const admin = await Admin.findById(adminId);

    complaint.status = status;
    if (adminResponse) complaint.adminResponse = adminResponse;

    complaint.lastUpdatedBy = {
      userId: admin._id,
      userModel: 'Admin',
      userName: admin.username,
      timestamp: new Date()
    };

    complaint.statusHistory.push({
      status,
      changedBy: admin._id,
      changedByModel: 'Admin',
      changedByName: admin.username,
      timestamp: new Date(),
      note: adminResponse || `Status changed to ${status}`
    });

    await complaint.save();

    // Notify student about status change
    await createNotification({
      recipient: complaint.student,
      recipientModel: 'Student',
      type: 'complaint_status_changed',
      title: `Complaint ${status}`,
      message: `Your complaint "${complaint.title}" (${complaint.complaintId}) status changed to ${status}.${adminResponse ? ' Remarks: ' + adminResponse : ''}`,
      relatedId: complaint._id,
      relatedModel: 'Complaint'
    });

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      data: { complaintId: complaint.complaintId, status: complaint.status }
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update complaint status' });
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
      .select('name email phone department designation role isActive createdAt')
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

/**
 * CREATE STAFF (Admin)
 * POST /api/admin/staff
 */
async function createStaff(req, res) {
  try {
    const { name, email, phone, department, password, role } = req.body;

    if (!name || !email || !department || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, department and password are required' });
    }

    const existing = await Staff.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A staff member with this email already exists' });
    }

    const staff = new Staff({ name, email, phone, department, password, role: role || 'staff' });
    await staff.save();

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: { _id: staff._id, name: staff.name, email: staff.email, department: staff.department }
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to create staff member' });
  }
}

/**
 * DELETE STAFF (Admin)
 * DELETE /api/admin/staff/:id
 */
async function deleteStaff(req, res) {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.status(200).json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete staff member' });
  }
}

/**
 * PROMOTE STUDENTS TO NEXT ACADEMIC YEAR (Admin)
 * POST /api/admin/promote-students
 *
 * Rules:
 *   year 1 → year 2
 *   year 2 → year 3
 *   year 3 → status "passed", graduationYear = current year
 */
async function promoteStudents(req, res) {
  try {
    const Student = require('../models/Student');
    const currentYear = new Date().getFullYear();

    // Fetch all active students
    const activeStudents = await Student.find({ status: 'active' });

    if (activeStudents.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active students found to promote.',
        data: { promoted: 0, graduated: 0, total: 0 }
      });
    }

    let promoted  = 0; // year bumped
    let graduated = 0; // moved to passed

    const bulkOps = activeStudents.map(student => {
      if (student.year >= 3) {
        // Graduate
        graduated++;
        return {
          updateOne: {
            filter: { _id: student._id },
            update: {
              $set: {
                status: 'passed',
                graduationYear: currentYear,
                isActive: false
              }
            }
          }
        };
      } else {
        // Promote one year
        promoted++;
        return {
          updateOne: {
            filter: { _id: student._id },
            update: { $inc: { year: 1 } }
          }
        };
      }
    });

    await Student.bulkWrite(bulkOps);

    console.log(`[Promotion] Admin ${req.userId} promoted ${promoted} students, graduated ${graduated} students.`);

    res.status(200).json({
      success: true,
      message: `Promotion complete. ${promoted} student(s) promoted, ${graduated} student(s) graduated.`,
      data: {
        promoted,
        graduated,
        total: activeStudents.length
      }
    });
  } catch (error) {
    console.error('Promote students error:', error);
    res.status(500).json({ success: false, message: 'Failed to promote students' });
  }
}

/**
 * AUTO-ESCALATE COMPLAINTS older than 3 days without resolution (cron job helper)
 * POST /api/admin/escalate-complaints
 */
async function escalateComplaints(req, res) {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const toEscalate = await Complaint.find({
      status: { $in: ['Pending', 'In Progress'] },
      isEscalated: false,
      createdAt: { $lte: threeDaysAgo }
    });

    if (toEscalate.length === 0) {
      return res.status(200).json({ success: true, message: 'No complaints to escalate.', count: 0 });
    }

    const admin = await Admin.findOne();

    for (const complaint of toEscalate) {
      complaint.isEscalated = true;
      complaint.escalatedAt = new Date();
      complaint.status = 'Escalated';
      complaint.statusHistory.push({
        status: 'Escalated',
        changedByName: 'System',
        timestamp: new Date(),
        note: 'Auto-escalated: not resolved within 3 days'
      });
      await complaint.save();

      // Notify admin
      if (admin) {
        await createNotification({
          recipient: admin._id,
          recipientModel: 'Admin',
          type: 'complaint_escalated',
          title: 'Complaint Escalated',
          message: `Complaint ${complaint.complaintId} ("${complaint.title}") by ${complaint.studentName} has been auto-escalated after 3 days without resolution.`,
          relatedId: complaint._id,
          relatedModel: 'Complaint'
        });
      }

      // Notify student
      await createNotification({
        recipient: complaint.student,
        recipientModel: 'Student',
        type: 'complaint_escalated',
        title: 'Complaint Escalated',
        message: `Your complaint "${complaint.title}" (${complaint.complaintId}) has been escalated to admin for priority resolution.`,
        relatedId: complaint._id,
        relatedModel: 'Complaint'
      });
    }

    res.status(200).json({
      success: true,
      message: `${toEscalate.length} complaint(s) escalated.`,
      count: toEscalate.length
    });
  } catch (error) {
    console.error('Escalate complaints error:', error);
    res.status(500).json({ success: false, message: 'Failed to escalate complaints' });
  }
}

/**
 * STORAGE STATS (Admin Only)
 * GET /api/admin/storage-stats
 */
async function getStorageStats(req, res) {
  try {
    const fs = require('fs');
    const path = require('path');
    const mongoose = require('mongoose');
    const Student = require('../models/Student');
    const Post = require('../models/Post');
    const UTResult = require('../models/UTResult');
    const ChatMessage = require('../models/ChatMessage');
    const Notification = require('../models/Notification');

    // DB counts in parallel
    const [users, complaints, posts, results, chatMessages, notifications] = await Promise.all([
      Student.countDocuments(),
      Complaint.countDocuments(),
      Post.countDocuments(),
      UTResult.countDocuments(),
      ChatMessage.countDocuments(),
      Notification.countDocuments()
    ]);

    // MongoDB DB size via dbStats command
    let databaseSizeMB = 0;
    let storageSizeMB = 0;
    try {
      const dbStats = await mongoose.connection.db.stats();
      databaseSizeMB = parseFloat((dbStats.dataSize / (1024 * 1024)).toFixed(2));
      storageSizeMB = parseFloat((dbStats.storageSize / (1024 * 1024)).toFixed(2));
    } catch (_) {
      // Atlas free tier may restrict dbStats — fallback to 0
    }

    // Uploads folder: count files + total size
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    let fileCount = 0;
    let uploadsSizeBytes = 0;

    if (fs.existsSync(uploadsDir)) {
      const walk = (dir) => {
        fs.readdirSync(dir).forEach(file => {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) walk(fullPath);
          else {
            fileCount++;
            uploadsSizeBytes += stat.size;
          }
        });
      };
      walk(uploadsDir);
    }

    const uploadsSizeMB = parseFloat((uploadsSizeBytes / (1024 * 1024)).toFixed(2));

    res.status(200).json({
      success: true,
      data: {
        users,
        complaints,
        posts,
        chatMessages,
        notifications,
        results,
        databaseSizeMB,
        storageSizeMB,
        uploads: {
          totalFiles: fileCount,
          totalSizeMB: uploadsSizeMB
        }
      }
    });
  } catch (error) {
    console.error('Storage stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch storage stats' });
  }
}

/**
 * BACKUP STATUS (Admin Only)
 * GET /api/admin/backup-status
 */
async function getBackupStatus(req, res) {
  try {
    const BackupLog = require('../models/BackupLog');

    const recentBackups = await BackupLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('status message dbBackupPath uploadsBackupPath backupDate createdAt');

    const lastBackup = recentBackups[0] || null;

    // Warn if last backup is older than 24 hours
    const hoursAgo = lastBackup
      ? Math.floor((Date.now() - new Date(lastBackup.createdAt).getTime()) / (1000 * 60 * 60))
      : null;

    res.status(200).json({
      success: true,
      data: {
        lastBackup,
        recentBackups,
        hoursAgo,
        warning: hoursAgo === null || hoursAgo > 24
      }
    });
  } catch (error) {
    console.error('Backup status error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch backup status' });
  }
}

module.exports = {
  getAllComplaints,
  assignComplaint,
  getComplaintDetails,
  updateComplaintStatus,
  getStaffList,
  createStaff,
  deleteStaff,
  promoteStudents,
  escalateComplaints,
  getStorageStats,
  getBackupStatus
};
