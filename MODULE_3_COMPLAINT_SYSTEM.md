# Module 3: Complaint Management System
## Smart Campus Helpdesk & Student Ecosystem

---

## OBJECTIVE

**Allow verified students to:**
- ✅ Raise complaints from anywhere (web browser)
- ✅ Upload images as proof/evidence
- ✅ Track complaint status in real-time
- ✅ View complaint history

**Allow admin to:**
- ✅ View all complaints
- ✅ Filter by status, category, priority
- ✅ Update complaint status
- ✅ Assign complaints to staff
- ✅ Add resolution notes
- ✅ Close resolved complaints

---

## 1. COMPLAINT DATA MODEL (MongoDB)

### Collection: `complaints`

**Purpose:** Store all student complaints with full details

**Complete Schema:**
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789abcdef0"),
  
  // Unique Identifier
  complaintId: "CMP2024001",              // Auto-generated unique ID
  
  // Student Information (from authenticated user)
  studentId: ObjectId("user_id_here"),    // Reference to users collection
  studentName: "Rahul Kumar Sharma",      // Cached for quick display
  studentRollNumber: "CS2024001",         // Cached for quick display
  studentDepartment: "Computer Science",  // Cached for quick display
  studentEmail: "rahul.cs2024001@college.edu",
  studentPhone: "9876543210",
  
  // Complaint Details
  category: "Infrastructure",             // See categories list below
  subCategory: "Classroom",               // Optional sub-category
  subject: "Broken projector in Room 301",
  description: "The projector in Room 301 has not been working since last week. We are unable to attend online lectures. Please fix it urgently.",
  
  // Priority & Status
  priority: "high",                       // low | medium | high | urgent
  status: "pending",                      // See lifecycle states below
  
  // Location Information
  location: {
    building: "Main Block",
    floor: "3rd Floor",
    roomNumber: "301",
    landmark: "Near Computer Lab"
  },
  
  // Attachments
  attachments: [
    {
      fileName: "broken_projector.jpg",
      filePath: "/uploads/complaints/2024/01/broken_projector_1705234567890.jpg",
      fileSize: 245678,                   // In bytes
      mimeType: "image/jpeg",
      uploadedAt: ISODate("2024-01-15T10:30:00Z")
    },
    {
      fileName: "error_screen.jpg",
      filePath: "/uploads/complaints/2024/01/error_screen_1705234589123.jpg",
      fileSize: 189234,
      mimeType: "image/jpeg",
      uploadedAt: ISODate("2024-01-15T10:31:00Z")
    }
  ],
  
  // Admin Actions
  assignedTo: ObjectId("admin_id_here"),  // Admin/Staff who will handle
  assignedToName: "Mr. Rajesh Kumar",     // Cached name
  assignedAt: ISODate("2024-01-15T11:00:00Z"),
  
  // Resolution Details
  resolutionNotes: "Projector has been repaired. New bulb installed. Tested and working fine.",
  resolvedBy: ObjectId("admin_id_here"),
  resolvedByName: "Mr. Rajesh Kumar",
  resolvedAt: ISODate("2024-01-16T14:30:00Z"),
  
  // Status History (Track all changes)
  statusHistory: [
    {
      status: "pending",
      changedBy: ObjectId("user_id_here"),
      changedByName: "Rahul Kumar Sharma",
      changedByRole: "student",
      timestamp: ISODate("2024-01-15T10:30:00Z"),
      note: "Complaint submitted"
    },
    {
      status: "in-progress",
      changedBy: ObjectId("admin_id_here"),
      changedByName: "Mr. Rajesh Kumar",
      changedByRole: "admin",
      timestamp: ISODate("2024-01-15T11:00:00Z"),
      note: "Assigned to maintenance team"
    },
    {
      status: "resolved",
      changedBy: ObjectId("admin_id_here"),
      changedByName: "Mr. Rajesh Kumar",
      changedByRole: "admin",
      timestamp: ISODate("2024-01-16T14:30:00Z"),
      note: "Projector repaired successfully"
    }
  ],
  
  // Timestamps
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-16T14:30:00Z"),
  
  // Soft Delete (for archiving)
  isDeleted: false,
  deletedAt: null
}
```


---

### Complaint Categories

**Predefined categories for easy filtering:**

```javascript
const COMPLAINT_CATEGORIES = {
  INFRASTRUCTURE: {
    name: "Infrastructure",
    subCategories: [
      "Classroom",
      "Laboratory",
      "Library",
      "Washroom",
      "Parking",
      "Building Maintenance",
      "Electrical",
      "Plumbing",
      "Furniture"
    ]
  },
  
  ACADEMIC: {
    name: "Academic",
    subCategories: [
      "Timetable Issue",
      "Exam Related",
      "Assignment Issue",
      "Faculty Concern",
      "Course Material",
      "Attendance Issue"
    ]
  },
  
  HOSTEL: {
    name: "Hostel",
    subCategories: [
      "Room Issue",
      "Mess Food",
      "Cleanliness",
      "Security",
      "Maintenance",
      "Internet/WiFi"
    ]
  },
  
  TRANSPORT: {
    name: "Transport",
    subCategories: [
      "Bus Timing",
      "Bus Condition",
      "Route Issue",
      "Driver Behavior"
    ]
  },
  
  IT_SERVICES: {
    name: "IT Services",
    subCategories: [
      "WiFi Issue",
      "Computer Lab",
      "Website Issue",
      "Email Problem",
      "Software Installation"
    ]
  },
  
  ADMINISTRATION: {
    name: "Administration",
    subCategories: [
      "Fee Related",
      "Document Issue",
      "Certificate Delay",
      "ID Card Issue",
      "General Query"
    ]
  },
  
  SECURITY: {
    name: "Security",
    subCategories: [
      "Safety Concern",
      "Lost & Found",
      "Unauthorized Entry",
      "Emergency"
    ]
  },
  
  OTHER: {
    name: "Other",
    subCategories: [
      "Suggestion",
      "Feedback",
      "Miscellaneous"
    ]
  }
};
```


---

## 2. IMAGE STORAGE STRATEGY (Local Server)

### Storage Structure

**Base Upload Directory:** `backend/uploads/complaints/`

**Organized by Year and Month:**
```
backend/
└── uploads/
    └── complaints/
        ├── 2024/
        │   ├── 01/                    # January 2024
        │   │   ├── broken_projector_1705234567890.jpg
        │   │   ├── error_screen_1705234589123.jpg
        │   │   └── wifi_issue_1705345678901.png
        │   │
        │   ├── 02/                    # February 2024
        │   │   ├── mess_food_1707123456789.jpg
        │   │   └── lab_computer_1707234567890.jpg
        │   │
        │   └── 03/                    # March 2024
        │
        └── 2025/
            └── 01/
```

**Why This Structure?**
- Easy to find files by date
- Prevents too many files in one folder
- Easy to backup monthly
- Easy to delete old files


---

### File Upload Process

**Step-by-Step:**

**Step 1: Student Selects Image**
- Student clicks "Upload Image" button
- Browser opens file picker
- Student selects image file (JPG, PNG, etc.)

**Step 2: Frontend Validation**
```javascript
// Check file type
const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
if (!allowedTypes.includes(file.type)) {
  return error("Only image files allowed (JPG, PNG, GIF)");
}

// Check file size (max 5MB)
const maxSize = 5 * 1024 * 1024;  // 5MB in bytes
if (file.size > maxSize) {
  return error("Image size must be less than 5MB");
}
```

**Step 3: Upload to Server**
```javascript
// Create FormData
const formData = new FormData();
formData.append('image', file);
formData.append('complaintId', 'CMP2024001');

// Send to backend
const response = await fetch('/api/complaints/upload-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Step 4: Backend Receives File**
```javascript
// Using multer middleware
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create year/month folder structure
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const uploadPath = `uploads/complaints/${year}/${month}`;
    
    // Create folder if doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  
  filename: function (req, file, cb) {
    // Generate unique filename
    const originalName = file.originalname.replace(/\s+/g, '_');
    const timestamp = Date.now();
    const fileName = `${originalName.split('.')[0]}_${timestamp}.${file.originalname.split('.').pop()}`;
    
    cb(null, fileName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB limit
  fileFilter: function (req, file, cb) {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});
```

**Step 5: Save File Info to Database**
```javascript
// After file is saved
const fileInfo = {
  fileName: file.originalname,
  filePath: `/uploads/complaints/${year}/${month}/${file.filename}`,
  fileSize: file.size,
  mimeType: file.mimetype,
  uploadedAt: new Date()
};

// Add to complaint's attachments array
await Complaint.findByIdAndUpdate(
  complaintId,
  { $push: { attachments: fileInfo } }
);
```

**Step 6: Return File URL**
```javascript
return success({
  message: "Image uploaded successfully",
  fileUrl: `/uploads/complaints/${year}/${month}/${file.filename}`
});
```


---

### Serving Images to Frontend

**Backend Configuration:**
```javascript
// In server.js
const express = require('express');
const app = express();

// Serve static files from uploads folder
app.use('/uploads', express.static('uploads'));

// Now images are accessible at:
// http://college-server.edu/uploads/complaints/2024/01/broken_projector_1705234567890.jpg
```

**Frontend Display:**
```javascript
// In React component
<img 
  src={`${API_BASE_URL}${complaint.attachments[0].filePath}`}
  alt="Complaint evidence"
/>

// Example URL:
// http://college-server.edu/uploads/complaints/2024/01/broken_projector_1705234567890.jpg
```


---

### Storage Best Practices

**1. File Naming Convention:**
- Original name + timestamp
- Example: `broken_projector_1705234567890.jpg`
- Prevents filename conflicts
- Easy to identify

**2. Security Measures:**
```javascript
// Validate file type by content, not just extension
const fileType = require('file-type');

const buffer = await fs.readFile(filePath);
const type = await fileType.fromBuffer(buffer);

if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
  // Delete file and reject
  fs.unlinkSync(filePath);
  return error("Invalid file type");
}
```

**3. Disk Space Management:**
- Set maximum total storage limit
- Auto-delete complaints older than 2 years
- Compress images if too large
- Admin can manually delete old files

**4. Backup Strategy:**
- Daily backup of uploads folder
- Store backups on separate drive
- Keep backups for 6 months


---

## 3. COMPLAINT LIFECYCLE STATES

### State Diagram

```
┌─────────────┐
│   PENDING   │ ← Student submits complaint
└──────┬──────┘
       │
       │ Admin reviews and assigns
       ▼
┌─────────────┐
│ IN-PROGRESS │ ← Admin/Staff working on it
└──────┬──────┘
       │
       │ Issue fixed
       ▼
┌─────────────┐
│  RESOLVED   │ ← Admin marks as resolved
└──────┬──────┘
       │
       │ Student confirms OR auto-close after 7 days
       ▼
┌─────────────┐
│   CLOSED    │ ← Final state (archived)
└─────────────┘

       │ (Optional path)
       │ Student not satisfied
       ▼
┌─────────────┐
│  REOPENED   │ ← Goes back to IN-PROGRESS
└─────────────┘
```


---

### Detailed State Descriptions

**1. PENDING**
- **When:** Complaint just submitted by student
- **Who can see:** Student (own complaint), All admins
- **Actions allowed:**
  - Admin: Assign to staff, Change priority, Move to in-progress
  - Student: View details, Add more images, Cancel complaint
- **Auto-actions:** None
- **Notification:** Email to admin team

**2. IN-PROGRESS**
- **When:** Admin has assigned complaint to staff
- **Who can see:** Student (own complaint), Assigned admin, All admins
- **Actions allowed:**
  - Admin: Add notes, Update status, Mark as resolved
  - Student: View progress, Add comments
- **Auto-actions:** Send reminder if no update for 3 days
- **Notification:** SMS to student when status changes

**3. RESOLVED**
- **When:** Admin marks issue as fixed
- **Who can see:** Student (own complaint), Assigned admin, All admins
- **Actions allowed:**
  - Admin: Add resolution notes, Close complaint
  - Student: Confirm resolution, Reopen if not satisfied
- **Auto-actions:** Auto-close after 7 days if no response
- **Notification:** Email + SMS to student

**4. CLOSED**
- **When:** Student confirms OR auto-closed after 7 days
- **Who can see:** Student (own complaint), All admins
- **Actions allowed:**
  - Admin: View only (archived)
  - Student: View only, Can raise new complaint
- **Auto-actions:** Move to archive after 1 year
- **Notification:** None

**5. REOPENED** (Optional)
- **When:** Student not satisfied with resolution
- **Who can see:** Student (own complaint), All admins
- **Actions allowed:**
  - Admin: Re-assign, Add new notes, Resolve again
  - Student: Add reason for reopening
- **Auto-actions:** High priority flag added
- **Notification:** Email to admin team with "REOPENED" tag
- **Next state:** Goes back to IN-PROGRESS

**6. CANCELLED** (Optional)
- **When:** Student cancels before admin starts work
- **Who can see:** Student (own complaint), All admins
- **Actions allowed:**
  - Student: View only
  - Admin: View only
- **Auto-actions:** None
- **Notification:** None


---

### State Transition Rules

**Valid Transitions:**
```javascript
const VALID_TRANSITIONS = {
  'pending': ['in-progress', 'cancelled'],
  'in-progress': ['resolved', 'cancelled'],
  'resolved': ['closed', 'reopened'],
  'reopened': ['in-progress'],
  'closed': [],                    // Final state, no transitions
  'cancelled': []                  // Final state, no transitions
};

// Validation function
function canTransition(currentStatus, newStatus) {
  return VALID_TRANSITIONS[currentStatus].includes(newStatus);
}

// Example usage
canTransition('pending', 'resolved');      // false (must go through in-progress)
canTransition('pending', 'in-progress');   // true
canTransition('resolved', 'closed');       // true
```

**Who Can Change Status:**
```javascript
const STATUS_PERMISSIONS = {
  'pending': {
    'in-progress': ['admin', 'staff'],
    'cancelled': ['student', 'admin']
  },
  'in-progress': {
    'resolved': ['admin', 'staff'],
    'cancelled': ['admin']
  },
  'resolved': {
    'closed': ['admin', 'student', 'auto'],
    'reopened': ['student']
  },
  'reopened': {
    'in-progress': ['admin', 'staff']
  }
};
```


---

## 4. API ENDPOINTS DESIGN

### Student Endpoints

**1. Create New Complaint**
```
POST /api/complaints
Authorization: Bearer <student_token>

Request Body:
{
  "category": "Infrastructure",
  "subCategory": "Classroom",
  "subject": "Broken projector in Room 301",
  "description": "The projector has not been working since last week...",
  "priority": "high",
  "location": {
    "building": "Main Block",
    "floor": "3rd Floor",
    "roomNumber": "301",
    "landmark": "Near Computer Lab"
  }
}

Response (Success):
{
  "success": true,
  "message": "Complaint submitted successfully",
  "data": {
    "complaintId": "CMP2024001",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}

Response (Error):
{
  "success": false,
  "error": "Subject is required"
}
```

**2. Upload Image to Complaint**
```
POST /api/complaints/:complaintId/upload-image
Authorization: Bearer <student_token>
Content-Type: multipart/form-data

Request Body (FormData):
- image: <file>

Response (Success):
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "fileName": "broken_projector.jpg",
    "fileUrl": "/uploads/complaints/2024/01/broken_projector_1705234567890.jpg",
    "fileSize": 245678
  }
}
```

**3. Get My Complaints**
```
GET /api/complaints/my-complaints
Authorization: Bearer <student_token>

Query Parameters (optional):
- status: pending | in-progress | resolved | closed
- page: 1
- limit: 10

Response:
{
  "success": true,
  "data": {
    "complaints": [
      {
        "complaintId": "CMP2024001",
        "subject": "Broken projector in Room 301",
        "category": "Infrastructure",
        "status": "in-progress",
        "priority": "high",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T11:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalComplaints": 25,
      "limit": 10
    }
  }
}
```

**4. Get Single Complaint Details**
```
GET /api/complaints/:complaintId
Authorization: Bearer <student_token>

Response:
{
  "success": true,
  "data": {
    "complaintId": "CMP2024001",
    "subject": "Broken projector in Room 301",
    "description": "The projector has not been working...",
    "category": "Infrastructure",
    "subCategory": "Classroom",
    "status": "resolved",
    "priority": "high",
    "location": {
      "building": "Main Block",
      "floor": "3rd Floor",
      "roomNumber": "301"
    },
    "attachments": [
      {
        "fileName": "broken_projector.jpg",
        "filePath": "/uploads/complaints/2024/01/broken_projector_1705234567890.jpg",
        "uploadedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "assignedToName": "Mr. Rajesh Kumar",
    "resolutionNotes": "Projector has been repaired. New bulb installed.",
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2024-01-15T10:30:00Z",
        "note": "Complaint submitted"
      },
      {
        "status": "in-progress",
        "changedByName": "Mr. Rajesh Kumar",
        "timestamp": "2024-01-15T11:00:00Z",
        "note": "Assigned to maintenance team"
      },
      {
        "status": "resolved",
        "changedByName": "Mr. Rajesh Kumar",
        "timestamp": "2024-01-16T14:30:00Z",
        "note": "Projector repaired successfully"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:30:00Z"
  }
}
```

**5. Reopen Complaint**
```
POST /api/complaints/:complaintId/reopen
Authorization: Bearer <student_token>

Request Body:
{
  "reason": "Projector is still not working properly. Screen flickers."
}

Response:
{
  "success": true,
  "message": "Complaint reopened successfully",
  "data": {
    "status": "reopened"
  }
}
```

**6. Cancel Complaint**
```
POST /api/complaints/:complaintId/cancel
Authorization: Bearer <student_token>

Request Body:
{
  "reason": "Issue resolved by itself"
}

Response:
{
  "success": true,
  "message": "Complaint cancelled successfully"
}
```


---

### Admin Endpoints

**1. Get All Complaints (with filters)**
```
GET /api/admin/complaints
Authorization: Bearer <admin_token>

Query Parameters (optional):
- status: pending | in-progress | resolved | closed
- category: Infrastructure | Academic | Hostel | etc.
- priority: low | medium | high | urgent
- department: Computer Science | Mechanical | etc.
- dateFrom: 2024-01-01
- dateTo: 2024-01-31
- search: keyword (searches in subject and description)
- page: 1
- limit: 20
- sortBy: createdAt | priority | status
- sortOrder: asc | desc

Response:
{
  "success": true,
  "data": {
    "complaints": [
      {
        "complaintId": "CMP2024001",
        "studentName": "Rahul Kumar Sharma",
        "studentRollNumber": "CS2024001",
        "studentDepartment": "Computer Science",
        "subject": "Broken projector in Room 301",
        "category": "Infrastructure",
        "status": "pending",
        "priority": "high",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "statistics": {
      "total": 150,
      "pending": 45,
      "inProgress": 60,
      "resolved": 30,
      "closed": 15
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalComplaints": 150,
      "limit": 20
    }
  }
}
```

**2. Assign Complaint to Staff**
```
POST /api/admin/complaints/:complaintId/assign
Authorization: Bearer <admin_token>

Request Body:
{
  "assignedTo": "admin_user_id_here",
  "note": "Please check and fix the projector"
}

Response:
{
  "success": true,
  "message": "Complaint assigned successfully",
  "data": {
    "assignedToName": "Mr. Rajesh Kumar",
    "status": "in-progress"
  }
}
```

**3. Update Complaint Status**
```
PUT /api/admin/complaints/:complaintId/status
Authorization: Bearer <admin_token>

Request Body:
{
  "status": "resolved",
  "note": "Projector has been repaired. New bulb installed. Tested and working fine."
}

Response:
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "status": "resolved",
    "updatedAt": "2024-01-16T14:30:00Z"
  }
}
```

**4. Update Complaint Priority**
```
PUT /api/admin/complaints/:complaintId/priority
Authorization: Bearer <admin_token>

Request Body:
{
  "priority": "urgent",
  "reason": "Multiple students affected"
}

Response:
{
  "success": true,
  "message": "Priority updated successfully"
}
```

**5. Add Admin Note**
```
POST /api/admin/complaints/:complaintId/notes
Authorization: Bearer <admin_token>

Request Body:
{
  "note": "Contacted maintenance team. They will fix it by tomorrow."
}

Response:
{
  "success": true,
  "message": "Note added successfully"
}
```

**6. Get Complaint Statistics**
```
GET /api/admin/complaints/statistics
Authorization: Bearer <admin_token>

Query Parameters (optional):
- dateFrom: 2024-01-01
- dateTo: 2024-01-31
- department: Computer Science

Response:
{
  "success": true,
  "data": {
    "totalComplaints": 150,
    "byStatus": {
      "pending": 45,
      "inProgress": 60,
      "resolved": 30,
      "closed": 15
    },
    "byCategory": {
      "Infrastructure": 60,
      "Academic": 30,
      "Hostel": 25,
      "IT Services": 20,
      "Other": 15
    },
    "byPriority": {
      "low": 40,
      "medium": 60,
      "high": 35,
      "urgent": 15
    },
    "averageResolutionTime": "2.5 days",
    "pendingOlderThan3Days": 12
  }
}
```

**7. Export Complaints Report**
```
GET /api/admin/complaints/export
Authorization: Bearer <admin_token>

Query Parameters:
- format: csv | excel | pdf
- dateFrom: 2024-01-01
- dateTo: 2024-01-31
- status: all | pending | resolved | etc.

Response:
- Downloads file with complaint data
```


---

## 5. DATA FLOW EXPLANATION

### Flow 1: Student Raises Complaint

**Step 1: Student Opens Complaint Form**
- Student logs in and clicks "Raise Complaint"
- React shows complaint form with fields

**Step 2: Student Fills Form**
- Selects category: "Infrastructure"
- Selects sub-category: "Classroom"
- Enters subject: "Broken projector in Room 301"
- Enters description: "The projector has not been working..."
- Selects priority: "High"
- Fills location details
- Clicks "Upload Image" and selects photo

**Step 3: Frontend Validates**
```javascript
// Check required fields
if (!subject || !description || !category) {
  return error("Please fill all required fields");
}

// Check description length
if (description.length < 20) {
  return error("Description must be at least 20 characters");
}
```

**Step 4: Upload Image First**
```javascript
// Upload image to get file path
const formData = new FormData();
formData.append('image', selectedFile);

const uploadResponse = await fetch('/api/complaints/upload-temp-image', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const { fileUrl } = await uploadResponse.json();
```

**Step 5: Submit Complaint**
```javascript
const complaintData = {
  category: "Infrastructure",
  subCategory: "Classroom",
  subject: "Broken projector in Room 301",
  description: "The projector has not been working...",
  priority: "high",
  location: {
    building: "Main Block",
    floor: "3rd Floor",
    roomNumber: "301"
  },
  attachments: [{ filePath: fileUrl }]
};

const response = await fetch('/api/complaints', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(complaintData)
});
```

**Step 6: Backend Receives Request**
```javascript
// Extract user from JWT token
const userId = req.user.id;
const user = await User.findById(userId);

// Generate unique complaint ID
const complaintCount = await Complaint.countDocuments();
const complaintId = `CMP${new Date().getFullYear()}${String(complaintCount + 1).padStart(4, '0')}`;
// Result: CMP2024001

// Create complaint document
const complaint = await Complaint.create({
  complaintId: complaintId,
  studentId: user._id,
  studentName: user.fullName,
  studentRollNumber: user.rollNumber,
  studentDepartment: user.department,
  studentEmail: user.email,
  studentPhone: user.phoneNumber,
  category: req.body.category,
  subCategory: req.body.subCategory,
  subject: req.body.subject,
  description: req.body.description,
  priority: req.body.priority,
  location: req.body.location,
  attachments: req.body.attachments,
  status: 'pending',
  statusHistory: [{
    status: 'pending',
    changedBy: user._id,
    changedByName: user.fullName,
    changedByRole: 'student',
    timestamp: new Date(),
    note: 'Complaint submitted'
  }]
});
```

**Step 7: Send Notifications**
```javascript
// Email to all admins
const admins = await User.find({ role: 'admin' });
admins.forEach(admin => {
  sendEmail(admin.email, 'New Complaint', `
    New complaint received:
    ID: ${complaintId}
    Subject: ${subject}
    Category: ${category}
    Priority: ${priority}
  `);
});

// SMS to student (confirmation)
sendSMS(user.phoneNumber, `
  Your complaint ${complaintId} has been submitted successfully.
  You will be notified when it is assigned to staff.
`);
```

**Step 8: Return Response**
```javascript
return res.json({
  success: true,
  message: "Complaint submitted successfully",
  data: {
    complaintId: complaint.complaintId,
    status: complaint.status,
    createdAt: complaint.createdAt
  }
});
```

**Step 9: Frontend Shows Success**
- Shows success message: "Complaint submitted successfully"
- Displays complaint ID: "CMP2024001"
- Shows "Track Status" button
- Redirects to "My Complaints" page


---

### Flow 2: Admin Views and Assigns Complaint

**Step 1: Admin Logs In**
- Admin enters credentials
- System verifies admin role
- Redirects to admin dashboard

**Step 2: Admin Sees Dashboard**
- Dashboard shows statistics:
  - Total complaints: 150
  - Pending: 45
  - In-progress: 60
  - Resolved: 30
- Shows list of recent complaints

**Step 3: Admin Clicks "View All Complaints"**
- React calls: `GET /api/admin/complaints?status=pending`
- Backend fetches pending complaints from database

**Step 4: Backend Processes Request**
```javascript
// Build query based on filters
const query = { isDeleted: false };

if (req.query.status) {
  query.status = req.query.status;
}

if (req.query.category) {
  query.category = req.query.category;
}

if (req.query.priority) {
  query.priority = req.query.priority;
}

// Pagination
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

// Fetch complaints
const complaints = await Complaint.find(query)
  .sort({ createdAt: -1 })  // Newest first
  .skip(skip)
  .limit(limit)
  .select('complaintId studentName studentRollNumber subject category status priority createdAt');

// Count total
const total = await Complaint.countDocuments(query);

return res.json({
  success: true,
  data: {
    complaints: complaints,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalComplaints: total,
      limit: limit
    }
  }
});
```

**Step 5: Admin Selects a Complaint**
- Admin clicks on complaint "CMP2024001"
- React calls: `GET /api/complaints/CMP2024001`
- Backend returns full complaint details with images

**Step 6: Admin Reviews Complaint**
- Reads subject and description
- Views uploaded images
- Checks location details
- Decides to assign to maintenance staff

**Step 7: Admin Assigns Complaint**
- Admin selects staff member: "Mr. Rajesh Kumar"
- Adds note: "Please check and fix the projector"
- Clicks "Assign" button

**Step 8: Frontend Sends Assignment Request**
```javascript
const response = await fetch(`/api/admin/complaints/CMP2024001/assign`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    assignedTo: "staff_user_id_here",
    note: "Please check and fix the projector"
  })
});
```

**Step 9: Backend Updates Complaint**
```javascript
// Find complaint
const complaint = await Complaint.findOne({ complaintId: 'CMP2024001' });

// Find staff member
const staff = await User.findById(req.body.assignedTo);

// Update complaint
complaint.assignedTo = staff._id;
complaint.assignedToName = staff.fullName;
complaint.assignedAt = new Date();
complaint.status = 'in-progress';

// Add to status history
complaint.statusHistory.push({
  status: 'in-progress',
  changedBy: req.user._id,
  changedByName: req.user.fullName,
  changedByRole: 'admin',
  timestamp: new Date(),
  note: req.body.note
});

await complaint.save();
```

**Step 10: Send Notifications**
```javascript
// Email to assigned staff
sendEmail(staff.email, 'New Complaint Assigned', `
  You have been assigned complaint ${complaint.complaintId}
  Subject: ${complaint.subject}
  Priority: ${complaint.priority}
  Location: ${complaint.location.building}, ${complaint.location.roomNumber}
`);

// SMS to student
sendSMS(complaint.studentPhone, `
  Your complaint ${complaint.complaintId} has been assigned to ${staff.fullName}.
  You will be notified when it is resolved.
`);
```

**Step 11: Frontend Shows Success**
- Shows success message: "Complaint assigned successfully"
- Updates complaint status to "In-Progress"
- Shows assigned staff name


---

### Flow 3: Admin Resolves Complaint

**Step 1: Staff Fixes the Issue**
- Maintenance staff goes to Room 301
- Repairs the projector
- Tests and confirms it's working

**Step 2: Admin Marks as Resolved**
- Admin opens complaint "CMP2024001"
- Clicks "Mark as Resolved" button
- Enters resolution notes: "Projector has been repaired. New bulb installed. Tested and working fine."
- Clicks "Submit"

**Step 3: Frontend Sends Request**
```javascript
const response = await fetch(`/api/admin/complaints/CMP2024001/status`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'resolved',
    note: 'Projector has been repaired. New bulb installed. Tested and working fine.'
  })
});
```

**Step 4: Backend Updates Status**
```javascript
const complaint = await Complaint.findOne({ complaintId: 'CMP2024001' });

// Validate transition
if (!canTransition(complaint.status, 'resolved')) {
  return res.status(400).json({
    success: false,
    error: 'Invalid status transition'
  });
}

// Update complaint
complaint.status = 'resolved';
complaint.resolutionNotes = req.body.note;
complaint.resolvedBy = req.user._id;
complaint.resolvedByName = req.user.fullName;
complaint.resolvedAt = new Date();

// Add to history
complaint.statusHistory.push({
  status: 'resolved',
  changedBy: req.user._id,
  changedByName: req.user.fullName,
  changedByRole: 'admin',
  timestamp: new Date(),
  note: req.body.note
});

await complaint.save();
```

**Step 5: Schedule Auto-Close**
```javascript
// Set auto-close after 7 days if student doesn't respond
const autoCloseDate = new Date();
autoCloseDate.setDate(autoCloseDate.getDate() + 7);

complaint.autoCloseAt = autoCloseDate;
await complaint.save();

// Create scheduled job (using node-cron or similar)
scheduleAutoClose(complaint._id, autoCloseDate);
```

**Step 6: Send Notifications**
```javascript
// Email to student
sendEmail(complaint.studentEmail, 'Complaint Resolved', `
  Your complaint ${complaint.complaintId} has been resolved.
  
  Resolution: ${complaint.resolutionNotes}
  
  If you are satisfied, the complaint will be automatically closed in 7 days.
  If the issue persists, you can reopen the complaint.
`);

// SMS to student
sendSMS(complaint.studentPhone, `
  Your complaint ${complaint.complaintId} has been resolved.
  Check your email for details.
`);
```

**Step 7: Frontend Shows Success**
- Shows success message: "Complaint marked as resolved"
- Updates status badge to "Resolved"
- Shows resolution notes


---

### Flow 4: Student Tracks Complaint Status

**Step 1: Student Opens "My Complaints"**
- Student logs in
- Clicks "My Complaints" in navigation
- React calls: `GET /api/complaints/my-complaints`

**Step 2: Backend Fetches Student's Complaints**
```javascript
// Get user ID from JWT token
const userId = req.user.id;

// Fetch complaints
const complaints = await Complaint.find({
  studentId: userId,
  isDeleted: false
})
.sort({ createdAt: -1 })
.select('complaintId subject category status priority createdAt updatedAt');

return res.json({
  success: true,
  data: {
    complaints: complaints
  }
});
```

**Step 3: Frontend Displays List**
- Shows table with columns:
  - Complaint ID
  - Subject
  - Category
  - Status (with color badge)
  - Priority
  - Date
  - Action (View Details button)

**Step 4: Student Clicks "View Details"**
- React calls: `GET /api/complaints/CMP2024001`
- Backend returns full complaint details

**Step 5: Student Sees Complete Information**
- Complaint ID and date
- Subject and description
- Category and priority
- Current status with color indicator
- Uploaded images (clickable to view full size)
- Assigned staff name (if assigned)
- Status timeline showing all changes:
  - ✅ Submitted on Jan 15, 10:30 AM
  - ✅ Assigned to Mr. Rajesh Kumar on Jan 15, 11:00 AM
  - ✅ Resolved on Jan 16, 2:30 PM
- Resolution notes (if resolved)

**Step 6: Student Can Take Actions**
- If status is "Resolved":
  - Button: "Reopen Complaint" (if not satisfied)
  - Button: "Close Complaint" (if satisfied)
- If status is "Pending":
  - Button: "Cancel Complaint"
  - Button: "Add More Images"


---

### Flow 5: Student Reopens Complaint (Optional)

**Step 1: Student Not Satisfied**
- Student checks resolved complaint
- Finds issue still exists
- Clicks "Reopen Complaint" button

**Step 2: Student Enters Reason**
- Modal popup appears
- Student enters: "Projector is still not working properly. Screen flickers."
- Clicks "Submit"

**Step 3: Frontend Sends Request**
```javascript
const response = await fetch(`/api/complaints/CMP2024001/reopen`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reason: 'Projector is still not working properly. Screen flickers.'
  })
});
```

**Step 4: Backend Updates Status**
```javascript
const complaint = await Complaint.findOne({ complaintId: 'CMP2024001' });

// Check if student owns this complaint
if (complaint.studentId.toString() !== req.user.id) {
  return res.status(403).json({
    success: false,
    error: 'Unauthorized'
  });
}

// Check if can be reopened
if (complaint.status !== 'resolved') {
  return res.status(400).json({
    success: false,
    error: 'Only resolved complaints can be reopened'
  });
}

// Update status
complaint.status = 'reopened';
complaint.priority = 'high';  // Increase priority

// Add to history
complaint.statusHistory.push({
  status: 'reopened',
  changedBy: req.user._id,
  changedByName: req.user.fullName,
  changedByRole: 'student',
  timestamp: new Date(),
  note: `Reopened: ${req.body.reason}`
});

await complaint.save();
```

**Step 5: Send Notifications**
```javascript
// Email to admin team with HIGH PRIORITY tag
const admins = await User.find({ role: 'admin' });
admins.forEach(admin => {
  sendEmail(admin.email, '[REOPENED] Complaint Needs Attention', `
    Complaint ${complaint.complaintId} has been REOPENED by student.
    
    Original Issue: ${complaint.subject}
    Reason for Reopening: ${req.body.reason}
    
    Please review and reassign.
  `);
});

// SMS to previously assigned staff
if (complaint.assignedTo) {
  const staff = await User.findById(complaint.assignedTo);
  sendSMS(staff.phoneNumber, `
    Complaint ${complaint.complaintId} has been reopened.
    Please check and resolve again.
  `);
}
```

**Step 6: Frontend Shows Success**
- Shows message: "Complaint reopened successfully"
- Status changes to "Reopened" with orange badge
- Shows in admin's pending queue


---

## 6. IMPLEMENTATION FILES NEEDED

### Backend Files:

**Models:**
```
backend/models/
├── Complaint.js              # Main complaint schema
└── ComplaintCategory.js      # Category definitions (optional)
```

**Controllers:**
```
backend/controllers/
├── complaintController.js    # Student complaint operations
└── adminComplaintController.js  # Admin complaint management
```

**Routes:**
```
backend/routes/
├── complaintRoutes.js        # Student endpoints
└── adminComplaintRoutes.js   # Admin endpoints
```

**Middleware:**
```
backend/middleware/
├── uploadMiddleware.js       # Multer configuration for images
├── complaintValidator.js     # Validate complaint data
└── ownershipMiddleware.js    # Check if student owns complaint
```

**Utils:**
```
backend/utils/
├── complaintIdGenerator.js   # Generate unique complaint IDs
├── imageProcessor.js         # Compress/resize images
├── notificationService.js    # Send emails/SMS
└── autoCloseScheduler.js     # Schedule auto-close jobs
```

**Uploads Folder:**
```
backend/uploads/
└── complaints/
    └── 2024/
        ├── 01/
        ├── 02/
        └── 03/
```


---

### Frontend Files:

**Components:**
```
frontend/src/modules/complaints/
├── components/
│   ├── ComplaintForm.js           # Form to create complaint
│   ├── ComplaintList.js           # List of complaints
│   ├── ComplaintCard.js           # Single complaint card
│   ├── ComplaintDetails.js        # Full complaint details
│   ├── ImageUploader.js           # Image upload component
│   ├── StatusBadge.js             # Status indicator
│   ├── StatusTimeline.js          # Status history timeline
│   ├── FilterPanel.js             # Filter complaints
│   └── ReopenModal.js             # Reopen complaint modal
│
├── admin/
│   ├── AdminComplaintList.js     # Admin view of all complaints
│   ├── AdminComplaintDetails.js  # Admin complaint details
│   ├── AssignModal.js             # Assign to staff modal
│   ├── ResolveModal.js            # Mark as resolved modal
│   ├── ComplaintStatistics.js    # Dashboard statistics
│   └── ExportButton.js            # Export complaints
│
└── services/
    └── complaintService.js        # API calls for complaints
```

**Pages:**
```
frontend/src/pages/
├── student/
│   ├── MyComplaints.js            # Student's complaints page
│   ├── NewComplaint.js            # Create complaint page
│   └── ComplaintDetail.js         # View single complaint
│
└── admin/
    ├── AllComplaints.js           # Admin complaints dashboard
    └── ComplaintManagement.js     # Manage single complaint
```


---

## 7. SECURITY CONSIDERATIONS

### 1. Authorization Checks

**Student Can Only:**
- View their own complaints
- Create complaints
- Upload images to their own complaints
- Reopen/cancel their own complaints

**Implementation:**
```javascript
// In middleware
async function checkComplaintOwnership(req, res, next) {
  const complaint = await Complaint.findOne({ 
    complaintId: req.params.complaintId 
  });
  
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }
  
  // Check if student owns this complaint
  if (complaint.studentId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }
  
  req.complaint = complaint;
  next();
}
```

### 2. Image Upload Security

**Validations:**
- File type: Only images (JPEG, PNG, GIF)
- File size: Maximum 5MB
- File content: Verify actual file type (not just extension)
- Filename: Sanitize to prevent path traversal

**Implementation:**
```javascript
// Validate file content
const fileType = require('file-type');

async function validateImage(filePath) {
  const buffer = await fs.readFile(filePath);
  const type = await fileType.fromBuffer(buffer);
  
  if (!type || !['image/jpeg', 'image/png', 'image/gif'].includes(type.mime)) {
    fs.unlinkSync(filePath);  // Delete invalid file
    throw new Error('Invalid file type');
  }
}
```

### 3. Rate Limiting

**Prevent Spam:**
- Maximum 5 complaints per student per day
- Maximum 10 image uploads per hour

**Implementation:**
```javascript
const rateLimit = require('express-rate-limit');

const complaintLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,  // 24 hours
  max: 5,  // 5 complaints per day
  message: 'Too many complaints. Please try again tomorrow.'
});

app.post('/api/complaints', complaintLimiter, createComplaint);
```

### 4. Input Sanitization

**Prevent XSS and Injection:**
```javascript
const sanitizeHtml = require('sanitize-html');

function sanitizeInput(text) {
  return sanitizeHtml(text, {
    allowedTags: [],  // No HTML tags allowed
    allowedAttributes: {}
  });
}

// In controller
const subject = sanitizeInput(req.body.subject);
const description = sanitizeInput(req.body.description);
```


---

## 8. NOTIFICATION SYSTEM

### When to Send Notifications:

**To Student:**
1. Complaint submitted (Email + SMS)
2. Complaint assigned to staff (SMS)
3. Status changed to in-progress (SMS)
4. Complaint resolved (Email + SMS)
5. Complaint auto-closed (Email)

**To Admin:**
1. New complaint received (Email)
2. Complaint reopened (Email with HIGH PRIORITY)
3. Complaint pending for more than 3 days (Email reminder)

**To Assigned Staff:**
1. Complaint assigned (Email + SMS)
2. Complaint reopened (SMS)

### Email Template Example:

```javascript
function sendComplaintSubmittedEmail(student, complaint) {
  const emailContent = `
    Dear ${student.fullName},
    
    Your complaint has been submitted successfully.
    
    Complaint ID: ${complaint.complaintId}
    Subject: ${complaint.subject}
    Category: ${complaint.category}
    Priority: ${complaint.priority}
    Status: Pending
    
    You will receive updates via SMS when the status changes.
    
    Track your complaint: ${FRONTEND_URL}/complaints/${complaint.complaintId}
    
    Thank you,
    ${COLLEGE_NAME} Helpdesk Team
  `;
  
  sendEmail(student.email, 'Complaint Submitted', emailContent);
}
```

### SMS Template Example:

```javascript
function sendComplaintAssignedSMS(student, complaint, staff) {
  const message = `Your complaint ${complaint.complaintId} has been assigned to ${staff.fullName}. You will be notified when resolved.`;
  
  sendSMS(student.phoneNumber, message);
}
```


---

## 9. DATABASE INDEXES FOR PERFORMANCE

**Important Indexes:**

```javascript
// In Complaint model
complaintSchema.index({ complaintId: 1 }, { unique: true });
complaintSchema.index({ studentId: 1, createdAt: -1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ priority: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });

// Text search index for subject and description
complaintSchema.index({ 
  subject: 'text', 
  description: 'text' 
});
```

**Why These Indexes?**
- `complaintId`: Fast lookup by ID
- `studentId + createdAt`: Fast "My Complaints" query
- `status + createdAt`: Fast filtering by status
- `category + status`: Fast admin filtering
- `assignedTo + status`: Fast "My Assigned" query for staff
- Text index: Fast search functionality


---

## 10. ADMIN DASHBOARD FEATURES

### Statistics Cards:

```javascript
// Calculate statistics
const stats = {
  total: await Complaint.countDocuments({ isDeleted: false }),
  pending: await Complaint.countDocuments({ status: 'pending' }),
  inProgress: await Complaint.countDocuments({ status: 'in-progress' }),
  resolved: await Complaint.countDocuments({ status: 'resolved' }),
  closed: await Complaint.countDocuments({ status: 'closed' }),
  
  // Complaints older than 3 days
  oldPending: await Complaint.countDocuments({
    status: 'pending',
    createdAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
  }),
  
  // Today's complaints
  today: await Complaint.countDocuments({
    createdAt: { 
      $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
    }
  }),
  
  // Average resolution time
  avgResolutionTime: await calculateAverageResolutionTime()
};
```

### Quick Filters:

- All Complaints
- Pending (needs attention)
- In Progress
- Resolved (awaiting closure)
- High Priority
- Urgent Priority
- Older than 3 days
- Today's Complaints
- My Assigned Complaints

### Sorting Options:

- Newest First (default)
- Oldest First
- High Priority First
- By Category
- By Department


---

## 11. STUDENT DASHBOARD FEATURES

### My Complaints Overview:

```javascript
// Fetch student's complaint summary
const summary = {
  total: await Complaint.countDocuments({ 
    studentId: userId,
    isDeleted: false 
  }),
  pending: await Complaint.countDocuments({ 
    studentId: userId,
    status: 'pending' 
  }),
  inProgress: await Complaint.countDocuments({ 
    studentId: userId,
    status: 'in-progress' 
  }),
  resolved: await Complaint.countDocuments({ 
    studentId: userId,
    status: 'resolved' 
  }),
  closed: await Complaint.countDocuments({ 
    studentId: userId,
    status: 'closed' 
  })
};
```

### Quick Actions:

- Raise New Complaint (prominent button)
- View All My Complaints
- View Pending Complaints
- View Resolved Complaints (need action)

### Recent Complaints Widget:

- Shows last 5 complaints
- Status indicator with color
- Quick "View Details" link


---

## 12. AUTO-CLOSE MECHANISM

### Implementation Using Node-Cron:

```javascript
const cron = require('node-cron');

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running auto-close job...');
  
  // Find complaints resolved more than 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const complaintsToClose = await Complaint.find({
    status: 'resolved',
    resolvedAt: { $lt: sevenDaysAgo }
  });
  
  for (const complaint of complaintsToClose) {
    // Update status to closed
    complaint.status = 'closed';
    
    // Add to history
    complaint.statusHistory.push({
      status: 'closed',
      changedBy: null,
      changedByName: 'System',
      changedByRole: 'system',
      timestamp: new Date(),
      note: 'Auto-closed after 7 days of resolution'
    });
    
    await complaint.save();
    
    // Send notification to student
    sendEmail(complaint.studentEmail, 'Complaint Closed', `
      Your complaint ${complaint.complaintId} has been automatically closed.
      
      If you still face issues, you can raise a new complaint.
      
      Thank you for using our helpdesk system.
    `);
  }
  
  console.log(`Auto-closed ${complaintsToClose.length} complaints`);
});
```


---

## 13. SEARCH FUNCTIONALITY

### Student Search:

**Search in own complaints:**
```javascript
GET /api/complaints/my-complaints?search=projector

// Backend implementation
const searchQuery = req.query.search;

const complaints = await Complaint.find({
  studentId: userId,
  $or: [
    { subject: { $regex: searchQuery, $options: 'i' } },
    { description: { $regex: searchQuery, $options: 'i' } },
    { complaintId: { $regex: searchQuery, $options: 'i' } }
  ]
});
```

### Admin Search:

**Search across all complaints:**
```javascript
GET /api/admin/complaints?search=projector

// Backend implementation
const searchQuery = req.query.search;

const complaints = await Complaint.find({
  $or: [
    { subject: { $regex: searchQuery, $options: 'i' } },
    { description: { $regex: searchQuery, $options: 'i' } },
    { complaintId: { $regex: searchQuery, $options: 'i' } },
    { studentName: { $regex: searchQuery, $options: 'i' } },
    { studentRollNumber: { $regex: searchQuery, $options: 'i' } }
  ]
});
```

### Advanced Search:

**Multiple filters combined:**
```javascript
GET /api/admin/complaints?category=Infrastructure&status=pending&priority=high&search=room

// Backend builds complex query
const query = { isDeleted: false };

if (req.query.category) query.category = req.query.category;
if (req.query.status) query.status = req.query.status;
if (req.query.priority) query.priority = req.query.priority;

if (req.query.search) {
  query.$or = [
    { subject: { $regex: req.query.search, $options: 'i' } },
    { description: { $regex: req.query.search, $options: 'i' } }
  ];
}

const complaints = await Complaint.find(query);
```


---

## 14. EXPORT FUNCTIONALITY

### Export to CSV:

```javascript
const { Parser } = require('json2csv');

async function exportComplaintsToCSV(filters) {
  // Fetch complaints based on filters
  const complaints = await Complaint.find(filters)
    .select('complaintId studentName studentRollNumber subject category status priority createdAt resolvedAt')
    .lean();
  
  // Define CSV fields
  const fields = [
    { label: 'Complaint ID', value: 'complaintId' },
    { label: 'Student Name', value: 'studentName' },
    { label: 'Roll Number', value: 'studentRollNumber' },
    { label: 'Subject', value: 'subject' },
    { label: 'Category', value: 'category' },
    { label: 'Status', value: 'status' },
    { label: 'Priority', value: 'priority' },
    { label: 'Created Date', value: 'createdAt' },
    { label: 'Resolved Date', value: 'resolvedAt' }
  ];
  
  // Convert to CSV
  const parser = new Parser({ fields });
  const csv = parser.parse(complaints);
  
  return csv;
}

// In route
app.get('/api/admin/complaints/export', async (req, res) => {
  const csv = await exportComplaintsToCSV(req.query);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=complaints.csv');
  res.send(csv);
});
```


---

## 15. SUMMARY

### What This Module Provides:

**For Students:**
✅ Easy complaint submission from anywhere
✅ Image upload for evidence
✅ Real-time status tracking
✅ Complete complaint history
✅ Ability to reopen if not satisfied
✅ Email and SMS notifications

**For Admins:**
✅ Centralized complaint dashboard
✅ Filter and search capabilities
✅ Assign complaints to staff
✅ Track resolution progress
✅ Statistics and analytics
✅ Export reports
✅ Automated reminders

**Technical Features:**
✅ Secure image storage on local server
✅ Complete status lifecycle management
✅ Authorization and ownership checks
✅ Rate limiting to prevent spam
✅ Auto-close mechanism
✅ Notification system
✅ Search and filter functionality
✅ Export to CSV

### Key Benefits:

1. **Transparency:** Students can track every step
2. **Accountability:** All actions are logged with timestamps
3. **Efficiency:** Admins can prioritize and assign quickly
4. **Evidence:** Images provide proof of issues
5. **Communication:** Automated notifications keep everyone informed
6. **Analytics:** Statistics help identify common problems
7. **Security:** Only authorized users can access complaints
8. **Scalability:** Can handle thousands of complaints

---

## NEXT STEPS

After Module 3 approval, we can proceed to:
- Module 4: AI Assistant Integration
- Module 5: Result Management System
- Module 6: Student Corner Features

Each module will integrate seamlessly with the authentication and complaint systems already designed.

---

**This complaint management system provides a complete helpdesk solution for the college, ensuring all student issues are tracked, managed, and resolved efficiently.**
