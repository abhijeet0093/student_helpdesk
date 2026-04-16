const express = require('express');
const router = express.Router();
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

// Create new post (with optional attachment)
router.post('/', authenticate, authorizeStudent, uploadPost.singleWithSizeCheck('attachment'), createPost);

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
