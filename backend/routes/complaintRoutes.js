const express = require('express');
const router = express.Router();
const multer = require('multer');
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

// Multer error handler for complaint image upload
const handleUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Image size exceeds 2MB limit' });
    }
    if (err.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ success: false, message: err.message });
    }
    return res.status(400).json({ success: false, message: 'File upload failed' });
  });
};

// Student: Create complaint
router.post('/', authenticate, authorizeStudent, handleUpload, createComplaint);

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
