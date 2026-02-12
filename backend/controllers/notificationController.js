const Notification = require('../models/Notification');

// Get all notifications for current user
async function getNotifications(req, res) {
  try {
    const { userId, role } = req.user;
    
    // Determine the model based on role
    const recipientModel = role === 'student' ? 'Student' : 
                          role === 'admin' ? 'Admin' : 'Staff';
    
    const notifications = await Notification.find({
      recipient: userId,
      recipientModel: recipientModel
    })
    .sort({ createdAt: -1 })
    .limit(50); // Limit to last 50 notifications
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
}

// Get unread notification count
async function getUnreadCount(req, res) {
  try {
    const { userId, role } = req.user;
    
    const recipientModel = role === 'student' ? 'Student' : 
                          role === 'admin' ? 'Admin' : 'Staff';
    
    const count = await Notification.countDocuments({
      recipient: userId,
      recipientModel: recipientModel,
      isRead: false
    });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
}

// Mark notification as read
async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
}

// Mark all notifications as read
async function markAllAsRead(req, res) {
  try {
    const { userId, role } = req.user;
    
    const recipientModel = role === 'student' ? 'Student' : 
                          role === 'admin' ? 'Admin' : 'Staff';
    
    await Notification.updateMany(
      { recipient: userId, recipientModel: recipientModel, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
}

// Delete notification
async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
}

// Helper function to create notification (used by other controllers)
async function createNotification(data) {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
};
