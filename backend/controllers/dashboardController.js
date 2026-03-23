const Student = require('../models/Student');
const Complaint = require('../models/Complaint');
const UTResult = require('../models/UTResult');

/**
 * GET STUDENT DASHBOARD DATA
 * GET /api/student/dashboard
 */
const getDashboardData = async (req, res) => {
  try {
    const studentId = req.userId;

    // Get student basic info
    const student = await Student.findById(studentId)
      .select('fullName rollNumber department semester year email');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get complaint statistics
    const totalComplaints = await Complaint.countDocuments({ student: studentId });
    
    const complaintsByStatus = {
      pending: await Complaint.countDocuments({ student: studentId, status: 'Pending' }),
      inProgress: await Complaint.countDocuments({ student: studentId, status: 'In Progress' }),
      resolved: await Complaint.countDocuments({ student: studentId, status: 'Resolved' }),
      rejected: await Complaint.countDocuments({ student: studentId, status: 'Rejected' })
    };

    // Get latest complaint
    const latestComplaint = await Complaint.findOne({ student: studentId })
      .sort({ createdAt: -1 })
      .select('complaintId category status createdAt updatedAt')
      .limit(1);

    // Get UT Results for current semester analytics
    let utAnalytics = null;
    
    if (student.year && student.semester) {
      // Fetch UT results for current semester only
      const ut1Results = await UTResult.find({
        studentId: studentId,
        year: student.year,
        semester: student.semester,
        utType: 'UT1',
        isReleased: true
      }).select('subjectName subjectCode marksObtained maxMarks percentage');

      const ut2Results = await UTResult.find({
        studentId: studentId,
        year: student.year,
        semester: student.semester,
        utType: 'UT2',
        isReleased: true
      }).select('subjectName subjectCode marksObtained maxMarks percentage');

      // Calculate analytics if results exist
      if (ut1Results.length > 0 || ut2Results.length > 0) {
        utAnalytics = calculateUTAnalytics(ut1Results, ut2Results);
      }
    }

    // Prepare dashboard data
    const dashboardData = {
      studentInfo: {
        name: student.fullName,
        rollNumber: student.rollNumber,
        department: student.department,
        semester: student.semester,
        year: student.year,
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
      } : null,
      utAnalytics: utAnalytics
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

/**
 * Calculate UT Analytics from results
 */
const calculateUTAnalytics = (ut1Results, ut2Results) => {
  const analytics = {
    ut1: null,
    ut2: null,
    comparison: null
  };

  // Calculate UT1 Analytics
  if (ut1Results.length > 0) {
    const totalMarks = ut1Results.reduce((sum, result) => sum + result.marksObtained, 0);
    const totalMaxMarks = ut1Results.reduce((sum, result) => sum + result.maxMarks, 0);
    const averagePercentage = ut1Results.reduce((sum, result) => sum + result.percentage, 0) / ut1Results.length;
    
    const sortedByMarks = [...ut1Results].sort((a, b) => b.percentage - a.percentage);
    
    analytics.ut1 = {
      totalSubjects: ut1Results.length,
      totalMarks: totalMarks,
      totalMaxMarks: totalMaxMarks,
      overallPercentage: ((totalMarks / totalMaxMarks) * 100).toFixed(2),
      averagePercentage: averagePercentage.toFixed(2),
      highestSubject: {
        name: sortedByMarks[0].subjectName,
        code: sortedByMarks[0].subjectCode,
        marks: sortedByMarks[0].marksObtained,
        maxMarks: sortedByMarks[0].maxMarks,
        percentage: sortedByMarks[0].percentage.toFixed(2)
      },
      lowestSubject: {
        name: sortedByMarks[sortedByMarks.length - 1].subjectName,
        code: sortedByMarks[sortedByMarks.length - 1].subjectCode,
        marks: sortedByMarks[sortedByMarks.length - 1].marksObtained,
        maxMarks: sortedByMarks[sortedByMarks.length - 1].maxMarks,
        percentage: sortedByMarks[sortedByMarks.length - 1].percentage.toFixed(2)
      },
      performanceIndicator: getPerformanceIndicator(averagePercentage)
    };
  }

  // Calculate UT2 Analytics
  if (ut2Results.length > 0) {
    const totalMarks = ut2Results.reduce((sum, result) => sum + result.marksObtained, 0);
    const totalMaxMarks = ut2Results.reduce((sum, result) => sum + result.maxMarks, 0);
    const averagePercentage = ut2Results.reduce((sum, result) => sum + result.percentage, 0) / ut2Results.length;
    
    const sortedByMarks = [...ut2Results].sort((a, b) => b.percentage - a.percentage);
    
    analytics.ut2 = {
      totalSubjects: ut2Results.length,
      totalMarks: totalMarks,
      totalMaxMarks: totalMaxMarks,
      overallPercentage: ((totalMarks / totalMaxMarks) * 100).toFixed(2),
      averagePercentage: averagePercentage.toFixed(2),
      highestSubject: {
        name: sortedByMarks[0].subjectName,
        code: sortedByMarks[0].subjectCode,
        marks: sortedByMarks[0].marksObtained,
        maxMarks: sortedByMarks[0].maxMarks,
        percentage: sortedByMarks[0].percentage.toFixed(2)
      },
      lowestSubject: {
        name: sortedByMarks[sortedByMarks.length - 1].subjectName,
        code: sortedByMarks[sortedByMarks.length - 1].subjectCode,
        marks: sortedByMarks[sortedByMarks.length - 1].marksObtained,
        maxMarks: sortedByMarks[sortedByMarks.length - 1].maxMarks,
        percentage: sortedByMarks[sortedByMarks.length - 1].percentage.toFixed(2)
      },
      performanceIndicator: getPerformanceIndicator(averagePercentage)
    };
  }

  // Calculate comparison if both UT1 and UT2 exist
  if (analytics.ut1 && analytics.ut2) {
    const improvement = (parseFloat(analytics.ut2.overallPercentage) - parseFloat(analytics.ut1.overallPercentage)).toFixed(2);
    
    analytics.comparison = {
      improvement: improvement,
      status: improvement > 0 ? 'Improved' : improvement < 0 ? 'Declined' : 'Same',
      message: improvement > 0 
        ? `Performance improved by ${Math.abs(improvement)}%` 
        : improvement < 0 
        ? `Performance declined by ${Math.abs(improvement)}%`
        : 'Performance remained the same'
    };
  }

  return analytics;
};

/**
 * Get performance indicator based on percentage
 */
const getPerformanceIndicator = (percentage) => {
  if (percentage >= 75) return 'Excellent';
  if (percentage >= 60) return 'Good';
  if (percentage >= 50) return 'Average';
  return 'Needs Improvement';
};

module.exports = {
  getDashboardData,
  getStudentDashboard: getDashboardData // Alias for compatibility
};
