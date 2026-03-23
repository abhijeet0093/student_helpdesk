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
const upload = require('../config/multerConfig');

// Student: Create complaint
router.post('/', authenticate, authorizeStudent, upload.single('image'), createComplaint);

// Student: Get my complaints
router.get('/my', authenticate, authorizeStudent, getMyComplaints);

// Student: Submit feedback on resolved complaint
router.post('/:id/feedback', authenticate, authorizeStudent, submitFeedback);

// Student: Get single complaint
router.get('/:id', authenticate, authorizeStudent, getComplaintById);

// Admin: Get all complaints
router.get('/', authenticate, authorizeAdmin, getAllComplaints);

// Admin: Update complaint status
router.patch('/:id', authenticate, authorizeAdmin, updateComplaintStatus);

module.exports = router;
