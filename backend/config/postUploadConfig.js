const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Multer Storage Configuration for Post Attachments
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/posts';
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  
  filename: function (req, file, cb) {
    const originalName = file.originalname.replace(/\s+/g, '_');
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    const fileName = `${nameWithoutExt}_${timestamp}${ext}`;
    
    cb(null, fileName);
  }
});

/**
 * File Filter - Images and PDFs only
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPG, PNG, GIF) and PDF files are allowed'));
  }
};

/**
 * Multer Upload Configuration
 */
const uploadPost = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = uploadPost;
