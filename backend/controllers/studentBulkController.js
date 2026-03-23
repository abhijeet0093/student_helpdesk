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

    // Helper function to find column value with flexible matching
    const getColumnValue = (row, possibleNames) => {
      for (const name of possibleNames) {
        // Try exact match
        if (row[name]) return row[name];
        // Try case-insensitive match
        const key = Object.keys(row).find(k => k.toLowerCase() === name.toLowerCase());
        if (key && row[key]) return row[key];
        // Try partial match (for headers like "enrollmentNumber (Required)")
        const partialKey = Object.keys(row).find(k => k.toLowerCase().includes(name.toLowerCase()));
        if (partialKey && row[partialKey]) return row[partialKey];
      }
      return null;
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        console.log(`\nProcessing row ${i + 2}:`, row);
        
        // Extract values with flexible column matching
        const rollNumber = getColumnValue(row, ['rollNumber', 'rollnumber', 'roll_number', 'Roll Number']);
        const enrollmentNumber = getColumnValue(row, ['enrollmentNumber', 'enrollmentnumber', 'enrollment_number', 'Enrollment Number']);
        const fullName = getColumnValue(row, ['fullName', 'fullname', 'full_name', 'Full Name', 'name', 'Name']);
        const department = getColumnValue(row, ['department', 'Department', 'dept']);
        const year = getColumnValue(row, ['year', 'Year']);
        const semester = getColumnValue(row, ['semester', 'Semester', 'sem']);
        const password = getColumnValue(row, ['password', 'Password']);
        
        // Validate required fields
        if (!rollNumber || !fullName || !enrollmentNumber) {
          const missing = [];
          if (!rollNumber) missing.push('rollNumber');
          if (!fullName) missing.push('fullName');
          if (!enrollmentNumber) missing.push('enrollmentNumber');
          
          console.error(`Row ${i + 2} missing fields:`, missing);
          results.failed.push({
            row: i + 2,
            data: row,
            error: `Missing required fields: ${missing.join(', ')}`
          });
          continue;
        }

        // Extract department from roll number or use provided department
        const rollNo = rollNumber.toString().trim().toUpperCase();
        
        let finalDepartment = 'General';
        
        // If department provided in Excel, use it
        if (department) {
          const deptStr = department.toString().trim();
          // Handle full department names
          if (deptStr.toLowerCase().includes('computer')) {
            finalDepartment = 'Computer';
          } else if (deptStr.toLowerCase().includes('information')) {
            finalDepartment = 'IT';
          } else if (deptStr.toLowerCase().includes('electronics') || deptStr.toLowerCase().includes('telecommunication')) {
            finalDepartment = 'ENTC';
          } else if (deptStr.toLowerCase().includes('mechanical')) {
            finalDepartment = 'Mechanical';
          } else if (deptStr.toLowerCase().includes('civil')) {
            finalDepartment = 'Civil';
          } else {
            finalDepartment = deptStr;
          }
        } else {
          // Extract from roll number
          const departmentCode = rollNo.replace(/[0-9]/g, '');
          const departmentMap = {
            'CS': 'Computer',
            'IT': 'IT',
            'ENTC': 'ENTC',
            'MECH': 'Mechanical',
            'CIVIL': 'Civil',
            'ME': 'Mechanical',
            'CE': 'Civil'
          };
          finalDepartment = departmentMap[departmentCode] || 'General';
        }
        
        console.log(`Department: ${finalDepartment}`);

        // Determine year and semester from provided values
        let finalYear = 1;
        let finalSemester = 1;

        if (year) {
          const yearStr = year.toString().toLowerCase().trim();
          if (yearStr.includes('first') || yearStr === '1') {
            finalYear = 1;
          } else if (yearStr.includes('second') || yearStr === '2') {
            finalYear = 2;
          } else if (yearStr.includes('third') || yearStr === '3') {
            finalYear = 3;
          } else if (yearStr.includes('fourth') || yearStr === '4') {
            finalYear = 4;
          } else {
            const parsed = parseInt(yearStr);
            finalYear = (!isNaN(parsed) && parsed >= 1 && parsed <= 4) ? parsed : 1;
          }
        }

        if (semester) {
          const parsedSem = parseInt(semester.toString().trim());
          finalSemester = (!isNaN(parsedSem) && parsedSem >= 1 && parsedSem <= 8) ? parsedSem : (finalYear * 2) - 1;
        } else {
          // Default to first semester of the year
          finalSemester = (finalYear * 2) - 1;
        }

        // Generate default password (will be hashed by Student model pre-save hook)
        const defaultPassword = (password && password.toString().trim().length >= 8)
          ? password.toString().trim()
          : 'student@123';

        // Generate email from roll number
        const email = `${rollNo.toLowerCase()}@student.college.edu`;

        // Check if student already exists
        const existingStudent = await Student.findOne({ 
          $or: [
            { rollNumber: rollNo },
            { enrollmentNumber: enrollmentNumber.toString().trim().toUpperCase() }
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

        // Create student — year is explicitly set to satisfy schema requirement
        const studentData = {
          rollNumber: rollNo,
          enrollmentNumber: enrollmentNumber.toString().trim().toUpperCase(),
          fullName: fullName.trim(),
          email: email.toLowerCase(),
          password: defaultPassword, // Will be hashed by pre-save hook
          department: finalDepartment,
          year: finalYear,       // FIX: was missing — caused all inserts to fail
          semester: finalSemester
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
      data: {
        total: results.total,
        success: results.success.length,
        failed: results.failed.length,
        successList: results.success,
        errors: results.failed.map(f => ({ row: f.row, reason: f.error }))
      }
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
    // Create sample data with clean headers that match getColumnValue mapping
    const sampleData = [
      {
        'rollNumber': '101',
        'enrollmentNumber': 'ENR2024001',
        'fullName': 'Aarav Patil',
        'department': 'Computer Engineering',
        'year': '2',
        'semester': '3',
        'password': 'student@123'
      },
      {
        'rollNumber': '102',
        'enrollmentNumber': 'ENR2024002',
        'fullName': 'Sneha Kulkarni',
        'department': 'Computer Engineering',
        'year': '2',
        'semester': '3',
        'password': 'student@123'
      },
      {
        'rollNumber': '103',
        'enrollmentNumber': 'ENR2024003',
        'fullName': 'Rohit Sharma',
        'department': 'Computer Engineering',
        'year': '2',
        'semester': '3',
        'password': 'student@123'
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
      { wch: 25 }, // department
      { wch: 10 }, // year
      { wch: 12 }, // semester
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
