const Student = require('../models/StudentNew');
const { generateToken } = require('../utils/jwtNew');
const bcrypt = require('bcrypt');

/**
 * STUDENT AUTHENTICATION CONTROLLER
 * 
 * SECURITY RULES:
 * 1. Never return password in responses
 * 2. Always use bcrypt for password comparison
 * 3. Provide specific error messages
 * 4. Validate all inputs explicitly
 */

/**
 * REGISTER STUDENT (API)
 * POST /api/auth/student/register
 * 
 * FLOW:
 * 1. Validate all required fields
 * 2. Convert email to lowercase
 * 3. Check for duplicates (rollNo, enrollmentNo, email)
 * 4. Hash password (done by pre-save hook)
 * 5. Save student
 * 6. Return success (without password)
 * 
 * WHY EACH STEP:
 * - Explicit validation: Clear error messages
 * - Lowercase email: Consistency in lookups
 * - Duplicate check: Prevent conflicts
 * - Hash password: Security (automatic via hook)
 * - Exclude password: Never expose to frontend
 */
async function registerStudent(req, res) {
  try {
    const { name, rollNo, enrollmentNo, department, year, email, password } = req.body;

    // STEP 1: Validate all required fields explicitly
    // WHY: Provide clear error messages for missing fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (!rollNo) {
      return res.status(400).json({
        success: false,
        message: 'Roll number is required'
      });
    }

    if (!enrollmentNo) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment number is required'
      });
    }

    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required'
      });
    }

    // Validate department enum
    const validDepartments = ['Computer', 'IT', 'ENTC'];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({
        success: false,
        message: `Department must be one of: ${validDepartments.join(', ')}`
      });
    }

    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Year is required'
      });
    }

    // Validate year range
    if (year < 1 || year > 4) {
      return res.status(400).json({
        success: false,
        message: 'Year must be between 1 and 4'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // STEP 2: Convert email to lowercase
    // WHY: Ensure consistency for lookups (email is case-insensitive)
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRollNo = rollNo.toUpperCase().trim();
    const normalizedEnrollmentNo = enrollmentNo.toUpperCase().trim();

    // STEP 3: Check for duplicates
    // WHY: Prevent duplicate students with same identifiers

    // Check if roll number already exists
    const existingRollNo = await Student.findOne({ rollNo: normalizedRollNo });
    if (existingRollNo) {
      return res.status(409).json({
        success: false,
        message: 'Roll number already registered'
      });
    }

    // Check if enrollment number already exists
    const existingEnrollmentNo = await Student.findOne({ enrollmentNo: normalizedEnrollmentNo });
    if (existingEnrollmentNo) {
      return res.status(409).json({
        success: false,
        message: 'Enrollment number already registered'
      });
    }

    // Check if email already exists
    const existingEmail = await Student.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // STEP 4: Create student
    // WHY: Password will be hashed automatically by pre-save hook
    const student = await Student.create({
      name: name.trim(),
      rollNo: normalizedRollNo,
      enrollmentNo: normalizedEnrollmentNo,
      department,
      year: parseInt(year),
      email: normalizedEmail,
      password // Will be hashed by pre-save hook
    });

    // STEP 5: Return success response
    // WHY: Password is automatically excluded by toJSON method
    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: {
        id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        enrollmentNo: student.enrollmentNo,
        department: student.department,
        year: student.year,
        email: student.email,
        role: student.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation error'
      });
    }

    // Handle duplicate key errors (shouldn't happen due to our checks, but just in case)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
}

/**
 * LOGIN STUDENT (API)
 * POST /api/auth/student/login
 * 
 * FLOW:
 * 1. Validate email and password
 * 2. Convert email to lowercase
 * 3. Find student by email
 * 4. Compare password using bcrypt
 * 5. Generate JWT token
 * 6. Return token and student info
 * 
 * WHY EACH STEP:
 * - Validate inputs: Prevent empty submissions
 * - Lowercase email: Match registration format
 * - Find by email: Unique identifier
 * - bcrypt compare: NEVER compare plain text
 * - JWT token: Secure authentication
 * - Return info: Frontend needs user data
 * 
 * SECURITY:
 * - Password never returned
 * - Uses bcrypt.compare (not plain text)
 * - Specific error messages
 */
async function loginStudent(req, res) {
  try {
    const { email, password } = req.body;

    // STEP 1: Validate required fields
    // WHY: Provide clear error messages
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // STEP 2: Convert email to lowercase
    // WHY: Match the format used during registration
    const normalizedEmail = email.toLowerCase().trim();

    // STEP 3: Find student by email
    // WHY: Email is unique identifier for login
    // NOTE: We need password field for comparison (not excluded by default)
    const student = await Student.findOne({ email: normalizedEmail }).select('+password');

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Student not registered. Please register first.'
      });
    }

    // STEP 4: Compare password using bcrypt
    // WHY: NEVER compare plain text passwords
    // SECURITY: Uses bcrypt.compare which is timing-attack safe
    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // STEP 5: Generate JWT token
    // WHY: Secure authentication for subsequent requests
    const token = generateToken({
      studentId: student._id.toString(),
      role: student.role
    });

    // STEP 6: Return success response
    // WHY: Frontend needs token and basic user info
    // SECURITY: Password is NOT included
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      student: {
        id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        enrollmentNo: student.enrollmentNo,
        department: student.department,
        year: student.year,
        email: student.email,
        role: student.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
}

module.exports = {
  registerStudent,
  loginStudent
};
