/**
 * Authentication Controller
 * Handles student, admin, and staff authentication
 * 
 * STRUCTURE:
 * 1. Imports at top
 * 2. All function definitions
 * 3. Single module.exports at bottom
 */

// ============================================================================
// IMPORTS
// ============================================================================
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const Staff = require('../models/Staff');
const { generateToken } = require('../utils/jwt');

// ============================================================================
// STUDENT REGISTRATION
// ============================================================================
async function registerStudent(req, res) {
  try {
    // BUG FIX: Frontend sends rollNumber, enrollmentNumber, fullName, dateOfBirth, password
    // Backend schema requires: rollNumber, enrollmentNumber, fullName, email, department, semester, password
    const { rollNumber, enrollmentNumber, fullName, dateOfBirth, password } = req.body;
    
    // Validate required fields that frontend actually sends
    if (!rollNumber || !enrollmentNumber || !fullName || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Validate password length (must match schema minlength: 8)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }
    
    // Check if student already exists by rollNumber or enrollmentNumber
    const existingStudent = await Student.findOne({
      $or: [
        { rollNumber: rollNumber.toUpperCase() },
        { enrollmentNumber: enrollmentNumber.toUpperCase() }
      ]
    });
    
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student already exists with this roll number or enrollment number'
      });
    }
    
    // Generate email from rollNumber (temporary fix to satisfy schema)
    const generatedEmail = `${rollNumber.toLowerCase()}@student.college.edu`;
    
    // Extract department from rollNumber (e.g., CS2024001 -> CS)
    const departmentCode = rollNumber.replace(/[0-9]/g, '').toUpperCase();
    const departmentMap = {
      'CS': 'Computer Science',
      'IT': 'Information Technology',
      'ENTC': 'Electronics & Telecommunication',
      'MECH': 'Mechanical Engineering',
      'CIVIL': 'Civil Engineering'
    };
    const department = departmentMap[departmentCode] || 'General';
    
    // Default semester to 1 for new registrations
    const semester = 1;
    
    // Create new student (password will be hashed by pre-save hook)
    const student = await Student.create({
      rollNumber: rollNumber.toUpperCase(),
      enrollmentNumber: enrollmentNumber.toUpperCase(),
      fullName,
      email: generatedEmail,
      department,
      semester,
      password
    });
    
    // Generate JWT token
    const token = generateToken({
      userId: student._id,
      role: 'student'
    });
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      student: {
        id: student._id,
        rollNumber: student.rollNumber,
        fullName: student.fullName,
        email: student.email,
        department: student.department,
        semester: student.semester,
        role: student.role
      }
    });
    
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
}

// ============================================================================
// STUDENT LOGIN
// ============================================================================
async function loginStudent(req, res) {
  try {
    const { rollNumber, password } = req.body;
    
    // Validate input
    if (!rollNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Roll number and password are required'
      });
    }
    
    // Find student by roll number
    const student = await Student.findOne({ 
      rollNumber: rollNumber.toUpperCase() 
    });
    
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if account is locked
    if (student.isLocked()) {
      const minutesLeft = Math.ceil((student.lockUntil - Date.now()) / 60000);
      return res.status(403).json({
        success: false,
        message: `Account locked. Try again in ${minutesLeft} minutes.`
      });
    }
    
    // Check if account is active
    if (!student.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact administration.'
      });
    }
    
    // Compare password
    const isPasswordValid = await student.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment failed attempts
      student.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (student.loginAttempts >= 5) {
        student.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
        await student.save();
        return res.status(403).json({
          success: false,
          message: 'Too many failed attempts. Account locked for 30 minutes.'
        });
      }
      
      await student.save();
      return res.status(401).json({
        success: false,
        message: `Invalid credentials. ${5 - student.loginAttempts} attempts remaining.`
      });
    }
    
    // Successful login - reset attempts
    student.loginAttempts = 0;
    student.lockUntil = null;
    student.lastLogin = Date.now();
    await student.save();
    
    // Generate JWT token
    const token = generateToken({
      userId: student._id,
      role: 'student'
    });
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      student: {
        id: student._id,
        rollNumber: student.rollNumber,
        fullName: student.fullName,
        email: student.email,
        department: student.department,
        semester: student.semester,
        role: student.role
      }
    });
    
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
}

// ============================================================================
// ADMIN LOGIN
// ============================================================================
async function loginAdmin(req, res) {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if account is locked
    if (admin.isLocked()) {
      const minutesLeft = Math.ceil((admin.lockUntil - Date.now()) / 60000);
      return res.status(403).json({
        success: false,
        message: `Account locked. Try again in ${minutesLeft} minutes.`
      });
    }
    
    // Check if account is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }
    
    // Compare password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment failed attempts
      admin.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (admin.loginAttempts >= 5) {
        admin.lockUntil = Date.now() + 30 * 60 * 1000;
        await admin.save();
        return res.status(403).json({
          success: false,
          message: 'Too many failed attempts. Account locked for 30 minutes.'
        });
      }
      
      await admin.save();
      return res.status(401).json({
        success: false,
        message: `Invalid credentials. ${5 - admin.loginAttempts} attempts remaining.`
      });
    }
    
    // Successful login - reset attempts
    admin.loginAttempts = 0;
    admin.lockUntil = null;
    admin.lastLogin = Date.now();
    await admin.save();
    
    // Generate JWT token
    const token = generateToken({
      userId: admin._id,
      role: 'admin'
    });
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
}

// ============================================================================
// STAFF LOGIN
// ============================================================================
async function loginStaff(req, res) {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find staff by email
    const staff = await Staff.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (!staff) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if account is locked
    if (staff.isLocked()) {
      const minutesLeft = Math.ceil((staff.lockUntil - Date.now()) / 60000);
      return res.status(403).json({
        success: false,
        message: `Account locked. Try again in ${minutesLeft} minutes.`
      });
    }
    
    // Check if account is active
    if (!staff.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }
    
    // Compare password
    const isPasswordValid = await staff.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment failed attempts
      staff.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (staff.loginAttempts >= 5) {
        staff.lockUntil = Date.now() + 30 * 60 * 1000;
        await staff.save();
        return res.status(403).json({
          success: false,
          message: 'Too many failed attempts. Account locked for 30 minutes.'
        });
      }
      
      await staff.save();
      return res.status(401).json({
        success: false,
        message: `Invalid credentials. ${5 - staff.loginAttempts} attempts remaining.`
      });
    }
    
    // Successful login - reset attempts
    staff.loginAttempts = 0;
    staff.lockUntil = null;
    staff.lastLogin = Date.now();
    await staff.save();
    
    // Generate JWT token
    const token = generateToken({
      userId: staff._id,
      role: 'staff'
    });
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        department: staff.department,
        role: staff.role
      }
    });
    
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
}

// ============================================================================
// EXPORTS - Single export statement at the bottom
// ============================================================================
module.exports = {
  registerStudent,
  loginStudent,
  loginAdmin,
  loginStaff
};
