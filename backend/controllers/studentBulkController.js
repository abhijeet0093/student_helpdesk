const XLSX = require('xlsx');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

/**
 * BULK UPLOAD STUDENTS FROM EXCEL (Admin Only)
 * POST /api/admin/students/bulk-upload
 */
const bulkUploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an Excel file'
      });
    }

    // Read Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty'
      });
    }

    const results = {
      success: [],
      failed: [],
      total: data.length
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Validate required fields
        if (!row.rollNumber || !row.fullName || !row.enrollmentNumber) {
          results.failed.push({
            row: i + 2, // Excel row number (1-indexed + header)
            data: row,
            error: 'Missing required fields (rollNumber, fullName, enrollmentNumber)'
          });
          continue;
        }

        // Extract department from roll number (e.g., CS2021001 -> Computer)
        const rollNo = row.rollNumber.toString().toUpperCase();
        let department = 'General';
        
        if (rollNo.startsWith('CS')) department = 'Computer';
        else if (rollNo.startsWith('IT')) department = 'IT';
        else if (rollNo.startsWith('ENTC')) department = 'ENTC';
        else if (rollNo.startsWith('MECH')) department = 'Mechanical';
        else if (rollNo.startsWith('CIVIL')) department = 'Civil';

        // Generate default password (can be roll number or custom)
        const defaultPassword = row.password || 'student123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Generate email
        const email = row.email || `${rollNo.toLowerCase()}@student.college.edu`;

        // Check if student already exists
        const existingStudent = await Student.findOne({ 
          $or: [
            { rollNumber: rollNo },
            { enrollmentNumber: row.enrollmentNumber }
          ]
        });

        if (existingStudent) {
          results.failed.push({
            row: i + 2,
            data: row,
            error: 'Student already exists'
          });
          continue;
        }

        // Create student
        const student = await Student.create({
          rollNumber: rollNo,
          enrollmentNumber: row.enrollmentNumber,
          fullName: row.fullName,
          email: email,
          password: hashedPassword,
          department: department,
          semester: row.semester || 1,
          year: row.year || 1,
          dateOfBirth: row.dateOfBirth || new Date('2000-01-01'),
          mobileNumber: row.mobileNumber || '',
          address: row.address || '',
          role: 'student',
          isActive: true
        });

        results.success.push({
          row: i + 2,
          rollNumber: student.rollNumber,
          fullName: student.fullName,
          email: student.email
        });

      } catch (error) {
        results.failed.push({
          row: i + 2,
          data: row,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${results.total} records. Success: ${results.success.length}, Failed: ${results.failed.length}`,
      data: results
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process Excel file',
      error: error.message
    });
  }
};

/**
 * DOWNLOAD SAMPLE EXCEL TEMPLATE
 * GET /api/admin/students/template
 */
const downloadTemplate = async (req, res) => {
  try {
    // Create sample data
    const sampleData = [
      {
        rollNumber: 'CS2021001',
        enrollmentNumber: 'EN2021CS001',
        fullName: 'John Doe',
        email: 'cs2021001@student.college.edu',
        password: 'student123',
        department: 'Computer',
        semester: 3,
        year: 2,
        dateOfBirth: '2000-01-15',
        mobileNumber: '9876543210',
        address: 'Mumbai, Maharashtra'
      },
      {
        rollNumber: 'IT2021002',
        enrollmentNumber: 'EN2021IT002',
        fullName: 'Jane Smith',
        email: 'it2021002@student.college.edu',
        password: 'student123',
        department: 'IT',
        semester: 3,
        year: 2,
        dateOfBirth: '2000-05-20',
        mobileNumber: '9876543211',
        address: 'Pune, Maharashtra'
      }
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // rollNumber
      { wch: 20 }, // enrollmentNumber
      { wch: 20 }, // fullName
      { wch: 30 }, // email
      { wch: 15 }, // password
      { wch: 15 }, // department
      { wch: 10 }, // semester
      { wch: 10 }, // year
      { wch: 15 }, // dateOfBirth
      { wch: 15 }, // mobileNumber
      { wch: 30 }  // address
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Send file
    res.setHeader('Content-Disposition', 'attachment; filename=student_upload_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate template'
    });
  }
};

/**
 * GET ALL STUDENTS (Admin Only)
 * GET /api/admin/students
 */
const getAllStudents = async (req, res) => {
  try {
    const { department, semester, search } = req.query;

    const query = {};
    
    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    if (search) {
      query.$or = [
        { rollNumber: new RegExp(search, 'i') },
        { fullName: new RegExp(search, 'i') },
        { enrollmentNumber: new RegExp(search, 'i') }
      ];
    }

    const students = await Student.find(query)
      .select('-password')
      .sort({ rollNumber: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
};

/**
 * DELETE STUDENT (Admin Only)
 * DELETE /api/admin/students/:id
 */
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student'
    });
  }
};

module.exports = {
  bulkUploadStudents,
  downloadTemplate,
  getAllStudents,
  deleteStudent
};
