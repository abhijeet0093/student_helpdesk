const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  bulkUploadStudents,
  downloadTemplate,
  getAllStudents,
  deleteStudent
} = require('../controllers/studentBulkController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// ── Multer config for Excel uploads ──────────────────────────────────────────
// Use memoryStorage so xlsx can read the buffer directly
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.xlsx', '.xls'];
    // Accept by extension — browsers send inconsistent MIME types for Excel
    if (allowedExts.includes(ext)) {
      return cb(null, true);
    }
    const err = new Error('Only Excel files (.xlsx, .xls) are allowed');
    err.code = 'INVALID_FILE_TYPE';
    cb(err, false);
  }
});

// Wrapper that converts multer errors into clean JSON responses
const uploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File size exceeds 5MB limit' });
    }
    if (err.code === 'INVALID_FILE_TYPE' || err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  });
};

// ── Routes (Admin Only) ───────────────────────────────────────────────────────

// GET /api/admin/students/template
router.get('/template', authenticate, authorizeAdmin, downloadTemplate);

// POST /api/admin/students/bulk-upload
router.post('/bulk-upload', authenticate, authorizeAdmin, uploadMiddleware, bulkUploadStudents);

// GET /api/admin/students
router.get('/', authenticate, authorizeAdmin, getAllStudents);

// DELETE /api/admin/students/:id
router.delete('/:id', authenticate, authorizeAdmin, deleteStudent);

module.exports = router;
