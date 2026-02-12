const express = require('express');
const router = express.Router();
const {
  enterResult,
  getMyResults,
  getStudentResults,
  getStaffResults,
  getAdminResults,
  releaseResults
} = require('../controllers/resultController');
const { authenticate, authorizeStudent, authorizeAdmin, authorizeStaff } = require('../middleware/authMiddleware');

/**
 * RESULT ROUTES
 */

// Enter/Update result (Staff only)
// POST /api/results
router.post('/', authenticate, authorizeStaff, enterResult);

// Get my results (Student only - Released only)
// GET /api/results/my
router.get('/my', authenticate, authorizeStudent, getMyResults);

// Get staff results (Staff only - Unreleased)
// GET /api/results/staff
router.get('/staff', authenticate, authorizeStaff, getStaffResults);

// Get admin results (Admin only - All)
// GET /api/results/admin
router.get('/admin', authenticate, authorizeAdmin, getAdminResults);

// Release results (Admin only)
// PUT /api/results/release
router.put('/release', authenticate, authorizeAdmin, releaseResults);

// Get student results by roll number (Admin only)
// GET /api/results/student/:rollNo
router.get('/student/:rollNo', authenticate, authorizeAdmin, getStudentResults);

module.exports = router;
