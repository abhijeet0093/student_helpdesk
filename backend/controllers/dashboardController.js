const Student = require('../models/Student');
const Complaint = require('../models/Complaint');

/**
 * GET STUDENT DASHBOARD DATA
 * GET /api/student/dashboard
 */
const getDashboardData = async (req, res) => {
  try {
    const studentId = req.userId;

    // Get student basic info
    const student = await Student.findById(studentId)
      .select('fullName rollNumber department semester email');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get complaint statistics
    const totalComplaints = await Complaint.countDocuments({ studentId: studentId });
    
    const complaintsByStatus = {
      pending: await Complaint.countDocuments({ studentId: studentId, status: 'Pending' }),
      inProgress: await Complaint.countDocuments({ studentId: studentId, status: 'In Progress' }),
      resolved: await Complaint.countDocuments({ studentId: studentId, status: 'Resolved' }),
      rejected: await Complaint.countDocuments({ studentId: studentId, status: 'Rejected' })
    };

    // Get latest complaint
    const latestComplaint = await Complaint.findOne({ studentId: studentId })
      .sort({ createdAt: -1 })
      .select('complaintId category status createdAt updatedAt')
      .limit(1);

    // Prepare dashboard data
    const dashboardData = {
      studentInfo: {
        name: student.fullName,
        rollNumber: student.rollNumber,
        department: student.department,
        semester: student.semester,
        email: student.email
      },
      complaintStats: {
        total: totalComplaints,
        byStatus: complaintsByStatus
      },
      recentComplaint: latestComplaint ? {
        complaintId: latestComplaint.complaintId,
        category: latestComplaint.category,
        status: latestComplaint.status,
        createdAt: latestComplaint.createdAt,
        updatedAt: latestComplaint.updatedAt
      } : null
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

module.exports = {
  getDashboardData,
  getStudentDashboard: getDashboardData // Alias for compatibility
};
