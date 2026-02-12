const express = require('express');
const router = express.Router();
const {
  getAllComplaints,
  assignComplaint,
  getComplaintDetails,
  updateComplaintStatus,
  getStaffList
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

module.exports = router;
