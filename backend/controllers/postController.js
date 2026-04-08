const Post = require('../models/Post');
const Student = require('../models/Student');
const fs = require('fs');
const path = require('path');
const { compressImage } = require('../utils/imageCompressor');
const { uploadPDF: driveUploadPDF, deletePDF: driveDeletePDF } = require('../services/googleDriveService');
const cloudinary = require('../services/cloudinaryService');

/**
 * CREATE POST
 * POST /api/posts
 */
const createPost = async (req, res) => {
  try {
    const { contentText } = req.body;
    const studentId = req.userId;

    // Validate content
    if (!contentText || contentText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content text is required'
      });
    }

    if (contentText.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 10 characters long'
      });
    }

    if (contentText.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Content is too long. Maximum 2000 characters allowed.'
      });
    }

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Handle attachment if uploaded
    let attachmentPath = null;

    if (req.file) {
      const isPDF = req.file.mimetype === 'application/pdf';

      if (isPDF) {
        // Try Cloudinary first, fall back to local
        const cloudUrl = await cloudinary.uploadPDF(req.file.path);
        attachmentPath = cloudUrl || `/uploads/documents/${req.file.filename}`;
      } else {
        // Compress image then try Cloudinary, fall back to local
        await compressImage(req.file.path, req.file.mimetype);
        const cloudUrl = await cloudinary.uploadImage(req.file.path);
        attachmentPath = cloudUrl || `/uploads/images/${req.file.filename}`;
      }
    }

    // Create post
    const post = await Post.create({
      studentId: student._id,
      studentName: student.fullName,
      studentRollNumber: student.rollNumber,
      contentText: contentText,
      attachmentPath: attachmentPath,
      likes: [],
      comments: [],
      isReported: false,
      createdAt: Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        postId: post._id,
        contentText: post.contentText,
        attachmentPath: post.attachmentPath,
        createdAt: post.createdAt
      }
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
};

/**
 * GET FEED (All Posts)
 * GET /api/posts
 */
const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get posts (exclude reported posts)
    const posts = await Post.find({ isReported: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('studentName studentRollNumber contentText attachmentPath likes comments createdAt');

    // Get total count for pagination
    const totalPosts = await Post.countDocuments({ isReported: false });

    // Format posts with like and comment counts
    const formattedPosts = posts.map(post => ({
      id: post._id,
      studentName: post.studentName,
      studentRollNumber: post.studentRollNumber,
      contentText: post.contentText,
      attachmentPath: post.attachmentPath,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      comments: post.comments.map(comment => ({
        id: comment._id,
        studentName: comment.studentName,
        text: comment.text,
        timestamp: comment.timestamp
      })),
      createdAt: post.createdAt,
      isLikedByMe: post.likes.includes(req.userId)
    }));

    res.status(200).json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPosts / parseInt(limit)),
          totalPosts: totalPosts,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
};

/**
 * LIKE / UNLIKE POST
 * POST /api/posts/:postId/like
 */
const toggleLike = async (req, res) => {
  try {
    const postId = req.params.postId;
    const studentId = req.userId;

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if already liked
    const likeIndex = post.likes.indexOf(studentId);

    if (likeIndex > -1) {
      // Unlike - remove from array
      post.likes.splice(likeIndex, 1);
      await post.save();

      return res.status(200).json({
        success: true,
        message: 'Post unliked',
        data: {
          likesCount: post.likes.length,
          isLiked: false
        }
      });
    } else {
      // Like - add to array
      post.likes.push(studentId);
      await post.save();

      return res.status(200).json({
        success: true,
        message: 'Post liked',
        data: {
          likesCount: post.likes.length,
          isLiked: true
        }
      });
    }

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update like'
    });
  }
};

/**
 * ADD COMMENT
 * POST /api/posts/:postId/comment
 */
const addComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { text } = req.body;
    const studentId = req.userId;

    // Validate comment text
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment is too long. Maximum 500 characters allowed.'
      });
    }

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Add comment
    const comment = {
      studentId: student._id,
      studentName: student.fullName,
      text: text,
      timestamp: Date.now()
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: {
          id: post.comments[post.comments.length - 1]._id,
          studentName: comment.studentName,
          text: comment.text,
          timestamp: comment.timestamp
        },
        commentsCount: post.comments.length
      }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
};

/**
 * REPORT POST
 * POST /api/posts/:postId/report
 */
const reportPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if already reported
    if (post.isReported) {
      return res.status(400).json({
        success: false,
        message: 'Post is already reported'
      });
    }

    // Mark as reported
    post.isReported = true;
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post reported successfully. Admin will review it.'
    });

  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report post'
    });
  }
};

/**
 * DELETE POST (Own Post Only)
 * DELETE /api/posts/:postId
 */
const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const studentId = req.userId;

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if post belongs to student
    if (post.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    // Delete associated file before DB record
    if (post.attachmentPath) {
      const isCloudinary = post.attachmentPath.includes('cloudinary.com');
      const isDriveUrl = post.attachmentPath.startsWith('http') && !isCloudinary;

      if (isCloudinary) {
        await cloudinary.deleteFile(post.attachmentPath);
      } else if (isDriveUrl) {
        await driveDeletePDF(post.attachmentPath);
      } else {
        const fullPath = path.join(__dirname, '..', post.attachmentPath);
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
          } catch (err) {
            console.error('[deletePost] File deletion failed:', err.message);
            return res.status(500).json({
              success: false,
              message: 'Failed to delete post attachment. Post not deleted.'
            });
          }
        }
      }
    }

    // Safe to delete DB record
    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

module.exports = {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  reportPost,
  deletePost
};
