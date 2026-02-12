const express = require('express');
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  loginAdmin,
  loginStaff
} = require('../controllers/authController');

/**
 * Authentication Routes
 * Separate endpoints for each user type
 */

// Student routes
router.post('/student/register', registerStudent);
router.post('/student/login', loginStudent);

// Admin routes
router.post('/admin/login', loginAdmin);

// Staff routes
router.post('/staff/login', loginStaff);

module.exports = router;
