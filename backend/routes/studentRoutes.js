const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  bulkUploadStudents,
  downloadTemplate,
  getAllStudents,
  deleteStudent
} = require('../controllers/studentBulkController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// Configure multer for Excel file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only Excel files
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * STUDENT MANAGEMENT ROUTES (Admin Only)
 */

// Download Excel template
// GET /api/admin/students/template
router.get('/template', authenticate, authorizeAdmin, downloadTemplate);

// Bulk upload students from Excel
// POST /api/admin/students/bulk-upload
router.post('/bulk-upload', authenticate, authorizeAdmin, upload.single('file'), bulkUploadStudents);

// Get all students
// GET /api/admin/students
router.get('/', authenticate, authorizeAdmin, getAllStudents);

// Delete student
// DELETE /api/admin/students/:id
router.delete('/:id', authenticate, authorizeAdmin, deleteStudent);

module.exports = router;
