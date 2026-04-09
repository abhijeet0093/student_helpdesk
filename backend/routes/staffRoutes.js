const express = require('express');
const router = express.Router();
const {
  getAssignedComplaints,
  getComplaintDetails,
  updateComplaintStatus
} = require('../controllers/staffController');
const { submitMSBTEResult, getStaffMSBTEResults, getMSBTESubjects } = require('../controllers/msbteController');
const { authenticate, authorizeStaff } = require('../middleware/authMiddleware');

/**
 * STAFF ROUTES
 * All routes require staff authentication
 * Staff can only access complaints assigned to them
 */

// Get assigned complaints
// GET /api/staff/complaints
router.get('/complaints', authenticate, authorizeStaff, getAssignedComplaints);

// Get single complaint details (only if assigned)
// GET /api/staff/complaints/:id
router.get('/complaints/:id', authenticate, authorizeStaff, getComplaintDetails);

// Update complaint status (only if assigned)
// PATCH /api/staff/complaints/:id/status
router.patch('/complaints/:id/status', authenticate, authorizeStaff, updateComplaintStatus);

// MSBTE Result Entry
// POST /api/staff/add-msbte-result
router.post('/add-msbte-result', authenticate, authorizeStaff, submitMSBTEResult);

// GET /api/staff/msbte-results
router.get('/msbte-results', authenticate, authorizeStaff, getStaffMSBTEResults);

// GET /api/staff/msbte-subjects/:semester  — load subjects for a semester
router.get('/msbte-subjects/:semester', authenticate, authorizeStaff, getMSBTESubjects);

module.exports = router;
