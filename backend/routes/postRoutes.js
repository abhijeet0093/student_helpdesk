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

/**
 * STUDENT CORNER (POSTS) ROUTES
 * All routes require student authentication
 */

// Create new post (with optional attachment)
// POST /api/posts
router.post('/', authenticate, authorizeStudent, uploadPost.single('attachment'), createPost);

// Get feed (all posts)
// GET /api/posts
router.get('/', authenticate, authorizeStudent, getFeed);

// Like / Unlike post
// POST /api/posts/:postId/like
router.post('/:postId/like', authenticate, authorizeStudent, toggleLike);

// Add comment to post
// POST /api/posts/:postId/comment
router.post('/:postId/comment', authenticate, authorizeStudent, addComment);

// Report post
// POST /api/posts/:postId/report
router.post('/:postId/report', authenticate, authorizeStudent, reportPost);

// Delete own post
// DELETE /api/posts/:postId
router.delete('/:postId', authenticate, authorizeStudent, deletePost);

module.exports = router;
