const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  submitFeedback
} = require('../controllers/complaintController');
const { authenticate, authorizeStudent, authorizeAdmin } = require('../middleware/authMiddleware');
const { uploadComplaintImage } = require('../config/multerConfig');

// Student: Create complaint
router.post('/', authenticate, authorizeStudent, uploadComplaintImage('image'), createComplaint);

// Student: Get my complaints — MUST be before /:id to avoid 'my' being treated as an id
router.get('/my', authenticate, authorizeStudent, getMyComplaints);

// Admin: Get all complaints — MUST be before /:id
router.get('/', authenticate, authorizeAdmin, getAllComplaints);

// Student: Submit feedback on resolved complaint
router.post('/:id/feedback', authenticate, authorizeStudent, submitFeedback);

// Student: Get single complaint
router.get('/:id', authenticate, authorizeStudent, getComplaintById);

// Admin: Update complaint status
router.patch('/:id', authenticate, authorizeAdmin, updateComplaintStatus);

module.exports = router;
