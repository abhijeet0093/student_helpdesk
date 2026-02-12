# Module 5: Student Dashboard & Student Corner - Implementation Guide

## Overview

This module provides students with a personalized dashboard showing their complaint statistics and an academic social space (Student Corner) for sharing study-related content.

---

## 🎯 Implemented Features

### Part A: Student Dashboard

**Dashboard Data:**
- Student basic information (name, roll number, department, semester)
- Total complaints raised
- Complaints count by status (Pending, In Progress, Resolved, Rejected)
- Latest complaint details

**Characteristics:**
- Read-only endpoint
- No data updates from dashboard
- Aggregated statistics

### Part B: Student Corner (Posts)

**Post Management:**
- Create posts with text content
- Optional file attachment (images/PDFs)
- View feed of all posts
- Pagination support

**Interactions:**
- Like/Unlike posts (toggle-based)
- Add comments to posts
- Report inappropriate posts
- Delete own posts

**Security:**
- Only logged-in students can post
- Students can only delete their own posts
- Duplicate likes prevented
- Reported posts flagged for admin review

---

## 📁 Files Created

### Models
- `backend/models/Post.js` - Post schema with likes and comments

### Controllers
- `backend/controllers/dashboardController.js` - Dashboard data
- `backend/controllers/postController.js` - Post operations

### Routes
- `backend/routes/dashboardRoutes.js` - Dashboard endpoint
- `backend/routes/postRoutes.js` - Post endpoints

### Config
- `backend/config/postUploadConfig.js` - File upload for posts

### Updates
- `backend/server.js` - Added dashboard and post routes
- `backend/test-api.http` - Added test endpoints

---

## 🗄️ Database Schema

### Post Model
```javascript
{
  studentId: ObjectId,           // Reference to Student
  studentName: String,           // Cached for display
  studentRollNumber: String,     // Cached for display
  contentText: String,           // Post content (10-2000 chars)
  attachmentPath: String,        // Optional file path
  likes: [ObjectId],             // Array of student IDs who liked
  comments: [{
    studentId: ObjectId,
    studentName: String,
    text: String,                // Comment text (max 500 chars)
    timestamp: Date
  }],
  isReported: Boolean,           // Flag for admin review
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Student Dashboard

**Get Dashboard Data**
```
GET /api/student/dashboard
Headers: Authorization: Bearer <student_token>

Response:
{
  "success": true,
  "data": {
    "studentInfo": {
      "name": "Rahul Kumar Sharma",
      "rollNumber": "CS2024001",
      "department": "Computer Science",
      "semester": 6,
      "email": "rahul.cs2024001@college.edu"
    },
    "complaintStats": {
      "total": 5,
      "byStatus": {
        "pending": 1,
        "inProgress": 2,
        "resolved": 2,
        "rejected": 0
      }
    },
    "recentComplaint": {
      "complaintId": "CMP2024001",
      "category": "Infrastructure",
      "status": "In Progress",
      "createdAt": "2024-02-08T10:00:00Z",
      "updatedAt": "2024-02-08T11:00:00Z"
    }
  }
}
```

---

### Student Corner (Posts)

**Create Post**
```
POST /api/posts
Headers: Authorization: Bearer <student_token>
Content-Type: application/json

Body:
{
  "contentText": "Just finished studying Data Structures! Anyone wants to discuss?"
}

Response:
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "postId": "65a1b2c3d4e5f6789abcdef0",
    "contentText": "Just finished studying...",
    "attachmentPath": null,
    "createdAt": "2024-02-08T12:00:00Z"
  }
}
```

**Create Post with Attachment**
```
POST /api/posts
Headers: Authorization: Bearer <student_token>
Content-Type: multipart/form-data

Body (FormData):
- contentText: "Check out these notes"
- attachment: <file>

Response: Same as above with attachmentPath
```

**Get Feed**
```
GET /api/posts?page=1&limit=20
Headers: Authorization: Bearer <student_token>

Response:
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "...",
        "studentName": "Rahul Kumar Sharma",
        "studentRollNumber": "CS2024001",
        "contentText": "Just finished studying...",
        "attachmentPath": null,
        "likesCount": 5,
        "commentsCount": 2,
        "comments": [
          {
            "id": "...",
            "studentName": "Priya Singh",
            "text": "Great post!",
            "timestamp": "2024-02-08T12:05:00Z"
          }
        ],
        "createdAt": "2024-02-08T12:00:00Z",
        "isLikedByMe": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalPosts": 45,
      "limit": 20
    }
  }
}
```

**Like/Unlike Post**
```
POST /api/posts/:postId/like
Headers: Authorization: Bearer <student_token>

Response (Like):
{
  "success": true,
  "message": "Post liked",
  "data": {
    "likesCount": 6,
    "isLiked": true
  }
}

Response (Unlike):
{
  "success": true,
  "message": "Post unliked",
  "data": {
    "likesCount": 5,
    "isLiked": false
  }
}
```

**Add Comment**
```
POST /api/posts/:postId/comment
Headers: Authorization: Bearer <student_token>
Content-Type: application/json

Body:
{
  "text": "Great post! Very helpful."
}

Response:
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "comment": {
      "id": "...",
      "studentName": "Priya Singh",
      "text": "Great post! Very helpful.",
      "timestamp": "2024-02-08T12:10:00Z"
    },
    "commentsCount": 3
  }
}
```

**Report Post**
```
POST /api/posts/:postId/report
Headers: Authorization: Bearer <student_token>

Response:
{
  "success": true,
  "message": "Post reported successfully. Admin will review it."
}
```

**Delete Own Post**
```
DELETE /api/posts/:postId
Headers: Authorization: Bearer <student_token>

Response:
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

## 🔒 Security & Validation

### Input Validation

**Post Content:**
- Minimum length: 10 characters
- Maximum length: 2000 characters
- Cannot be empty

**Comment Text:**
- Maximum length: 500 characters
- Cannot be empty

**File Upload:**
- Allowed types: JPG, PNG, GIF, PDF
- Maximum size: 5MB
- Stored in `uploads/posts/`

### Permission Rules

**Create Post:**
- Only authenticated students
- Must have valid JWT token

**Like Post:**
- Toggle-based (like/unlike)
- Prevents duplicate likes
- Same endpoint for both actions

**Comment:**
- Only authenticated students
- Comment length validated

**Delete Post:**
- Only post owner can delete
- Verified by comparing studentId

**Report Post:**
- Any student can report
- Cannot report already reported posts
- Flags post for admin review

---

## 🔄 Data Flow

### Dashboard Data Flow

```
1. Student requests dashboard
   → GET /api/student/dashboard
   → JWT token in header

2. Middleware validates token
   → Extract studentId

3. Controller fetches data
   → Student basic info from Student model
   → Complaint statistics from Complaint model
   → Latest complaint details

4. Aggregate data
   → Count complaints by status
   → Format response

5. Return dashboard data
   → Student info
   → Complaint stats
   → Recent complaint
```

### Create Post Flow

```
1. Student creates post
   → POST /api/posts
   → Content text + optional file

2. Validate input
   → Check text length (10-2000)
   → Check file type if uploaded

3. Upload file (if present)
   → Multer saves to uploads/posts/
   → Generate unique filename

4. Store post
   → Create Post document
   → Include student details
   → Initialize empty likes/comments arrays

5. Return post data
   → Post ID
   → Content
   → Attachment path
```

### Like/Unlike Flow

```
1. Student clicks like
   → POST /api/posts/:postId/like

2. Find post
   → Query by postId

3. Check if already liked
   → Search studentId in likes array

4. Toggle like
   → If found: Remove from array (unlike)
   → If not found: Add to array (like)

5. Save and return
   → Updated likes count
   → Current like status
```

### Add Comment Flow

```
1. Student adds comment
   → POST /api/posts/:postId/comment
   → Comment text in body

2. Validate comment
   → Check length (max 500)
   → Check not empty

3. Get student details
   → Fetch student name

4. Add to comments array
   → Push comment object
   → Include timestamp

5. Return comment data
   → Comment details
   → Updated comments count
```

---

## 🧪 Testing

### Test Dashboard

```bash
# 1. Login as student
POST /api/auth/student/login
Body: { "rollNumber": "CS2024001", "password": "Test@123" }

# 2. Get dashboard
GET /api/student/dashboard
Headers: Authorization: Bearer <token>

# Should return student info and complaint stats
```

### Test Post Creation

```bash
# Create text-only post
POST /api/posts
Headers: Authorization: Bearer <token>
Body: {
  "contentText": "Just finished studying algorithms!"
}

# Create post with attachment (use Postman/Thunder Client)
POST /api/posts
Headers: Authorization: Bearer <token>
Body (FormData):
- contentText: "Check out these notes"
- attachment: <select file>
```

### Test Feed

```bash
# Get all posts
GET /api/posts
Headers: Authorization: Bearer <token>

# Get with pagination
GET /api/posts?page=1&limit=10
Headers: Authorization: Bearer <token>
```

### Test Interactions

```bash
# Like a post
POST /api/posts/POST_ID/like
Headers: Authorization: Bearer <token>

# Unlike (same endpoint)
POST /api/posts/POST_ID/like
Headers: Authorization: Bearer <token>

# Add comment
POST /api/posts/POST_ID/comment
Headers: Authorization: Bearer <token>
Body: { "text": "Great post!" }

# Report post
POST /api/posts/POST_ID/report
Headers: Authorization: Bearer <token>

# Delete own post
DELETE /api/posts/POST_ID
Headers: Authorization: Bearer <token>
```

---

## 📊 Database Queries

### Get Dashboard Data
```javascript
// Student info
Student.findById(studentId).select('fullName rollNumber department semester email')

// Complaint counts
Complaint.countDocuments({ studentId, status: 'Pending' })

// Latest complaint
Complaint.findOne({ studentId }).sort({ createdAt: -1 }).limit(1)
```

### Get Feed
```javascript
// All posts (exclude reported)
Post.find({ isReported: false })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
```

### Toggle Like
```javascript
// Check if liked
const likeIndex = post.likes.indexOf(studentId);

// Unlike
if (likeIndex > -1) {
  post.likes.splice(likeIndex, 1);
}

// Like
else {
  post.likes.push(studentId);
}
```

---

## 🎯 Key Features

✅ **Student Dashboard**
- Personal info display
- Complaint statistics
- Recent complaint status

✅ **Post Management**
- Create posts with text
- Optional file attachments
- View feed with pagination
- Delete own posts

✅ **Social Interactions**
- Like/Unlike (toggle)
- Add comments
- Report inappropriate content

✅ **Security**
- Student authentication required
- Own post deletion only
- Duplicate like prevention
- Input validation

✅ **File Upload**
- Images and PDFs supported
- 5MB size limit
- Secure storage

---

## 📝 Validation Rules

### Post Content
- Minimum: 10 characters
- Maximum: 2000 characters
- Cannot be empty

### Comment
- Maximum: 500 characters
- Cannot be empty

### File Upload
- Types: JPG, PNG, GIF, PDF
- Size: Max 5MB

---

## ✨ Summary

Module 5 is complete with:
- ✅ Student dashboard with complaint stats
- ✅ Post creation with attachments
- ✅ Feed with pagination
- ✅ Like/Unlike functionality
- ✅ Comment system
- ✅ Report mechanism
- ✅ Delete own posts
- ✅ Input validation
- ✅ File upload support

**Status:** Fully functional backend ready for frontend integration! 🎉

**Total Progress: 6 out of 7 modules complete (86%)** 🚀
