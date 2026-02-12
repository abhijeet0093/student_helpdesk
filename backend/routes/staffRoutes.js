const express = require('express');
const router = express.Router();
const {
  getAssignedComplaints,
  getComplaintDetails,
  updateComplaintStatus
} = require('../controllers/staffController');
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

module.exports = router;
