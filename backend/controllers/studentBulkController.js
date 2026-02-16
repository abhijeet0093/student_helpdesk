const XLSX = require('xlsx');
const Student = require('../models/Student');

/**
 * BULK UPLOAD STUDENTS FROM EXCEL (Admin Only)
 * POST /api/admin/students/bulk-upload
 */
const bulkUploadStudents = async (req, res) => {
  try {
    console.log('=== BULK UPLOAD DEBUG ===');
    console.log('File received:', req.file ? 'Yes' : 'No');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an Excel file'
      });
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Read Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON - read headers from first row
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false, // Convert all values to strings
      defval: '' // Default value for empty cells
    });

    console.log('Rows found in Excel:', data.length);
    if (data.length > 0) {
      console.log('First row sample:', data[0]);
      console.log('Column headers:', Object.keys(data[0]));
    }

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty or has no data rows'
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
        console.log(`\nProcessing row ${i + 2}:`, row);
        
        // Validate required fields
        if (!row.rollNumber || !row.fullName || !row.enrollmentNumber) {
          const missing = [];
          if (!row.rollNumber) missing.push('rollNumber');
          if (!row.fullName) missing.push('fullName');
          if (!row.enrollmentNumber) missing.push('enrollmentNumber');
          
          console.error(`Row ${i + 2} missing fields:`, missing);
          results.failed.push({
            row: i + 2,
            data: row,
            error: `Missing required fields: ${missing.join(', ')}`
          });
          continue;
        }

        // Extract department from roll number
        const rollNo = row.rollNumber.toString().trim().toUpperCase();
        const departmentCode = rollNo.replace(/[0-9]/g, '');
        
        const departmentMap = {
          'CS': 'Computer Science',
          'IT': 'Information Technology',
          'ENTC': 'Electronics & Telecommunication',
          'MECH': 'Mechanical Engineering',
          'CIVIL': 'Civil Engineering',
          'ME': 'Mechanical Engineering',
          'CE': 'Civil Engineering'
        };
        
        const department = departmentMap[departmentCode] || 'General';
        console.log(`Department extracted: ${departmentCode} -> ${department}`);

        // Generate default password (will be hashed by Student model pre-save hook)
        const defaultPassword = row.password || 'student123';

        // Generate email
        const email = row.email || `${rollNo.toLowerCase()}@student.college.edu`;

        // Check if student already exists
        const existingStudent = await Student.findOne({ 
          $or: [
            { rollNumber: rollNo },
            { enrollmentNumber: row.enrollmentNumber.toString().trim().toUpperCase() }
          ]
        });

        if (existingStudent) {
          console.error(`Row ${i + 2}: Student already exists`);
          results.failed.push({
            row: i + 2,
            data: row,
            error: 'Student already exists with this roll number or enrollment number'
          });
          continue;
        }

        // Create student (password will be auto-hashed by pre-save hook)
        const studentData = {
          rollNumber: rollNo,
          enrollmentNumber: row.enrollmentNumber.toString().trim().toUpperCase(),
          fullName: row.fullName.trim(),
          email: email.toLowerCase(),
          password: defaultPassword, // Will be hashed by pre-save hook
          department: department,
          semester: parseInt(row.semester) || 1
        };

        console.log('Creating student with data:', studentData);
        
        const student = await Student.create(studentData);

        console.log(`Row ${i + 2}: Student created successfully - ${student.rollNumber}`);
        
        results.success.push({
          row: i + 2,
          rollNumber: student.rollNumber,
          fullName: student.fullName,
          email: student.email,
          department: student.department
        });

      } catch (error) {
        console.error(`Row ${i + 2} error:`, error.message);
        results.failed.push({
          row: i + 2,
          data: row,
          error: error.message
        });
      }
    }

    console.log('\n=== UPLOAD COMPLETE ===');
    console.log('Total:', results.total);
    console.log('Success:', results.success.length);
    console.log('Failed:', results.failed.length);

    res.status(200).json({
      success: true,
      message: `Processed ${results.total} records. Success: ${results.success.length}, Failed: ${results.failed.length}`,
      data: results
    });

  } catch (error) {
    console.error('=== BULK UPLOAD ERROR ===');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
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
    // Create sample data with only required fields
    const sampleData = [
      {
        rollNumber: 'CS2025001',
        enrollmentNumber: 'EN2025CS001',
        fullName: 'John Doe',
        semester: 1,
        password: 'student123'
      },
      {
        rollNumber: 'IT2025002',
        enrollmentNumber: 'EN2025IT002',
        fullName: 'Jane Smith',
        semester: 1,
        password: 'student123'
      },
      {
        rollNumber: 'ME2025003',
        enrollmentNumber: 'EN2025ME003',
        fullName: 'Mike Johnson',
        semester: 1,
        password: 'student123'
      }
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // rollNumber
      { wch: 20 }, // enrollmentNumber
      { wch: 25 }, // fullName
      { wch: 10 }, // semester
      { wch: 15 }  // password
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
