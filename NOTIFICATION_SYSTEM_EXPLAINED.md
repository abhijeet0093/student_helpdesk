# Notification System - Complete Explanation

## Overview

The Smart Campus Helpdesk System has a notification system that alerts users about important events like complaint status changes, assignments, and updates. The system is role-based and supports Students, Staff, and Admin users.

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                  NOTIFICATION SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Notification Model (MongoDB Schema)                    │
│  2. Notification Controller (Business Logic)               │
│  3. Notification Routes (API Endpoints)                    │
│  4. Notification Triggers (Event Handlers)                 │
│  5. Frontend Components (UI Display)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Notification Model

### Schema Structure

```javascript
{
  recipient: ObjectId,           // Who receives the notification
  recipientModel: String,        // 'Student', 'Admin', or 'Staff'
  type: String,                  // Type of notification
  title: String,                 // Notification title
  message: String,               // Notification message
  relatedId: ObjectId,           // Related entity (complaint, post, etc.)
  relatedModel: String,          // 'Complaint', 'Post', or null
  isRead: Boolean,               // Read status (default: false)
  createdAt: Date                // Timestamp
}
```

### Notification Types

1. **complaint_status_changed** - When complaint status updates
2. **complaint_assigned** - When complaint is assigned to staff
3. **complaint_updated** - When complaint details are modified
4. **new_complaint** - When new complaint is created (for admin/staff)
5. **post_liked** - When someone likes a post
6. **post_commented** - When someone comments on a post

### Example Notification Document

```javascript
{
  _id: ObjectId("65a1..."),
  recipient: ObjectId("507f..."),        // Student's ID
  recipientModel: "Student",
  type: "complaint_status_changed",
  title: "Complaint Status Updated",
  message: "Your complaint CMP00005 status changed to 'In Progress'",
  relatedId: ObjectId("65a2..."),        // Complaint ID
  relatedModel: "Complaint",
  isRead: false,
  createdAt: ISODate("2024-01-15T10:30:00Z")
}
```

---

## 2. API Endpoints

### Base URL
```
/api/notifications
```

### Available Endpoints

#### 1. Get All Notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1...",
      "recipient": "507f...",
      "recipientModel": "Student",
      "type": "complaint_status_changed",
      "title": "Complaint Status Updated",
      "message": "Your complaint CMP00005 status changed to 'In Progress'",
      "relatedId": "65a2...",
      "relatedModel": "Complaint",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 2. Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 5
}
```

#### 3. Mark as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1...",
    "isRead": true,
    // ... other fields
  }
}
```

#### 4. Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

#### 5. Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

## 3. How Notifications Are Created

### Trigger Points

Notifications are created automatically when certain events occur:

#### Event 1: Complaint Status Changed

**Trigger:** Admin/Staff updates complaint status

**Location:** `complaintController.updateComplaintStatus()`

**Implementation:**
```javascript
const { createNotification } = require('./notificationController');

async function updateComplaintStatus(req, res) {
  // ... update complaint status
  
  // Create notification for student
  await createNotification({
    recipient: complaint.student,
    recipientModel: 'Student',
    type: 'complaint_status_changed',
    title: 'Complaint Status Updated',
    message: `Your complaint ${complaint.complaintId} status changed to '${status}'`,
    relatedId: complaint._id,
    relatedModel: 'Complaint'
  });
  
  // ... send response
}
```

#### Event 2: Complaint Assigned to Staff

**Trigger:** Admin assigns complaint to staff member

**Location:** `adminController.assignComplaint()`

**Implementation:**
```javascript
async function assignComplaint(req, res) {
  // ... assign complaint
  
  // Notify staff member
  await createNotification({
    recipient: staffId,
    recipientModel: 'Staff',
    type: 'complaint_assigned',
    title: 'New Complaint Assigned',
    message: `Complaint ${complaint.complaintId} has been assigned to you`,
    relatedId: complaint._id,
    relatedModel: 'Complaint'
  });
  
  // Notify student
  await createNotification({
    recipient: complaint.student,
    recipientModel: 'Student',
    type: 'complaint_updated',
    title: 'Complaint Assigned',
    message: `Your complaint ${complaint.complaintId} has been assigned to ${staff.name}`,
    relatedId: complaint._id,
    relatedModel: 'Complaint'
  });
}
```

#### Event 3: New Complaint Created

**Trigger:** Student creates a new complaint

**Location:** `complaintController.createComplaint()`

**Implementation:**
```javascript
async function createComplaint(req, res) {
  // ... create complaint
  
  // Notify all admins
  const admins = await Admin.find({ isActive: true });
  
  for (const admin of admins) {
    await createNotification({
      recipient: admin._id,
      recipientModel: 'Admin',
      type: 'new_complaint',
      title: 'New Complaint Received',
      message: `New complaint ${complaint.complaintId} from ${student.fullName}`,
      relatedId: complaint._id,
      relatedModel: 'Complaint'
    });
  }
}
```

---

## 4. Data Flow

### Complete Notification Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    EVENT OCCURS                             │
│  (e.g., Admin updates complaint status)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              CONTROLLER HANDLES EVENT                       │
│  complaintController.updateComplaintStatus()               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         CREATE NOTIFICATION IN DATABASE                     │
│  createNotification({                                       │
│    recipient: studentId,                                    │
│    type: 'complaint_status_changed',                       │
│    message: 'Status changed to In Progress'                │
│  })                                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         NOTIFICATION SAVED TO MONGODB                       │
│  {                                                          │
│    recipient: ObjectId("507f..."),                         │
│    isRead: false,                                          │
│    createdAt: Date.now()                                   │
│  }                                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         FRONTEND POLLS FOR NOTIFICATIONS                    │
│  GET /api/notifications/unread-count                       │
│  (Every 30 seconds or on page load)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         BACKEND RETURNS UNREAD COUNT                        │
│  { success: true, count: 1 }                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         FRONTEND UPDATES NOTIFICATION BADGE                 │
│  🔔 (1)  ← Red badge shows unread count                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         USER CLICKS NOTIFICATION BELL                       │
│  Opens notification dropdown/panel                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         FETCH ALL NOTIFICATIONS                             │
│  GET /api/notifications                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         DISPLAY NOTIFICATIONS                               │
│  ┌─────────────────────────────────────────────┐          │
│  │ 🔔 Complaint Status Updated                 │          │
│  │ Your complaint CMP00005 status changed      │          │
│  │ 2 minutes ago                               │          │
│  └─────────────────────────────────────────────┘          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         USER CLICKS NOTIFICATION                            │
│  PUT /api/notifications/:id/read                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         MARK AS READ IN DATABASE                            │
│  { isRead: true }                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         NAVIGATE TO RELATED CONTENT                         │
│  (e.g., Go to complaint details page)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Frontend Implementation

### Notification Bell Component

```javascript
// NotificationBell.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch unread count on mount and every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    await api.put(`/notifications/${notification._id}/read`);
    
    // Navigate to related content
    if (notification.relatedModel === 'Complaint') {
      navigate(`/complaints/${notification.relatedId}`);
    }
    
    // Refresh count
    fetchUnreadCount();
  };

  return (
    <div className="notification-bell">
      <button onClick={handleBellClick}>
        🔔
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>
      
      {showDropdown && (
        <div className="notification-dropdown">
          {notifications.map(notification => (
            <div 
              key={notification._id}
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
              <span>{formatDate(notification.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 6. Use Cases

### Use Case 1: Student Gets Notified of Status Change

**Scenario:** Admin changes complaint status from "Pending" to "In Progress"

**Flow:**
1. Admin updates status in AdminComplaints page
2. Backend creates notification for student
3. Student's notification bell shows (1)
4. Student clicks bell and sees: "Your complaint CMP00005 status changed to 'In Progress'"
5. Student clicks notification
6. Navigates to complaint details
7. Notification marked as read
8. Badge count decreases

### Use Case 2: Staff Gets Notified of Assignment

**Scenario:** Admin assigns complaint to staff member

**Flow:**
1. Admin assigns complaint to "John (Staff)"
2. Backend creates notification for John
3. John's notification bell shows (1)
4. John sees: "Complaint CMP00005 has been assigned to you"
5. John clicks notification
6. Opens complaint details
7. Can start working on it

### Use Case 3: Admin Gets Notified of New Complaint

**Scenario:** Student creates new complaint

**Flow:**
1. Student submits complaint form
2. Backend creates notifications for all admins
3. All admin notification bells show (1)
4. Admins see: "New complaint CMP00005 from John Doe"
5. Admin clicks notification
6. Opens complaint to review and assign

---

## 7. Implementation Checklist

### Backend (Already Implemented ✅)

- [x] Notification model with schema
- [x] Notification controller with CRUD operations
- [x] Notification routes with authentication
- [x] Helper function to create notifications
- [x] Database indexes for performance

### Backend (To Be Implemented)

- [ ] Integrate createNotification in complaintController
- [ ] Integrate createNotification in adminController
- [ ] Add notification triggers for all events
- [ ] Add notification cleanup (delete old notifications)

### Frontend (To Be Implemented)

- [ ] Notification bell component
- [ ] Notification dropdown/panel
- [ ] Unread count badge
- [ ] Auto-refresh mechanism (polling or WebSocket)
- [ ] Mark as read functionality
- [ ] Navigation to related content
- [ ] Notification sound/toast (optional)

---

## 8. Advanced Features (Future Enhancements)

### Real-Time Notifications with WebSocket

Instead of polling every 30 seconds, use WebSocket for instant notifications:

```javascript
// Backend: socket.io
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });
});

// When creating notification
io.to(`user_${recipientId}`).emit('new_notification', notification);

// Frontend: Listen for notifications
socket.on('new_notification', (notification) => {
  setUnreadCount(prev => prev + 1);
  showToast(notification.title);
});
```

### Push Notifications

For mobile/desktop notifications:

```javascript
// Request permission
Notification.requestPermission();

// Show notification
new Notification(notification.title, {
  body: notification.message,
  icon: '/logo.png'
});
```

### Email Notifications

Send email for important notifications:

```javascript
const nodemailer = require('nodemailer');

async function sendEmailNotification(user, notification) {
  await transporter.sendMail({
    to: user.email,
    subject: notification.title,
    html: `<p>${notification.message}</p>`
  });
}
```

---

## 9. Testing

### Test Notification Creation

```javascript
// test-notifications.js
const axios = require('axios');

async function testNotifications() {
  // Login as student
  const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
    email: 'student@test.com',
    password: 'student123'
  });
  
  const token = loginRes.data.token;
  
  // Get unread count
  const countRes = await axios.get(
    'http://localhost:3001/api/notifications/unread-count',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  console.log('Unread count:', countRes.data.count);
  
  // Get all notifications
  const notifRes = await axios.get(
    'http://localhost:3001/api/notifications',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  console.log('Notifications:', notifRes.data.data);
}

testNotifications();
```

---

## 10. Summary

### How It Works

1. **Event Occurs** - User action triggers an event (e.g., status change)
2. **Notification Created** - Backend creates notification in database
3. **Frontend Polls** - Frontend checks for new notifications periodically
4. **Badge Updates** - Unread count displayed on notification bell
5. **User Clicks** - User opens notification dropdown
6. **Mark as Read** - Notification marked as read when clicked
7. **Navigate** - User navigates to related content

### Key Benefits

✅ **Real-time Updates** - Users stay informed of important events
✅ **Role-Based** - Different notifications for students, staff, and admin
✅ **Persistent** - Notifications stored in database
✅ **Trackable** - Read/unread status tracked
✅ **Actionable** - Click to navigate to related content

### Current Status

- ✅ Backend API fully implemented
- ✅ Database model ready
- ⏳ Frontend integration pending
- ⏳ Event triggers pending

The notification system is architecturally complete and ready for integration!

