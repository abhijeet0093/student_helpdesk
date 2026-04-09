const express = require('express');
const router = express.Router();
const {
  enterResult,
  getMyResults,
  getStudentResults,
  getStaffResults,
  getAdminResults,
  releaseResults,
  getSubjectsForSemesterAPI
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

// Get subjects for semester (Staff/Admin)
// GET /api/results/subjects/:year/:semester
router.get('/subjects/:year/:semester', authenticate, getSubjectsForSemesterAPI);

// ─── MSBTE + UT combined routes ───────────────────────────────────────────────
const {
  submitMSBTEResult,
  getStaffMSBTEResults,
  getMyMSBTEResults,
  getMyUTResults
} = require('../controllers/msbteController');

// Staff: submit MSBTE result for approval
router.post('/msbte',        authenticate, authorizeStaff, submitMSBTEResult);
router.get('/msbte/staff',   authenticate, authorizeStaff, getStaffMSBTEResults);

// Student: get approved MSBTE results
router.get('/msbte',         authenticate, authorizeStudent, getMyMSBTEResults);

// Student: get UT results (current + archived)
router.get('/ut/all',        authenticate, authorizeStudent, getMyUTResults);

module.exports = router;
