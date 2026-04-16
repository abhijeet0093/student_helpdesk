const express = require('express');
const router = express.Router();
const {
  lookupEnrollment,
  registerStudent,
  loginStudent,
  loginAdmin,
  loginStaff
} = require('../controllers/authController');

// Student: look up enrollment number (returns name for auto-fill, no sensitive data)
router.post('/student/lookup', lookupEnrollment);

// Student: self-activation (set password for pre-registered account)
router.post('/student/register', registerStudent);

// Student: login with enrollment number + password
router.post('/student/login', loginStudent);

// Admin login
router.post('/admin/login', loginAdmin);

// Staff login
router.post('/staff/login', loginStaff);

module.exports = router;
