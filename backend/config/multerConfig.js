const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Allowed MIME types and their extensions (strict whitelist)
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png'
};

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

// Use memoryStorage so we can validate size BEFORE writing to disk
const storage = multer.memoryStorage();

// File filter: validate MIME type AND extension
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png'];

  if (ALLOWED_IMAGE_TYPES[file.mimetype] && allowedExts.includes(ext)) {
    return cb(null, true);
  }

  const err = new Error('Only JPG and PNG images are allowed');
  err.code = 'INVALID_FILE_TYPE';
  cb(err, false);
};

// Upload config: validate size in-memory (no disk write until controller)
const uploadRaw = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE }, // reject oversized files before buffering completes
  fileFilter
});

/**
 * Middleware that validates size in-memory then writes to disk.
 * Replaces upload.single() for complaint image uploads.
 */
const uploadComplaintImage = (fieldName) => (req, res, next) => {
  uploadRaw.single(fieldName)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Image size exceeds 2MB limit' });
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ success: false, message: err.message });
      }
      return next(err);
    }

    if (!req.file) return next();

    // Write buffer to disk now that size is confirmed valid
    const uploadDir = 'uploads/images';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const ext = ALLOWED_IMAGE_TYPES[req.file.mimetype] || '.jpg';
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFile(filePath, req.file.buffer, (writeErr) => {
      if (writeErr) return next(writeErr);
      // Attach file info matching multer diskStorage shape
      req.file.filename = filename;
      req.file.path = filePath;
      next();
    });
  });
};

module.exports = { uploadComplaintImage };
