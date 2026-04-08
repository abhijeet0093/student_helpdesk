const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Allowed MIME types and their extensions (strict whitelist)
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png'
};

// Storage: uploads/images/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/images';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    // Secure filename: timestamp_randomhex.ext (never trust original name)
    const ext = ALLOWED_IMAGE_TYPES[file.mimetype] || '.jpg';
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}${ext}`;
    cb(null, filename);
  }
});

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

// Upload config: images max 2MB
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter
});

module.exports = upload;
