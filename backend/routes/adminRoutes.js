const express = require('express');
const router = express.Router();
const {
  getAllComplaints,
  assignComplaint,
  getComplaintDetails,
  updateComplaintStatus,
  getStaffList,
  createStaff,
  deleteStaff,
  promoteStudents,
  escalateComplaints,
  getStorageStats,
  getBackupStatus
} = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

/**
 * ADMIN ROUTES
 * All routes require admin authentication
 */

// Get all complaints with filters
// GET /api/admin/complaints
router.get('/complaints', authenticate, authorizeAdmin, getAllComplaints);

// Get single complaint details
// GET /api/admin/complaints/:id
router.get('/complaints/:id', authenticate, authorizeAdmin, getComplaintDetails);

// Assign complaint to staff
// POST /api/admin/complaints/:id/assign
router.post('/complaints/:id/assign', authenticate, authorizeAdmin, assignComplaint);

// Update complaint status
// PATCH /api/admin/complaints/:id
router.patch('/complaints/:id', authenticate, authorizeAdmin, updateComplaintStatus);

// Get staff list
// GET /api/admin/staff
router.get('/staff', authenticate, authorizeAdmin, getStaffList);

// Create staff member
// POST /api/admin/staff
router.post('/staff', authenticate, authorizeAdmin, createStaff);

// Delete staff member
// DELETE /api/admin/staff/:id
router.delete('/staff/:id', authenticate, authorizeAdmin, deleteStaff);

// Promote all active students to next academic year
router.post('/promote-students', authenticate, authorizeAdmin, promoteStudents);

// Auto-escalate unresolved complaints older than 3 days
router.post('/escalate-complaints', authenticate, authorizeAdmin, escalateComplaints);

// Storage stats
router.get('/storage-stats', authenticate, authorizeAdmin, getStorageStats);

// Backup status
router.get('/backup-status', authenticate, authorizeAdmin, getBackupStatus);

// ─── MSBTE routes ─────────────────────────────────────────────────────────────
const {
  getPendingMSBTEResults,
  approveMSBTEResult,
  rejectMSBTEResult,
  publishMSBTEResults,
  archiveUTResults,
  getAllMSBTEResults
} = require('../controllers/msbteController');

router.get('/msbte-results',              authenticate, authorizeAdmin, getAllMSBTEResults);
router.get('/msbte-results/pending',      authenticate, authorizeAdmin, getPendingMSBTEResults);
router.post('/msbte-results/:id/approve', authenticate, authorizeAdmin, approveMSBTEResult);
router.post('/msbte-results/:id/reject',  authenticate, authorizeAdmin, rejectMSBTEResult);
router.post('/publish-msbte-results',     authenticate, authorizeAdmin, publishMSBTEResults);
router.post('/archive-ut-results',        authenticate, authorizeAdmin, archiveUTResults);

module.exports = router;
