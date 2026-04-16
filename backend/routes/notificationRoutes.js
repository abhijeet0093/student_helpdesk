const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Get unread count — MUST be before /:id routes
router.get('/unread-count', getUnreadCount);

// Mark all as read — MUST be before /:id/read to avoid 'read-all' matching as an id
router.put('/read-all', markAllAsRead);

// Get all notifications
router.get('/', getNotifications);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

module.exports = router;
