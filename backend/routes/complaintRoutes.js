const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus
} = require('../controllers/complaintController');
const { authenticate, authorizeStudent, authorizeAdmin } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');

/**
 * STUDENT ROUTES
 */

// Create new complaint (with optional image upload)
// POST /api/complaints
router.post('/', authenticate, authorizeStudent, upload.single('image'), createComplaint);

// Get my complaints
// GET /api/complaints/my
router.get('/my', authenticate, authorizeStudent, getMyComplaints);

// Get single complaint (own only)
// GET /api/complaints/:id
router.get('/:id', authenticate, authorizeStudent, getComplaintById);

/**
 * ADMIN ROUTES
 */

// Get all complaints (admin only)
// GET /api/complaints
router.get('/', authenticate, authorizeAdmin, getAllComplaints);

// Update complaint status (admin only)
// PATCH /api/complaints/:id
router.patch('/:id', authenticate, authorizeAdmin, updateComplaintStatus);

module.exports = router;
