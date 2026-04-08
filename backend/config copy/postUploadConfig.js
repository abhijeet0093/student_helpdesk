const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Allowed MIME types with their target folders and extensions
const ALLOWED_TYPES = {
  'image/jpeg': { folder: 'uploads/images', ext: '.jpg' },
  'image/png':  { folder: 'uploads/images', ext: '.png' },
  'application/pdf': { folder: 'uploads/documents', ext: '.pdf' }
};

// Storage: images → uploads/images/, PDFs → uploads/documents/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const config = ALLOWED_TYPES[file.mimetype];
    const uploadPath = config ? config.folder : 'uploads/images';

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    // Secure filename: timestamp_randomhex.ext (never trust original name)
    const config = ALLOWED_TYPES[file.mimetype];
    const ext = config ? config.ext : path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}${ext}`;
    cb(null, filename);
  }
});

// File filter: validate MIME type AND extension
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

// Upload config: images max 2MB, PDFs max 5MB
// Multer applies one limit — use 5MB as ceiling, PDF vs image enforced in fileFilter
const uploadPost = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB ceiling
  fileFilter
});

// Custom middleware to enforce 2MB limit specifically for images
uploadPost.singleWithSizeCheck = (fieldName) => (req, res, next) => {
  uploadPost.single(fieldName)(req, res, (err) => {
    if (err) return next(err);

    // After upload, check image-specific 2MB limit
    if (req.file && ['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
      if (req.file.size > 2 * 1024 * 1024) {
        // Delete the already-saved file
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({
          success: false,
          message: 'Image size exceeds 2MB limit'
        });
      }
    }
    next();
  });
};

module.exports = uploadPost;
