const UTResult = require('../models/UTResult');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const { analyzePerformance, generateSummary } = require('../utils/performanceAnalyzer');
const { isValidSubjectForSemester, getSubjectsForSemester } = require('../utils/subjectsConfig');

/**
 * ENTER/UPDATE RESULT (Staff Only)
 * POST /api/results
 */
const enterResult = async (req, res) => {
  try {
    const { rollNo, subjectCode, subjectName, department, year, semester, utType, marksObtained, maxMarks } = req.body;
    const staffId = req.userId;

    console.log('=== ENTER RESULT DEBUG ===');
    console.log('Request Body:', req.body);
    console.log('Staff ID:', staffId);

    // Validate required fields
    if (!rollNo) {
      return res.status(400).json({
        success: false,
        message: 'Roll number is required'
      });
    }
    
    if (!subjectCode || !subjectName) {
      return res.status(400).json({
        success: false,
        message: 'Subject code and name are required'
      });
    }
    
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required'
      });
    }
    
    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Year is required'
      });
    }
    
    if (!semester) {
      return res.status(400).json({
        success: false,
        message: 'Semester is required'
      });
    }
    
    if (!utType) {
      return res.status(400).json({
        success: false,
        message: 'UT Type is required'
      });
    }
    
    if (marksObtained === undefined || marksObtained === null || marksObtained === '') {
      return res.status(400).json({
        success: false,
        message: 'Marks obtained is required'
      });
    }
    
    if (!maxMarks) {
      return res.status(400).json({
        success: false,
        message: 'Max marks is required'
      });
    }

    // Validate UT type
    if (!['UT1', 'UT2'].includes(utType)) {
      console.error('Invalid UT type:', utType);
      return res.status(400).json({
        success: false,
        message: 'Invalid UT type. Must be UT1 or UT2'
      });
    }

    // Validate marks
    const marksNum = parseFloat(marksObtained);
    const maxMarksNum = parseFloat(maxMarks);
    
    if (isNaN(marksNum) || marksNum < 0 || marksNum > maxMarksNum) {
      console.error('Invalid marks:', marksObtained, '/', maxMarks);
      return res.status(400).json({
        success: false,
        message: `Marks obtained must be between 0 and ${maxMarksNum}`
      });
    }

    // Validate subject belongs to the specified year and semester
    console.log('Validating subject for Year:', year, 'Semester:', semester);
    const subjectCodeUpper = subjectCode.toString().trim().toUpperCase();
    
    if (!isValidSubjectForSemester(subjectCodeUpper, year, semester)) {
      console.error('Invalid subject for semester:', subjectCodeUpper, 'Year:', year, 'Semester:', semester);
      
      // Get valid subjects for this semester
      const validSubjects = getSubjectsForSemester(year, semester);
      const validSubjectNames = validSubjects.map(s => s.name).join(', ');
      
      return res.status(400).json({
        success: false,
        message: `Subject "${subjectName}" (${subjectCodeUpper}) is not valid for Year ${year}, Semester ${semester}. Valid subjects: ${validSubjectNames}`
      });
    }
    
    console.log('Subject validation passed:', subjectCodeUpper);

    // Find student by roll number (trim and uppercase)
    const rollNoUpper = rollNo.toString().trim().toUpperCase();
    console.log('Looking for student with roll number:', rollNoUpper);
    
    const student = await Student.findOne({ rollNumber: rollNoUpper });
    
    if (!student) {
      console.error('Student not found:', rollNoUpper);
      
      // Check if any students exist
      const studentCount = await Student.countDocuments();
      console.error('Total students in database:', studentCount);
      
      // Show sample students
      const sampleStudents = await Student.find().limit(5).select('rollNumber fullName department');
      console.error('Sample students:', sampleStudents.map(s => `${s.rollNumber} (${s.department})`).join(', '));
      
      return res.status(404).json({
        success: false,
        message: `Student not found with roll number: ${rollNoUpper}. Please check the roll number and ensure the student is registered in the system.`
      });
    }

    console.log('Student found:', student.rollNumber, '-', student.fullName, '-', student.department);

    // Find or create subject (subject code already validated above)
    console.log('Looking for subject:', subjectCodeUpper);
    
    let subject = await Subject.findOne({ subjectCode: subjectCodeUpper });
    
    if (!subject) {
      console.log('Subject not found, creating new subject...');
      // Create subject if not exists
      subject = await Subject.create({
        subjectCode: subjectCodeUpper,
        subjectName: subjectName.trim(),
        department: department.trim(),
        year: parseInt(year) // Subject model requires year field
      });
      console.log('Subject created:', subject.subjectCode);
    } else {
      console.log('Subject found:', subject.subjectCode, '-', subject.subjectName);
    }

    // Check if result already exists
    const existingResult = await UTResult.findOne({
      studentId: student._id,
      subjectId: subject._id,
      utType: utType
    });

    if (existingResult) {
      console.log('Result already exists, updating...');
      // Update existing result
      existingResult.marksObtained = parseFloat(marksObtained);
      existingResult.maxMarks = parseFloat(maxMarks);
      existingResult.semester = parseInt(semester);
      existingResult.year = parseInt(year);
      existingResult.department = department.trim();
      existingResult.subjectName = subjectName.trim();
      existingResult.enteredBy = staffId;
      existingResult.enteredByModel = 'Staff';
      existingResult.isReleased = false; // Reset release status on update
      await existingResult.save();

      console.log('Result updated successfully');
      return res.status(200).json({
        success: true,
        message: 'Result updated successfully',
        data: {
          rollNo: existingResult.rollNo,
          subjectName: existingResult.subjectName,
          utType: existingResult.utType,
          marksObtained: existingResult.marksObtained,
          maxMarks: existingResult.maxMarks,
          percentage: existingResult.percentage.toFixed(2)
        }
      });
    }

    // Create new result
    console.log('Creating new result...');
    const result = await UTResult.create({
      studentId: student._id,
      rollNo: student.rollNumber,
      department: department.trim(),
      year: parseInt(year),
      semester: parseInt(semester),
      subjectId: subject._id,
      subjectCode: subject.subjectCode,
      subjectName: subjectName.trim(),
      utType: utType,
      marksObtained: parseFloat(marksObtained),
      maxMarks: parseFloat(maxMarks),
      enteredBy: staffId,
      enteredByModel: 'Staff',
      isReleased: false
    });

    console.log('Result created successfully:', result._id);

    res.status(201).json({
      success: true,
      message: 'Result entered successfully',
      data: {
        rollNo: result.rollNo,
        subjectName: result.subjectName,
        utType: result.utType,
        marksObtained: result.marksObtained,
        maxMarks: result.maxMarks,
        percentage: result.percentage.toFixed(2)
      }
    });

  } catch (error) {
    console.error('=== ENTER RESULT ERROR ===');
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Result already exists for this student, subject, and UT type'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to enter result'
    });
  }
};

/**
 * GET MY RESULTS (Student - Only Released)
 * GET /api/results/my
 */
const getMyResults = async (req, res) => {
  try {
    const studentId = req.userId;

    // Get only released results for student
    const results = await UTResult.find({ 
      studentId: studentId,
      isReleased: true 
    }).sort({ subjectName: 1, utType: 1 });

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No results released yet',
        data: {
          results: [],
          summary: null,
          analysis: null
        }
      });
    }

    // Group results by subject
    const subjectMap = new Map();
    
    results.forEach(result => {
      if (!subjectMap.has(result.subjectCode)) {
        subjectMap.set(result.subjectCode, {
          subjectCode: result.subjectCode,
          subjectName: result.subjectName,
          ut1: null,
          ut2: null
        });
      }

      const subject = subjectMap.get(result.subjectCode);
      
      if (result.utType === 'UT1') {
        subject.ut1 = {
          marksObtained: result.marksObtained,
          maxMarks: result.maxMarks,
          percentage: result.percentage.toFixed(2)
        };
      } else if (result.utType === 'UT2') {
        subject.ut2 = {
          marksObtained: result.marksObtained,
          maxMarks: result.maxMarks,
          percentage: result.percentage.toFixed(2)
        };
      }
    });

    // Convert map to array
    const groupedResults = Array.from(subjectMap.values());

    // Calculate totals
    const ut1Results = results.filter(r => r.utType === 'UT1');
    const ut2Results = results.filter(r => r.utType === 'UT2');

    const ut1Total = ut1Results.reduce((sum, r) => sum + r.marksObtained, 0);
    const ut1MaxTotal = ut1Results.reduce((sum, r) => sum + r.maxMarks, 0);
    const ut1Percentage = ut1MaxTotal > 0 ? ((ut1Total / ut1MaxTotal) * 100).toFixed(2) : 0;

    const ut2Total = ut2Results.reduce((sum, r) => sum + r.marksObtained, 0);
    const ut2MaxTotal = ut2Results.reduce((sum, r) => sum + r.maxMarks, 0);
    const ut2Percentage = ut2MaxTotal > 0 ? ((ut2Total / ut2MaxTotal) * 100).toFixed(2) : 0;

    const summary = {
      ut1: {
        totalMarks: ut1Total,
        maxMarks: ut1MaxTotal,
        percentage: ut1Percentage,
        subjectsCount: ut1Results.length
      },
      ut2: {
        totalMarks: ut2Total,
        maxMarks: ut2MaxTotal,
        percentage: ut2Percentage,
        subjectsCount: ut2Results.length
      }
    };

    // Perform analysis if both UT results exist
    let analysis = null;
    if (ut1Results.length > 0 && ut2Results.length > 0) {
      analysis = analyzePerformance(ut1Results, ut2Results);
      analysis.textSummary = generateSummary(analysis);
    }

    res.status(200).json({
      success: true,
      data: {
        results: groupedResults,
        summary: summary,
        analysis: analysis
      }
    });

  } catch (error) {
    console.error('Get my results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results'
    });
  }
};

/**
 * GET STUDENT RESULTS (Admin)
 * GET /api/results/student/:rollNo
 */
const getStudentResults = async (req, res) => {
  try {
    const { rollNo } = req.params;

    // Find student
    const student = await Student.findOne({ rollNumber: rollNo.toUpperCase() });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get all results for student
    const results = await UTResult.find({ studentId: student._id })
      .sort({ subjectName: 1, utType: 1 });

    // Group results by subject
    const subjectMap = new Map();
    
    results.forEach(result => {
      if (!subjectMap.has(result.subjectCode)) {
        subjectMap.set(result.subjectCode, {
          subjectCode: result.subjectCode,
          subjectName: result.subjectName,
          ut1: null,
          ut2: null
        });
      }

      const subject = subjectMap.get(result.subjectCode);
      
      if (result.utType === 'UT1') {
        subject.ut1 = {
          marksObtained: result.marksObtained,
          maxMarks: result.maxMarks,
          percentage: result.percentage.toFixed(2)
        };
      } else if (result.utType === 'UT2') {
        subject.ut2 = {
          marksObtained: result.marksObtained,
          maxMarks: result.maxMarks,
          percentage: result.percentage.toFixed(2)
        };
      }
    });

    const groupedResults = Array.from(subjectMap.values());

    res.status(200).json({
      success: true,
      data: {
        studentInfo: {
          rollNo: student.rollNumber,
          name: student.fullName,
          department: student.department
        },
        results: groupedResults
      }
    });

  } catch (error) {
    console.error('Get student results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student results'
    });
  }
};

/**
 * GET STAFF RESULTS (Staff Only - Not Released)
 * GET /api/results/staff
 */
const getStaffResults = async (req, res) => {
  try {
    const { semester, department, utType } = req.query;

    const query = { isReleased: false };
    
    if (semester) query.semester = parseInt(semester);
    if (department) query.department = department;
    if (utType) query.utType = utType;

    const results = await UTResult.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('Get staff results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results'
    });
  }
};

/**
 * GET ADMIN RESULTS (Admin Only - All Results)
 * GET /api/results/admin
 */
const getAdminResults = async (req, res) => {
  try {
    const { semester, department, utType, isReleased } = req.query;

    const query = {};
    
    if (semester) query.semester = parseInt(semester);
    if (department) query.department = department;
    if (utType) query.utType = utType;
    if (isReleased !== undefined) query.isReleased = isReleased === 'true';

    const results = await UTResult.find(query)
      .sort({ createdAt: -1 });

    // Get statistics
    const stats = {
      total: results.length,
      released: results.filter(r => r.isReleased).length,
      draft: results.filter(r => !r.isReleased).length,
      ut1: results.filter(r => r.utType === 'UT1').length,
      ut2: results.filter(r => r.utType === 'UT2').length
    };

    res.status(200).json({
      success: true,
      data: {
        results: results,
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Get admin results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results'
    });
  }
};

/**
 * RELEASE RESULTS (Admin Only)
 * PUT /api/results/release
 */
const releaseResults = async (req, res) => {
  try {
    const { semester, utType, department } = req.body;
    const adminId = req.userId;

    if (!semester || !utType) {
      return res.status(400).json({
        success: false,
        message: 'Semester and UT Type are required'
      });
    }

    const query = {
      semester: parseInt(semester),
      utType: utType,
      isReleased: false
    };

    if (department) {
      query.department = department;
    }

    // Find results to release
    const resultsToRelease = await UTResult.find(query);

    if (resultsToRelease.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No unreleased results found for the specified criteria'
      });
    }

    // Update all matching results
    const updateResult = await UTResult.updateMany(
      query,
      {
        $set: {
          isReleased: true,
          releasedBy: adminId,
          releasedAt: new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      message: `Successfully released ${updateResult.modifiedCount} results`,
      data: {
        releasedCount: updateResult.modifiedCount,
        semester: semester,
        utType: utType,
        department: department || 'All'
      }
    });

  } catch (error) {
    console.error('Release results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to release results'
    });
  }
};

/**
 * GET SUBJECTS FOR SEMESTER
 * GET /api/results/subjects/:year/:semester
 */
const getSubjectsForSemesterAPI = async (req, res) => {
  try {
    const { year, semester } = req.params;

    console.log('Getting subjects for Year:', year, 'Semester:', semester);

    const subjects = getSubjectsForSemester(year, semester);

    if (subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No subjects found for Year ${year}, Semester ${semester}`
      });
    }

    res.status(200).json({
      success: true,
      data: subjects
    });

  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects'
    });
  }
};

module.exports = {
  enterResult,
  getMyResults,
  getStudentResults,
  getStaffResults,
  getAdminResults,
  releaseResults,
  getSubjectsForSemesterAPI
};
