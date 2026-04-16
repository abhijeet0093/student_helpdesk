

const Student = require('../models/Student');
const Admin = require('../models/Admin');
const Staff = require('../models/Staff');
const { generateToken } = require('../utils/jwt');
const { ALLOWED_COURSES } = require('../constants/courses');

// ============================================================================
// LOOKUP ENROLLMENT — public, returns only name (for auto-fill on register page)
// GET-style via POST: POST /api/auth/student/lookup
// ============================================================================
async function lookupEnrollment(req, res) {
  try {
    const { enrollmentNumber } = req.body;
    if (!enrollmentNumber) {
      return res.status(400).json({ success: false, message: 'Enrollment number is required' });
    }

    const student = await Student.findOne({
      enrollmentNumber: enrollmentNumber.trim().toUpperCase()
    }).select('fullName department year course isActivated');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Enrollment number not found. Contact admin.' });
    }

    if (student.isActivated) {
      return res.status(409).json({ success: false, message: 'Account already activated. Please login.' });
    }

    res.json({
      success: true,
      data: {
        fullName:   student.fullName,
        department: student.department,
        year:       student.year,
        course:     student.course || null  // null means student must select it themselves
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lookup failed. Please try again.' });
  }
}

// ============================================================================
// STUDENT SELF-ACTIVATION (replaces open registration)
// POST /api/auth/student/register
// ============================================================================
async function registerStudent(req, res) {
  try {
    const { enrollmentNumber, password, confirmPassword, course } = req.body;

    if (!enrollmentNumber || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Enrollment number, password, and confirm password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    // Validate course if provided by student (not pre-filled by admin)
    if (course && !ALLOWED_COURSES.includes(course)) {
      return res.status(400).json({ success: false, message: 'Invalid course selected. Please choose from the allowed list.' });
    }

    const student = await Student.findOne({
      enrollmentNumber: enrollmentNumber.trim().toUpperCase()
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment number not found. You must be pre-registered by admin before activating your account.'
      });
    }

    if (student.isActivated) {
      return res.status(409).json({
        success: false,
        message: 'Account already activated. Please login with your credentials.'
      });
    }

    // Course: use admin-set value if present, otherwise require student to provide it
    const finalCourse = student.course || course;
    if (!finalCourse) {
      return res.status(400).json({ success: false, message: 'Please select your course.' });
    }
    if (!ALLOWED_COURSES.includes(finalCourse)) {
      return res.status(400).json({ success: false, message: 'Invalid course. Please select a valid course.' });
    }

    // Set password, course, and activate
    student.password    = password; // pre-save hook hashes it
    student.course      = finalCourse;
    student.isActivated = true;
    student.isActive    = true;

    if (!student.email) {
      student.email = `${enrollmentNumber.trim().toLowerCase()}@student.campusone.edu`;
    }

    await student.save();

    const token = generateToken({ userId: student._id, role: 'student' });

    res.status(201).json({
      success: true,
      message: 'Account activated successfully! Welcome to CampusOne.',
      token,
      student: {
        id:               student._id,
        enrollmentNumber: student.enrollmentNumber,
        rollNumber:       student.rollNumber,
        fullName:         student.fullName,
        email:            student.email,
        department:       student.department,
        course:           student.course,
        year:             student.year,
        semester:         student.semester,
        role:             student.role
      }
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message || 'Activation failed. Please try again.' });
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
    
    // Find student by enrollment number OR roll number
    const student = await Student.findOne({
      $or: [
        { enrollmentNumber: rollNumber.toUpperCase() },
        { rollNumber: rollNumber.toUpperCase() }
      ]
    });
    
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Must be activated before login is allowed
    if (!student.isActivated) {
      return res.status(403).json({
        success: false,
        message: 'Account not activated. Please register on the registration page first.'
      });
    }
    
    // Reset attempts if lock has expired (must run BEFORE isLocked check)
    if (student.lockUntil && student.lockUntil < Date.now()) {
      student.loginAttempts = 0;
      student.lockUntil = null;
      await student.save();
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
    
    // Reset attempts if lock has expired (must run BEFORE isLocked check)
    if (admin.lockUntil && admin.lockUntil < Date.now()) {
      admin.loginAttempts = 0;
      admin.lockUntil = null;
      await admin.save();
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
    
    // Reset attempts if lock has expired (must run BEFORE isLocked check)
    if (staff.lockUntil && staff.lockUntil < Date.now()) {
      staff.loginAttempts = 0;
      staff.lockUntil = null;
      await staff.save();
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
  lookupEnrollment,
  registerStudent,
  loginStudent,
  loginAdmin,
  loginStaff
};
