const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_TYPES = {
  'image/jpeg': { folder: 'uploads/images', ext: '.jpg' },
  'image/png':  { folder: 'uploads/images', ext: '.png' },
  'application/pdf': { folder: 'uploads/documents', ext: '.pdf' }
};

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_PDF_SIZE   = 5 * 1024 * 1024; // 5MB

// Use memoryStorage — validate size BEFORE writing to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];

  if (ALLOWED_TYPES[file.mimetype] && allowedExts.includes(ext)) {
    return cb(null, true);
  }

  const err = new Error('Only JPG, PNG images and PDF files are allowed');
  err.code = 'INVALID_FILE_TYPE';
  cb(err, false);
};

// Allow up to 5MB in-memory (PDF ceiling); image limit enforced below
const uploadRaw = multer({
  storage,
  limits: { fileSize: MAX_PDF_SIZE },
  fileFilter
});

/**
 * Middleware: validates size per type, then writes buffer to disk.
 */
const singleWithSizeCheck = (fieldName) => (req, res, next) => {
  uploadRaw.single(fieldName)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File size exceeds 5MB limit' });
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ success: false, message: err.message });
      }
      return next(err);
    }

    if (!req.file) return next();

    const isImage = ['image/jpeg', 'image/png'].includes(req.file.mimetype);

    // Enforce 2MB limit for images (before any disk write)
    if (isImage && req.file.size > MAX_IMAGE_SIZE) {
      return res.status(400).json({ success: false, message: 'Image size exceeds 2MB limit' });
    }

    const config = ALLOWED_TYPES[req.file.mimetype];
    const uploadDir = config.folder;
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}${config.ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFile(filePath, req.file.buffer, (writeErr) => {
      if (writeErr) return next(writeErr);
      req.file.filename = filename;
      req.file.path = filePath;
      next();
    });
  });
};

const uploadPost = { singleWithSizeCheck };

module.exports = uploadPost;
