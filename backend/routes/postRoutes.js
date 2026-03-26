const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  reportPost,
  deletePost
} = require('../controllers/postController');
const { authenticate, authorizeStudent } = require('../middleware/authMiddleware');
const uploadPost = require('../config/postUploadConfig');

// Multer error handler for post attachment upload
const handleUpload = (req, res, next) => {
  uploadPost.singleWithSizeCheck('attachment')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File size exceeds 5MB limit' });
    }
    if (err.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ success: false, message: err.message });
    }
    return res.status(400).json({ success: false, message: 'File upload failed' });
  });
};

// Create new post (with optional attachment)
router.post('/', authenticate, authorizeStudent, handleUpload, createPost);

// Get feed (all posts)
router.get('/', authenticate, authorizeStudent, getFeed);

// Like / Unlike post
router.post('/:postId/like', authenticate, authorizeStudent, toggleLike);

// Add comment to post
router.post('/:postId/comment', authenticate, authorizeStudent, addComment);

// Report post
router.post('/:postId/report', authenticate, authorizeStudent, reportPost);

// Delete own post
router.delete('/:postId', authenticate, authorizeStudent, deletePost);

module.exports = router;
