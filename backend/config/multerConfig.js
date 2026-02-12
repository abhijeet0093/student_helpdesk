const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Multer Storage Configuration
 * Stores complaint images in organized folder structure
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads/complaints folder if doesn't exist
    const uploadPath = 'uploads/complaints';
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  
  filename: function (req, file, cb) {
    // Generate unique filename: originalname_timestamp.ext
    const originalName = file.originalname.replace(/\s+/g, '_');
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    const fileName = `${nameWithoutExt}_${timestamp}${ext}`;
    
    cb(null, fileName);
  }
});

/**
 * File Filter - Only allow images
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPG, PNG, GIF)'));
  }
};

/**
 * Multer Upload Configuration
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
