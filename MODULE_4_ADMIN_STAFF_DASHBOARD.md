# Module 4: Admin & Staff Dashboard
## Smart Campus Helpdesk & Student Ecosystem

---

## MODULE PURPOSE

This module provides college authorities with a comprehensive dashboard to:
- ✅ Monitor all student complaints in real-time
- ✅ Manage complaint lifecycle from submission to resolution
- ✅ Maintain discipline and accountability through audit logs
- ✅ View analytics for data-driven decision making
- ✅ Assign work to staff members efficiently
- ✅ Track performance metrics

---

## 1. ADMIN & STAFF ROLES EXPLANATION

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      SUPER ADMIN                             │
│  - Full system access                                        │
│  - Manage other admins and staff                            │
│  - View all analytics                                        │
│  - System configuration                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐       ┌───────▼────────┐
│     ADMIN      │       │     ADMIN      │
│  (Department)  │       │  (Department)  │
└───────┬────────┘       └───────┬────────┘
        │                         │
        │ Assigns work            │
        │                         │
┌───────▼────────┐       ┌───────▼────────┐
│     STAFF      │       │     STAFF      │
│  (Maintenance) │       │  (IT Support)  │
└────────────────┘       └────────────────┘
```


---

### Role 1: SUPER ADMIN

**Who:** Principal, Vice-Principal, System Administrator

**Permissions:**
- ✅ View ALL complaints across all departments
- ✅ Assign complaints to any admin or staff
- ✅ Create/Edit/Delete admin and staff accounts
- ✅ Change complaint status (any complaint)
- ✅ View complete analytics and reports
- ✅ Export data
- ✅ Configure system settings
- ✅ Access audit logs
- ✅ Delete/Archive old complaints
- ✅ Manage categories and priorities

**Cannot Do:**
- ❌ Delete student accounts (only deactivate)
- ❌ Modify student master data (separate permission needed)

**Dashboard Access:**
- All complaints dashboard
- Analytics dashboard
- User management panel
- System settings
- Audit logs viewer


---

### Role 2: ADMIN (Department Level)

**Who:** HOD, Department Coordinators, Senior Faculty

**Permissions:**
- ✅ View complaints from their department
- ✅ View complaints assigned to them
- ✅ Assign complaints to staff in their department
- ✅ Change status of assigned complaints
- ✅ Add remarks and resolution notes
- ✅ View department-level analytics
- ✅ Export department reports
- ✅ Escalate complaints to super admin

**Cannot Do:**
- ❌ View complaints from other departments (unless assigned)
- ❌ Create/Delete user accounts
- ❌ Access system settings
- ❌ Delete complaints
- ❌ Modify audit logs

**Dashboard Access:**
- Department complaints dashboard
- Assigned complaints view
- Department analytics
- Staff performance view

**Example:**
- Computer Science HOD can see all CS department complaints
- Can assign infrastructure complaints to maintenance staff
- Can assign IT complaints to IT support staff


---

### Role 3: STAFF (Execution Level)

**Who:** Maintenance Staff, IT Support, Lab Assistants, Security Personnel

**Permissions:**
- ✅ View ONLY complaints assigned to them
- ✅ Update status of assigned complaints (pending → in-progress → resolved)
- ✅ Add work notes and updates
- ✅ Upload resolution proof (images)
- ✅ Request reassignment if cannot resolve
- ✅ View their performance metrics

**Cannot Do:**
- ❌ View unassigned complaints
- ❌ View other staff's complaints
- ❌ Assign complaints to others
- ❌ Delete or reject complaints
- ❌ Access analytics dashboard
- ❌ Export reports
- ❌ Change complaint priority

**Dashboard Access:**
- My assigned complaints (only)
- My work history
- My performance stats

**Example:**
- Maintenance staff "Rajesh Kumar" sees only complaints assigned to him
- Can update: "Projector repaired, new bulb installed"
- Can mark as resolved with proof image


---

### Permission Comparison Table

| Feature | Super Admin | Admin | Staff |
|---------|-------------|-------|-------|
| View all complaints | ✅ | ❌ (dept only) | ❌ (assigned only) |
| View assigned complaints | ✅ | ✅ | ✅ |
| Assign complaints | ✅ | ✅ (to staff) | ❌ |
| Update status | ✅ | ✅ | ✅ (assigned only) |
| Add remarks | ✅ | ✅ | ✅ |
| Reject complaints | ✅ | ✅ | ❌ |
| Delete complaints | ✅ | ❌ | ❌ |
| View analytics | ✅ (all) | ✅ (dept) | ✅ (own) |
| Export reports | ✅ | ✅ (dept) | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ |
| Audit logs | ✅ | ❌ | ❌ |


---

## 2. DATABASE SCHEMA DESIGN

### Collection 1: `admin_users`

**Purpose:** Store admin and staff accounts with role-based permissions

**Complete Schema:**
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789abcdef0"),
  
  // Basic Information
  employeeId: "EMP2024001",              // Unique employee ID
  email: "admin@college.edu",
  password: "hashed_password_here",      // Bcrypt hashed
  fullName: "Dr. Rajesh Kumar",
  
  // Role & Department
  role: "admin",                         // super_admin | admin | staff
  department: "Computer Science",        // null for super_admin
  designation: "HOD",                    // Professor, Maintenance Head, etc.
  
  // Contact Information
  phoneNumber: "9876543210",
  officeLocation: "Main Block, Room 205",
  
  // Permissions (for fine-grained control)
  permissions: {
    canViewAllComplaints: false,         // true for super_admin
    canAssignComplaints: true,           // true for admin and super_admin
    canDeleteComplaints: false,          // true only for super_admin
    canManageUsers: false,               // true only for super_admin
    canViewAnalytics: true,              // true for admin and super_admin
    canExportReports: true,              // true for admin and super_admin
    canAccessAuditLogs: false,           // true only for super_admin
    canModifySettings: false             // true only for super_admin
  },
  
  // Specialization (for staff)
  specialization: [                      // What type of complaints they handle
    "Infrastructure",
    "Electrical",
    "Plumbing"
  ],
  
  // Work Statistics
  stats: {
    totalAssigned: 45,                   // Total complaints assigned
    totalResolved: 38,                   // Total resolved
    totalPending: 7,                     // Currently pending
    averageResolutionTime: 2.5,          // In days
    rating: 4.5                          // Student feedback rating (future)
  },
  
  // Account Status
  isActive: true,                        // Can login
  isVerified: true,                      // Email verified
  
  // Timestamps
  createdAt: ISODate("2024-01-10T09:00:00Z"),
  lastLogin: ISODate("2024-02-08T08:30:00Z"),
  updatedAt: ISODate("2024-02-08T08:30:00Z"),
  
  // Created By (for audit)
  createdBy: ObjectId("super_admin_id"),
  createdByName: "Principal"
}
```


---

### Collection 2: `complaint_actions`

**Purpose:** Log every action taken on complaints (audit trail)

**Complete Schema:**
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789abcdef0"),
  
  // Complaint Reference
  complaintId: "CMP2024001",
  complaintObjectId: ObjectId("complaint_id_here"),
  
  // Action Details
  action: "status_changed",              // See action types below
  
  // Previous and New Values
  previousValue: "pending",
  newValue: "in-progress",
  
  // Who Performed Action
  performedBy: ObjectId("admin_id_here"),
  performedByName: "Dr. Rajesh Kumar",
  performedByRole: "admin",              // super_admin | admin | staff
  performedByEmployeeId: "EMP2024001",
  
  // Action Details
  remarks: "Assigned to maintenance team. Will be fixed by tomorrow.",
  
  // Additional Data (flexible field)
  metadata: {
    assignedTo: ObjectId("staff_id_here"),
    assignedToName: "Mr. Suresh Sharma",
    priority: "high",
    estimatedTime: "1 day"
  },
  
  // IP Address (for security)
  ipAddress: "192.168.1.100",
  
  // Timestamp
  timestamp: ISODate("2024-01-15T11:00:00Z")
}
```

**Action Types:**
- `complaint_created` - Student submitted complaint
- `status_changed` - Status updated
- `priority_changed` - Priority modified
- `assigned` - Complaint assigned to staff
- `reassigned` - Complaint reassigned to different staff
- `remark_added` - Admin/Staff added note
- `resolution_added` - Resolution note added
- `rejected` - Complaint rejected with reason
- `reopened` - Student reopened complaint
- `closed` - Complaint closed
- `deleted` - Complaint deleted (soft delete)


---

### Collection 3: `dashboard_analytics`

**Purpose:** Pre-calculated analytics for fast dashboard loading

**Complete Schema:**
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789abcdef0"),
  
  // Analytics Type
  type: "daily",                         // daily | weekly | monthly | yearly
  
  // Date Range
  date: ISODate("2024-02-08"),
  startDate: ISODate("2024-02-08T00:00:00Z"),
  endDate: ISODate("2024-02-08T23:59:59Z"),
  
  // Department (null for overall)
  department: "Computer Science",        // null for college-wide stats
  
  // Complaint Statistics
  complaints: {
    total: 25,
    new: 8,                              // Submitted today
    pending: 5,
    inProgress: 12,
    resolved: 6,
    closed: 2,
    rejected: 0
  },
  
  // By Category
  byCategory: {
    "Infrastructure": 10,
    "Academic": 5,
    "Hostel": 4,
    "IT Services": 3,
    "Transport": 2,
    "Other": 1
  },
  
  // By Priority
  byPriority: {
    "low": 8,
    "medium": 10,
    "high": 5,
    "urgent": 2
  },
  
  // Resolution Metrics
  resolution: {
    averageTime: 2.5,                    // In days
    fastestResolution: 0.5,              // In days
    slowestResolution: 7,                // In days
    totalResolved: 6
  },
  
  // Staff Performance
  staffPerformance: [
    {
      staffId: ObjectId("staff_id_here"),
      staffName: "Mr. Suresh Sharma",
      assigned: 8,
      resolved: 6,
      pending: 2,
      averageTime: 2.0
    }
  ],
  
  // Top Issues
  topIssues: [
    {
      keyword: "projector",
      count: 5
    },
    {
      keyword: "wifi",
      count: 4
    }
  ],
  
  // Timestamps
  calculatedAt: ISODate("2024-02-08T23:59:00Z"),
  lastUpdated: ISODate("2024-02-08T23:59:00Z")
}
```

**Why Pre-calculate?**
- Dashboard loads instantly (no complex queries)
- Reduces database load
- Historical data preserved
- Easy to generate reports


---

### Collection 4: `notifications`

**Purpose:** Store notifications for admin and staff

**Complete Schema:**
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789abcdef0"),
  
  // Recipient
  recipientId: ObjectId("admin_id_here"),
  recipientRole: "admin",                // admin | staff | super_admin
  
  // Notification Details
  type: "new_complaint",                 // See types below
  title: "New Complaint Received",
  message: "New infrastructure complaint from CS department",
  
  // Related Data
  relatedComplaintId: "CMP2024001",
  relatedComplaintObjectId: ObjectId("complaint_id_here"),
  
  // Priority
  priority: "normal",                    // low | normal | high | urgent
  
  // Status
  isRead: false,
  readAt: null,
  
  // Action Link
  actionUrl: "/admin/complaints/CMP2024001",
  
  // Timestamps
  createdAt: ISODate("2024-02-08T10:30:00Z")
}
```

**Notification Types:**
- `new_complaint` - New complaint in department
- `complaint_assigned` - Complaint assigned to you
- `complaint_reopened` - Complaint reopened by student
- `complaint_overdue` - Complaint pending for >3 days
- `staff_completed` - Staff marked complaint as resolved
- `student_feedback` - Student provided feedback


---

## 3. DASHBOARD DATA FLOW

### Flow 1: Admin Login and Dashboard Load

**Step 1: Admin Opens Login Page**
- Admin visits: `https://college-server.edu/admin/login`
- Enters employee ID and password

**Step 2: Frontend Sends Login Request**
```javascript
POST /api/admin/auth/login
Body: {
  employeeId: "EMP2024001",
  password: "SecurePass@123"
}
```

**Step 3: Backend Validates Credentials**
```javascript
// Find admin user
const admin = await AdminUser.findOne({ 
  employeeId: "EMP2024001",
  isActive: true 
});

if (!admin) {
  return error("Invalid credentials");
}

// Verify password
const isPasswordValid = await bcrypt.compare(password, admin.password);

if (!isPasswordValid) {
  return error("Invalid credentials");
}

// Update last login
admin.lastLogin = new Date();
await admin.save();

// Generate JWT token with role
const token = jwt.sign(
  { 
    userId: admin._id,
    role: admin.role,
    department: admin.department,
    permissions: admin.permissions
  },
  SECRET_KEY,
  { expiresIn: "8h" }  // 8 hour session
);

return success({
  token: token,
  user: {
    name: admin.fullName,
    role: admin.role,
    department: admin.department,
    permissions: admin.permissions
  }
});
```

**Step 4: Frontend Stores Token and Redirects**
- Stores token in localStorage
- Stores user info in React Context
- Redirects to: `/admin/dashboard`


---

**Step 5: Dashboard Loads - Fetch Statistics**
```javascript
GET /api/admin/dashboard/stats
Authorization: Bearer <admin_token>
```

**Step 6: Backend Calculates Statistics Based on Role**

**For Super Admin:**
```javascript
// Extract role from JWT token
const { role, department } = req.user;

if (role === 'super_admin') {
  // Get college-wide statistics
  const stats = {
    complaints: {
      total: await Complaint.countDocuments({ isDeleted: false }),
      pending: await Complaint.countDocuments({ status: 'pending' }),
      inProgress: await Complaint.countDocuments({ status: 'in-progress' }),
      resolved: await Complaint.countDocuments({ status: 'resolved' }),
      closed: await Complaint.countDocuments({ status: 'closed' })
    },
    
    today: {
      new: await Complaint.countDocuments({
        createdAt: { $gte: startOfToday }
      }),
      resolved: await Complaint.countDocuments({
        status: 'resolved',
        resolvedAt: { $gte: startOfToday }
      })
    },
    
    overdue: await Complaint.countDocuments({
      status: { $in: ['pending', 'in-progress'] },
      createdAt: { $lt: threeDaysAgo }
    }),
    
    byDepartment: await Complaint.aggregate([
      { $match: { isDeleted: false } },
      { $group: { 
          _id: '$studentDepartment',
          count: { $sum: 1 }
      }}
    ]),
    
    byCategory: await Complaint.aggregate([
      { $match: { isDeleted: false } },
      { $group: { 
          _id: '$category',
          count: { $sum: 1 }
      }}
    ])
  };
  
  return res.json({ success: true, data: stats });
}
```

**For Department Admin:**
```javascript
if (role === 'admin') {
  // Get department-specific statistics
  const stats = {
    complaints: {
      total: await Complaint.countDocuments({ 
        studentDepartment: department,
        isDeleted: false 
      }),
      pending: await Complaint.countDocuments({ 
        studentDepartment: department,
        status: 'pending' 
      }),
      inProgress: await Complaint.countDocuments({ 
        studentDepartment: department,
        status: 'in-progress' 
      }),
      resolved: await Complaint.countDocuments({ 
        studentDepartment: department,
        status: 'resolved' 
      })
    },
    
    myAssigned: await Complaint.countDocuments({
      assignedTo: req.user.userId,
      status: { $in: ['pending', 'in-progress'] }
    }),
    
    today: {
      new: await Complaint.countDocuments({
        studentDepartment: department,
        createdAt: { $gte: startOfToday }
      })
    },
    
    byCategory: await Complaint.aggregate([
      { $match: { 
          studentDepartment: department,
          isDeleted: false 
      }},
      { $group: { 
          _id: '$category',
          count: { $sum: 1 }
      }}
    ])
  };
  
  return res.json({ success: true, data: stats });
}
```

**For Staff:**
```javascript
if (role === 'staff') {
  // Get only assigned complaints statistics
  const stats = {
    myComplaints: {
      total: await Complaint.countDocuments({ 
        assignedTo: req.user.userId,
        isDeleted: false 
      }),
      pending: await Complaint.countDocuments({ 
        assignedTo: req.user.userId,
        status: 'pending' 
      }),
      inProgress: await Complaint.countDocuments({ 
        assignedTo: req.user.userId,
        status: 'in-progress' 
      }),
      resolved: await Complaint.countDocuments({ 
        assignedTo: req.user.userId,
        status: 'resolved' 
      })
    },
    
    today: {
      new: await Complaint.countDocuments({
        assignedTo: req.user.userId,
        assignedAt: { $gte: startOfToday }
      })
    },
    
    performance: {
      averageResolutionTime: await calculateAvgResolutionTime(req.user.userId),
      totalResolved: await Complaint.countDocuments({
        resolvedBy: req.user.userId
      })
    }
  };
  
  return res.json({ success: true, data: stats });
}
```

**Step 7: Frontend Displays Dashboard**
- Shows statistics cards
- Shows recent complaints list
- Shows notifications badge
- Shows quick action buttons


---

### Flow 2: Admin Views Complaints with Filters

**Step 1: Admin Clicks "View All Complaints"**
- Frontend navigates to: `/admin/complaints`

**Step 2: Admin Applies Filters**
- Department: Computer Science
- Status: Pending
- Category: Infrastructure
- Date: Last 7 days

**Step 3: Frontend Sends Request**
```javascript
GET /api/admin/complaints?department=Computer%20Science&status=pending&category=Infrastructure&dateFrom=2024-02-01&dateTo=2024-02-08&page=1&limit=20
Authorization: Bearer <admin_token>
```

**Step 4: Backend Builds Query Based on Role**
```javascript
// Extract user info from JWT
const { role, department: userDepartment, userId } = req.user;

// Build base query
let query = { isDeleted: false };

// Role-based filtering
if (role === 'super_admin') {
  // Can see all complaints
  // No additional filter needed
  
} else if (role === 'admin') {
  // Can see only department complaints OR assigned complaints
  query.$or = [
    { studentDepartment: userDepartment },
    { assignedTo: userId }
  ];
  
} else if (role === 'staff') {
  // Can see ONLY assigned complaints
  query.assignedTo = userId;
}

// Apply user-provided filters
if (req.query.department) {
  query.studentDepartment = req.query.department;
}

if (req.query.status) {
  query.status = req.query.status;
}

if (req.query.category) {
  query.category = req.query.category;
}

if (req.query.priority) {
  query.priority = req.query.priority;
}

if (req.query.dateFrom && req.query.dateTo) {
  query.createdAt = {
    $gte: new Date(req.query.dateFrom),
    $lte: new Date(req.query.dateTo)
  };
}

// Search in subject/description
if (req.query.search) {
  query.$text = { $search: req.query.search };
}

// Pagination
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

// Fetch complaints
const complaints = await Complaint.find(query)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .select('complaintId studentName studentRollNumber studentDepartment subject category status priority createdAt assignedToName');

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

**Step 5: Frontend Displays Filtered Results**
- Shows table with complaints
- Each row shows: ID, Student, Department, Subject, Category, Status, Priority, Date
- Click on row to view details


---

### Flow 3: Admin Views Complaint Details

**Step 1: Admin Clicks on Complaint**
- Frontend calls: `GET /api/admin/complaints/CMP2024001`

**Step 2: Backend Checks Authorization**
```javascript
// Find complaint
const complaint = await Complaint.findOne({ 
  complaintId: 'CMP2024001',
  isDeleted: false 
});

if (!complaint) {
  return res.status(404).json({ error: 'Complaint not found' });
}

// Check if user has permission to view
const { role, department, userId } = req.user;

let canView = false;

if (role === 'super_admin') {
  canView = true;
  
} else if (role === 'admin') {
  // Can view if from their department OR assigned to them
  if (complaint.studentDepartment === department || 
      complaint.assignedTo?.toString() === userId) {
    canView = true;
  }
  
} else if (role === 'staff') {
  // Can view ONLY if assigned to them
  if (complaint.assignedTo?.toString() === userId) {
    canView = true;
  }
}

if (!canView) {
  return res.status(403).json({ error: 'Unauthorized access' });
}

// Fetch action history
const actions = await ComplaintAction.find({
  complaintObjectId: complaint._id
})
.sort({ timestamp: -1 })
.limit(50);

return res.json({
  success: true,
  data: {
    complaint: complaint,
    actions: actions
  }
});
```

**Step 3: Frontend Displays Complete Details**
- Complaint information
- Student details
- Images (clickable)
- Status timeline
- Action history
- Action buttons (based on role and status)


---

## 4. COMPLAINT ASSIGNMENT WORKFLOW

### Scenario: Admin Assigns Complaint to Staff

**Step 1: Admin Reviews Complaint**
- Admin opens complaint "CMP2024001"
- Reads: "Broken projector in Room 301"
- Category: Infrastructure
- Decides to assign to maintenance staff

**Step 2: Admin Clicks "Assign" Button**
- Modal opens showing list of available staff
- Filters staff by specialization: "Infrastructure"

**Step 3: Frontend Fetches Available Staff**
```javascript
GET /api/admin/staff/available?specialization=Infrastructure
Authorization: Bearer <admin_token>
```

**Step 4: Backend Returns Staff List**
```javascript
// Get staff with Infrastructure specialization
const staff = await AdminUser.find({
  role: 'staff',
  isActive: true,
  specialization: { $in: ['Infrastructure'] }
})
.select('employeeId fullName designation stats.totalPending stats.averageResolutionTime')
.sort({ 'stats.totalPending': 1 });  // Show least busy first

return res.json({
  success: true,
  data: {
    staff: staff
  }
});
```

**Step 5: Admin Selects Staff and Adds Note**
- Selects: "Mr. Suresh Sharma (Maintenance Head)"
- Current workload: 3 pending complaints
- Adds note: "Please check and repair the projector urgently"
- Sets estimated time: "1 day"
- Clicks "Assign"

**Step 6: Frontend Sends Assignment Request**
```javascript
POST /api/admin/complaints/CMP2024001/assign
Authorization: Bearer <admin_token>

Body: {
  assignedTo: "staff_user_id_here",
  remarks: "Please check and repair the projector urgently",
  estimatedTime: "1 day",
  priority: "high"
}
```


---

**Step 7: Backend Processes Assignment**
```javascript
// Find complaint
const complaint = await Complaint.findOne({ complaintId: 'CMP2024001' });

// Check authorization
if (req.user.role === 'staff') {
  return res.status(403).json({ error: 'Staff cannot assign complaints' });
}

if (req.user.role === 'admin' && 
    complaint.studentDepartment !== req.user.department) {
  return res.status(403).json({ error: 'Cannot assign complaints from other departments' });
}

// Find staff member
const staff = await AdminUser.findById(req.body.assignedTo);

if (!staff || staff.role !== 'staff') {
  return res.status(400).json({ error: 'Invalid staff member' });
}

// Update complaint
complaint.assignedTo = staff._id;
complaint.assignedToName = staff.fullName;
complaint.assignedAt = new Date();
complaint.status = 'in-progress';
complaint.priority = req.body.priority || complaint.priority;

// Add to status history
complaint.statusHistory.push({
  status: 'in-progress',
  changedBy: req.user.userId,
  changedByName: req.user.fullName,
  changedByRole: req.user.role,
  timestamp: new Date(),
  note: req.body.remarks
});

await complaint.save();

// Log action
await ComplaintAction.create({
  complaintId: complaint.complaintId,
  complaintObjectId: complaint._id,
  action: 'assigned',
  previousValue: null,
  newValue: staff.fullName,
  performedBy: req.user.userId,
  performedByName: req.user.fullName,
  performedByRole: req.user.role,
  performedByEmployeeId: req.user.employeeId,
  remarks: req.body.remarks,
  metadata: {
    assignedTo: staff._id,
    assignedToName: staff.fullName,
    estimatedTime: req.body.estimatedTime
  },
  timestamp: new Date()
});

// Update staff statistics
await AdminUser.findByIdAndUpdate(staff._id, {
  $inc: { 
    'stats.totalAssigned': 1,
    'stats.totalPending': 1
  }
});

// Create notification for staff
await Notification.create({
  recipientId: staff._id,
  recipientRole: 'staff',
  type: 'complaint_assigned',
  title: 'New Complaint Assigned',
  message: `You have been assigned complaint ${complaint.complaintId}: ${complaint.subject}`,
  relatedComplaintId: complaint.complaintId,
  relatedComplaintObjectId: complaint._id,
  priority: complaint.priority,
  actionUrl: `/staff/complaints/${complaint.complaintId}`,
  isRead: false,
  createdAt: new Date()
});

// Send email to staff
sendEmail(staff.email, 'New Complaint Assigned', `
  Dear ${staff.fullName},
  
  You have been assigned a new complaint:
  
  Complaint ID: ${complaint.complaintId}
  Subject: ${complaint.subject}
  Category: ${complaint.category}
  Priority: ${complaint.priority}
  Location: ${complaint.location.building}, ${complaint.location.roomNumber}
  
  Remarks from Admin: ${req.body.remarks}
  Estimated Time: ${req.body.estimatedTime}
  
  Please login to view details and update status.
  
  Thank you,
  ${COLLEGE_NAME} Helpdesk System
`);

// Send SMS to staff
sendSMS(staff.phoneNumber, `
  New complaint ${complaint.complaintId} assigned to you.
  Subject: ${complaint.subject}
  Priority: ${complaint.priority}
  Login to view details.
`);

// Send SMS to student
sendSMS(complaint.studentPhone, `
  Your complaint ${complaint.complaintId} has been assigned to ${staff.fullName}.
  You will be notified when resolved.
`);

return res.json({
  success: true,
  message: 'Complaint assigned successfully',
  data: {
    assignedTo: staff.fullName,
    status: 'in-progress'
  }
});
```

**Step 8: Frontend Shows Success**
- Shows success message
- Updates complaint status to "In-Progress"
- Shows assigned staff name
- Refreshes complaint list


---

### Scenario: Staff Updates Complaint Status

**Step 1: Staff Logs In**
- Staff member "Mr. Suresh Sharma" logs in
- Sees notification: "New complaint assigned"

**Step 2: Staff Opens Assigned Complaints**
- Navigates to: `/staff/my-complaints`
- Sees list of assigned complaints

**Step 3: Staff Opens Complaint Details**
- Clicks on "CMP2024001"
- Reads details and location
- Goes to Room 301 to fix projector

**Step 4: Staff Fixes the Issue**
- Repairs projector
- Installs new bulb
- Tests and confirms working

**Step 5: Staff Updates Status**
- Opens complaint in app
- Clicks "Mark as Resolved"
- Enters resolution note: "Projector repaired. New bulb installed. Tested and working fine."
- Uploads proof image (optional)
- Clicks "Submit"

**Step 6: Frontend Sends Update Request**
```javascript
PUT /api/staff/complaints/CMP2024001/resolve
Authorization: Bearer <staff_token>

Body: {
  resolutionNotes: "Projector repaired. New bulb installed. Tested and working fine.",
  proofImage: "image_file_or_url"
}
```

**Step 7: Backend Processes Resolution**
```javascript
// Find complaint
const complaint = await Complaint.findOne({ complaintId: 'CMP2024001' });

// Check if staff owns this complaint
if (complaint.assignedTo?.toString() !== req.user.userId) {
  return res.status(403).json({ 
    error: 'You can only update complaints assigned to you' 
  });
}

// Check if status can be changed
if (complaint.status === 'closed' || complaint.status === 'cancelled') {
  return res.status(400).json({ 
    error: 'Cannot update closed or cancelled complaints' 
  });
}

// Update complaint
complaint.status = 'resolved';
complaint.resolutionNotes = req.body.resolutionNotes;
complaint.resolvedBy = req.user.userId;
complaint.resolvedByName = req.user.fullName;
complaint.resolvedAt = new Date();

// Add proof image if provided
if (req.body.proofImage) {
  complaint.resolutionProof = req.body.proofImage;
}

// Add to status history
complaint.statusHistory.push({
  status: 'resolved',
  changedBy: req.user.userId,
  changedByName: req.user.fullName,
  changedByRole: 'staff',
  timestamp: new Date(),
  note: req.body.resolutionNotes
});

// Set auto-close date (7 days from now)
const autoCloseDate = new Date();
autoCloseDate.setDate(autoCloseDate.getDate() + 7);
complaint.autoCloseAt = autoCloseDate;

await complaint.save();

// Log action
await ComplaintAction.create({
  complaintId: complaint.complaintId,
  complaintObjectId: complaint._id,
  action: 'status_changed',
  previousValue: 'in-progress',
  newValue: 'resolved',
  performedBy: req.user.userId,
  performedByName: req.user.fullName,
  performedByRole: 'staff',
  performedByEmployeeId: req.user.employeeId,
  remarks: req.body.resolutionNotes,
  timestamp: new Date()
});

// Update staff statistics
const resolutionTime = (new Date() - complaint.assignedAt) / (1000 * 60 * 60 * 24); // in days

await AdminUser.findByIdAndUpdate(req.user.userId, {
  $inc: { 
    'stats.totalResolved': 1,
    'stats.totalPending': -1
  }
});

// Recalculate average resolution time
const staff = await AdminUser.findById(req.user.userId);
const totalResolved = staff.stats.totalResolved;
const currentAvg = staff.stats.averageResolutionTime || 0;
const newAvg = ((currentAvg * (totalResolved - 1)) + resolutionTime) / totalResolved;

staff.stats.averageResolutionTime = newAvg;
await staff.save();

// Send notification to student
sendEmail(complaint.studentEmail, 'Complaint Resolved', `
  Dear ${complaint.studentName},
  
  Your complaint has been resolved:
  
  Complaint ID: ${complaint.complaintId}
  Subject: ${complaint.subject}
  
  Resolution: ${complaint.resolutionNotes}
  Resolved By: ${req.user.fullName}
  Resolved On: ${new Date().toLocaleString()}
  
  If you are satisfied, the complaint will be automatically closed in 7 days.
  If the issue persists, you can reopen the complaint from your dashboard.
  
  Thank you for using our helpdesk system.
`);

// Send SMS to student
sendSMS(complaint.studentPhone, `
  Your complaint ${complaint.complaintId} has been resolved.
  Check your email for details.
`);

// Notify admin
const admin = await AdminUser.findOne({ 
  department: complaint.studentDepartment,
  role: 'admin'
});

if (admin) {
  await Notification.create({
    recipientId: admin._id,
    recipientRole: 'admin',
    type: 'staff_completed',
    title: 'Complaint Resolved',
    message: `${req.user.fullName} resolved complaint ${complaint.complaintId}`,
    relatedComplaintId: complaint.complaintId,
    relatedComplaintObjectId: complaint._id,
    priority: 'normal',
    actionUrl: `/admin/complaints/${complaint.complaintId}`,
    isRead: false,
    createdAt: new Date()
  });
}

return res.json({
  success: true,
  message: 'Complaint marked as resolved',
  data: {
    status: 'resolved',
    resolvedAt: complaint.resolvedAt
  }
});
```

**Step 8: Frontend Shows Success**
- Shows success message
- Updates status to "Resolved"
- Removes from pending list
- Updates staff statistics


---

### Scenario: Admin Rejects Complaint

**When to Reject:**
- Complaint is duplicate
- Complaint is invalid or spam
- Issue is not under college jurisdiction
- Student provided wrong information

**Step 1: Admin Reviews Complaint**
- Admin opens complaint
- Determines it should be rejected
- Clicks "Reject Complaint" button

**Step 2: Admin Enters Rejection Reason**
- Modal opens
- Admin selects reason: "Duplicate Complaint"
- Adds note: "This is a duplicate of CMP2024005. Please check that complaint for updates."
- Clicks "Confirm Rejection"

**Step 3: Frontend Sends Request**
```javascript
POST /api/admin/complaints/CMP2024001/reject
Authorization: Bearer <admin_token>

Body: {
  reason: "Duplicate Complaint",
  note: "This is a duplicate of CMP2024005. Please check that complaint for updates.",
  relatedComplaintId: "CMP2024005"
}
```

**Step 4: Backend Processes Rejection**
```javascript
// Find complaint
const complaint = await Complaint.findOne({ complaintId: 'CMP2024001' });

// Check authorization (only admin and super_admin can reject)
if (req.user.role === 'staff') {
  return res.status(403).json({ 
    error: 'Staff cannot reject complaints' 
  });
}

// Update complaint
complaint.status = 'rejected';
complaint.rejectionReason = req.body.reason;
complaint.rejectionNote = req.body.note;
complaint.rejectedBy = req.user.userId;
complaint.rejectedByName = req.user.fullName;
complaint.rejectedAt = new Date();

// Add to status history
complaint.statusHistory.push({
  status: 'rejected',
  changedBy: req.user.userId,
  changedByName: req.user.fullName,
  changedByRole: req.user.role,
  timestamp: new Date(),
  note: `${req.body.reason}: ${req.body.note}`
});

await complaint.save();

// Log action
await ComplaintAction.create({
  complaintId: complaint.complaintId,
  complaintObjectId: complaint._id,
  action: 'rejected',
  previousValue: complaint.status,
  newValue: 'rejected',
  performedBy: req.user.userId,
  performedByName: req.user.fullName,
  performedByRole: req.user.role,
  performedByEmployeeId: req.user.employeeId,
  remarks: `${req.body.reason}: ${req.body.note}`,
  metadata: {
    reason: req.body.reason,
    relatedComplaintId: req.body.relatedComplaintId
  },
  timestamp: new Date()
});

// Notify student
sendEmail(complaint.studentEmail, 'Complaint Rejected', `
  Dear ${complaint.studentName},
  
  Your complaint has been reviewed and rejected:
  
  Complaint ID: ${complaint.complaintId}
  Subject: ${complaint.subject}
  
  Reason: ${req.body.reason}
  Note: ${req.body.note}
  
  If you believe this is an error, please contact the administration office.
  
  Thank you.
`);

sendSMS(complaint.studentPhone, `
  Your complaint ${complaint.complaintId} has been rejected.
  Reason: ${req.body.reason}
  Check email for details.
`);

return res.json({
  success: true,
  message: 'Complaint rejected',
  data: {
    status: 'rejected'
  }
});
```


---

## 5. SECURITY IMPLEMENTATION

### Authorization Middleware

**Check User Role:**
```javascript
// middleware/roleCheck.js

function requireRole(allowedRoles) {
  return (req, res, next) => {
    // Extract role from JWT token
    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    }
    
    next();
  };
}

// Usage in routes
app.get('/api/admin/complaints', 
  authenticateToken,
  requireRole(['super_admin', 'admin', 'staff']),
  getComplaints
);

app.post('/api/admin/complaints/:id/assign',
  authenticateToken,
  requireRole(['super_admin', 'admin']),  // Staff cannot assign
  assignComplaint
);

app.delete('/api/admin/complaints/:id',
  authenticateToken,
  requireRole(['super_admin']),  // Only super admin can delete
  deleteComplaint
);
```


---

### Check Complaint Ownership

**For Department Admins:**
```javascript
// middleware/complaintAccess.js

async function checkComplaintAccess(req, res, next) {
  const complaintId = req.params.complaintId;
  const { role, department, userId } = req.user;
  
  // Find complaint
  const complaint = await Complaint.findOne({ 
    complaintId: complaintId,
    isDeleted: false 
  });
  
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }
  
  // Super admin can access all
  if (role === 'super_admin') {
    req.complaint = complaint;
    return next();
  }
  
  // Admin can access department complaints or assigned complaints
  if (role === 'admin') {
    if (complaint.studentDepartment === department || 
        complaint.assignedTo?.toString() === userId) {
      req.complaint = complaint;
      return next();
    }
  }
  
  // Staff can access only assigned complaints
  if (role === 'staff') {
    if (complaint.assignedTo?.toString() === userId) {
      req.complaint = complaint;
      return next();
    }
  }
  
  return res.status(403).json({ 
    error: 'You do not have permission to access this complaint' 
  });
}

// Usage
app.get('/api/admin/complaints/:complaintId',
  authenticateToken,
  checkComplaintAccess,
  getComplaintDetails
);
```


---

### Action Logging (Audit Trail)

**Log Every Action:**
```javascript
// utils/auditLogger.js

async function logAction(actionData) {
  try {
    await ComplaintAction.create({
      complaintId: actionData.complaintId,
      complaintObjectId: actionData.complaintObjectId,
      action: actionData.action,
      previousValue: actionData.previousValue,
      newValue: actionData.newValue,
      performedBy: actionData.userId,
      performedByName: actionData.userName,
      performedByRole: actionData.userRole,
      performedByEmployeeId: actionData.employeeId,
      remarks: actionData.remarks,
      metadata: actionData.metadata,
      ipAddress: actionData.ipAddress,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log action:', error);
    // Don't throw error - logging failure shouldn't break the operation
  }
}

// Usage in controller
async function updateComplaintStatus(req, res) {
  const complaint = req.complaint;
  const previousStatus = complaint.status;
  const newStatus = req.body.status;
  
  // Update complaint
  complaint.status = newStatus;
  await complaint.save();
  
  // Log action
  await logAction({
    complaintId: complaint.complaintId,
    complaintObjectId: complaint._id,
    action: 'status_changed',
    previousValue: previousStatus,
    newValue: newStatus,
    userId: req.user.userId,
    userName: req.user.fullName,
    userRole: req.user.role,
    employeeId: req.user.employeeId,
    remarks: req.body.remarks,
    ipAddress: req.ip
  });
  
  return res.json({ success: true });
}
```


---

### Prevent Unauthorized Modifications

**Staff Cannot Modify Other Staff's Complaints:**
```javascript
async function updateComplaint(req, res) {
  const complaint = req.complaint;
  const { role, userId } = req.user;
  
  // If staff, check if complaint is assigned to them
  if (role === 'staff') {
    if (complaint.assignedTo?.toString() !== userId) {
      return res.status(403).json({
        error: 'You can only update complaints assigned to you'
      });
    }
    
    // Staff can only change status to in-progress or resolved
    const allowedStatuses = ['in-progress', 'resolved'];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(403).json({
        error: 'Staff can only mark complaints as in-progress or resolved'
      });
    }
  }
  
  // Admin can modify department complaints
  if (role === 'admin') {
    if (complaint.studentDepartment !== req.user.department &&
        complaint.assignedTo?.toString() !== userId) {
      return res.status(403).json({
        error: 'You can only update complaints from your department'
      });
    }
  }
  
  // Proceed with update
  // ...
}
```


---

### Session Management

**Secure Admin Sessions:**
```javascript
// Shorter session timeout for admin (8 hours vs 7 days for students)
const token = jwt.sign(
  { 
    userId: admin._id,
    role: admin.role,
    department: admin.department,
    employeeId: admin.employeeId
  },
  SECRET_KEY,
  { expiresIn: '8h' }  // 8 hour session
);

// Auto-logout on inactivity (frontend)
let inactivityTimer;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  
  // Logout after 30 minutes of inactivity
  inactivityTimer = setTimeout(() => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  }, 30 * 60 * 1000);  // 30 minutes
}

// Reset timer on user activity
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
```


---

### IP Whitelisting (Optional)

**Restrict Admin Access to College Network:**
```javascript
// middleware/ipWhitelist.js

const ALLOWED_IP_RANGES = [
  '192.168.1.0/24',      // College LAN
  '10.0.0.0/8',          // College VPN
  '203.123.45.0/24'      // College public IP range
];

function checkIPWhitelist(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Check if IP is in allowed ranges
  const isAllowed = ALLOWED_IP_RANGES.some(range => {
    return isIPInRange(clientIP, range);
  });
  
  if (!isAllowed) {
    // Log unauthorized access attempt
    console.warn(`Unauthorized admin access attempt from IP: ${clientIP}`);
    
    return res.status(403).json({
      error: 'Admin access is only allowed from college network'
    });
  }
  
  next();
}

// Apply to admin routes
app.use('/api/admin', checkIPWhitelist);
```

**Note:** This is optional and should be configurable. Some admins may need remote access.


---

## 6. ANALYTICS & REPORTS

### Dashboard Analytics

**Super Admin Dashboard:**
```javascript
GET /api/admin/analytics/overview
Authorization: Bearer <super_admin_token>

Response:
{
  "success": true,
  "data": {
    "summary": {
      "totalComplaints": 1250,
      "pending": 85,
      "inProgress": 320,
      "resolved": 645,
      "closed": 180,
      "rejected": 20
    },
    
    "today": {
      "new": 15,
      "resolved": 22,
      "pending": 8
    },
    
    "thisWeek": {
      "new": 98,
      "resolved": 105,
      "averageResolutionTime": 2.3
    },
    
    "thisMonth": {
      "new": 420,
      "resolved": 398,
      "averageResolutionTime": 2.5
    },
    
    "byDepartment": [
      {
        "department": "Computer Science",
        "total": 285,
        "pending": 18,
        "resolved": 245
      },
      {
        "department": "Mechanical",
        "total": 198,
        "pending": 12,
        "resolved": 175
      }
    ],
    
    "byCategory": [
      {
        "category": "Infrastructure",
        "count": 450,
        "percentage": 36
      },
      {
        "category": "IT Services",
        "count": 320,
        "percentage": 25.6
      },
      {
        "category": "Academic",
        "count": 280,
        "percentage": 22.4
      }
    ],
    
    "byPriority": {
      "low": 425,
      "medium": 580,
      "high": 210,
      "urgent": 35
    },
    
    "resolutionMetrics": {
      "averageTime": 2.5,
      "fastestTime": 0.2,
      "slowestTime": 15,
      "within24Hours": 320,
      "within3Days": 580,
      "moreThan3Days": 65
    },
    
    "overdueComplaints": {
      "count": 45,
      "list": [
        {
          "complaintId": "CMP2024001",
          "subject": "Broken projector",
          "daysOld": 8,
          "department": "Computer Science"
        }
      ]
    },
    
    "staffPerformance": [
      {
        "staffName": "Mr. Suresh Sharma",
        "department": "Maintenance",
        "assigned": 45,
        "resolved": 38,
        "pending": 7,
        "averageTime": 2.1,
        "rating": 4.5
      }
    ],
    
    "topIssues": [
      {
        "keyword": "projector",
        "count": 35
      },
      {
        "keyword": "wifi",
        "count": 28
      },
      {
        "keyword": "washroom",
        "count": 22
      }
    ]
  }
}
```


---

### Department Admin Analytics

**Department-Specific Dashboard:**
```javascript
GET /api/admin/analytics/department
Authorization: Bearer <admin_token>

// Backend filters by department from JWT token
const { department } = req.user;

Response:
{
  "success": true,
  "data": {
    "department": "Computer Science",
    
    "summary": {
      "totalComplaints": 285,
      "pending": 18,
      "inProgress": 52,
      "resolved": 195,
      "closed": 20
    },
    
    "byCategory": [
      {
        "category": "Infrastructure",
        "count": 95
      },
      {
        "category": "IT Services",
        "count": 78
      },
      {
        "category": "Academic",
        "count": 65
      }
    ],
    
    "myAssignedComplaints": {
      "total": 12,
      "pending": 3,
      "inProgress": 7,
      "resolved": 2
    },
    
    "staffPerformance": [
      {
        "staffName": "Mr. Rajesh Kumar",
        "assigned": 15,
        "resolved": 12,
        "pending": 3,
        "averageTime": 2.5
      }
    ],
    
    "trends": {
      "lastWeek": 18,
      "thisWeek": 22,
      "change": "+22%"
    }
  }
}
```


---

### Staff Performance Analytics

**Individual Staff Dashboard:**
```javascript
GET /api/staff/analytics/my-performance
Authorization: Bearer <staff_token>

Response:
{
  "success": true,
  "data": {
    "staffName": "Mr. Suresh Sharma",
    "employeeId": "EMP2024001",
    
    "summary": {
      "totalAssigned": 45,
      "totalResolved": 38,
      "currentPending": 7,
      "averageResolutionTime": 2.1
    },
    
    "thisMonth": {
      "assigned": 12,
      "resolved": 10,
      "pending": 2
    },
    
    "byCategory": [
      {
        "category": "Infrastructure",
        "resolved": 25,
        "pending": 4
      },
      {
        "category": "Electrical",
        "resolved": 10,
        "pending": 2
      }
    ],
    
    "resolutionTrend": [
      {
        "week": "Week 1",
        "resolved": 8
      },
      {
        "week": "Week 2",
        "resolved": 10
      },
      {
        "week": "Week 3",
        "resolved": 12
      },
      {
        "week": "Week 4",
        "resolved": 8
      }
    ],
    
    "rating": {
      "average": 4.5,
      "totalRatings": 35
    },
    
    "badges": [
      {
        "name": "Fast Resolver",
        "description": "Resolved 10+ complaints in a week",
        "earnedOn": "2024-02-01"
      }
    ]
  }
}
```


---

### Report Generation

**Generate Custom Reports:**
```javascript
POST /api/admin/reports/generate
Authorization: Bearer <admin_token>

Request Body:
{
  "reportType": "complaint_summary",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-31",
  "department": "Computer Science",
  "category": "Infrastructure",
  "format": "pdf"
}

Response:
{
  "success": true,
  "data": {
    "reportId": "RPT2024001",
    "downloadUrl": "/api/admin/reports/download/RPT2024001",
    "generatedAt": "2024-02-08T10:30:00Z",
    "expiresAt": "2024-02-09T10:30:00Z"
  }
}
```

**Report Types:**
1. **Complaint Summary Report**
   - Total complaints by status
   - Category breakdown
   - Department breakdown
   - Resolution time analysis

2. **Staff Performance Report**
   - Individual staff statistics
   - Comparison across staff
   - Top performers
   - Areas needing improvement

3. **Department Report**
   - Department-wise complaint analysis
   - Most common issues
   - Resolution efficiency
   - Trends over time

4. **Detailed Complaint Report**
   - Complete list of complaints
   - All details and actions
   - Timeline for each complaint
   - Export to Excel/CSV


---

## 7. API ENDPOINTS SUMMARY

### Admin Authentication
```
POST   /api/admin/auth/login              # Admin/Staff login
POST   /api/admin/auth/logout             # Logout
POST   /api/admin/auth/forgot-password    # Password reset
GET    /api/admin/auth/profile            # Get profile
PUT    /api/admin/auth/profile            # Update profile
```

### Dashboard
```
GET    /api/admin/dashboard/stats         # Dashboard statistics
GET    /api/admin/dashboard/notifications # Get notifications
PUT    /api/admin/dashboard/notifications/:id/read  # Mark as read
```

### Complaint Management
```
GET    /api/admin/complaints              # Get all complaints (filtered)
GET    /api/admin/complaints/:id          # Get complaint details
POST   /api/admin/complaints/:id/assign   # Assign to staff
PUT    /api/admin/complaints/:id/status   # Update status
PUT    /api/admin/complaints/:id/priority # Update priority
POST   /api/admin/complaints/:id/reject   # Reject complaint
POST   /api/admin/complaints/:id/remark   # Add remark
DELETE /api/admin/complaints/:id          # Delete (super admin only)
```

### Staff Management (Super Admin Only)
```
GET    /api/admin/staff                   # Get all staff
GET    /api/admin/staff/:id               # Get staff details
POST   /api/admin/staff                   # Create staff account
PUT    /api/admin/staff/:id               # Update staff account
DELETE /api/admin/staff/:id               # Delete staff account
GET    /api/admin/staff/available         # Get available staff for assignment
```

### Analytics
```
GET    /api/admin/analytics/overview      # Overall analytics
GET    /api/admin/analytics/department    # Department analytics
GET    /api/admin/analytics/staff         # Staff performance
GET    /api/admin/analytics/trends        # Trend analysis
```

### Reports
```
POST   /api/admin/reports/generate        # Generate report
GET    /api/admin/reports/download/:id    # Download report
GET    /api/admin/reports/list            # List generated reports
```

### Audit Logs (Super Admin Only)
```
GET    /api/admin/audit-logs              # Get audit logs
GET    /api/admin/audit-logs/:complaintId # Get logs for complaint
```

### Staff Endpoints
```
GET    /api/staff/complaints              # Get assigned complaints
GET    /api/staff/complaints/:id          # Get complaint details
PUT    /api/staff/complaints/:id/resolve  # Mark as resolved
POST   /api/staff/complaints/:id/update   # Add update/note
GET    /api/staff/analytics/my-performance # My performance stats
```


---

## 8. IMPLEMENTATION FILES NEEDED

### Backend Files:

**Models:**
```
backend/models/
├── AdminUser.js              # Admin and staff schema
├── ComplaintAction.js        # Audit log schema
├── DashboardAnalytics.js     # Pre-calculated analytics
└── Notification.js           # Notification schema
```

**Controllers:**
```
backend/controllers/
├── adminAuthController.js    # Admin authentication
├── adminComplaintController.js  # Complaint management
├── staffController.js        # Staff operations
├── analyticsController.js    # Analytics and reports
└── auditLogController.js     # Audit log viewing
```

**Routes:**
```
backend/routes/
├── adminAuthRoutes.js        # Admin auth endpoints
├── adminComplaintRoutes.js   # Admin complaint endpoints
├── staffRoutes.js            # Staff endpoints
├── analyticsRoutes.js        # Analytics endpoints
└── auditLogRoutes.js         # Audit log endpoints
```

**Middleware:**
```
backend/middleware/
├── adminAuthMiddleware.js    # JWT verification for admin
├── roleCheckMiddleware.js    # Role-based access control
├── complaintAccessMiddleware.js  # Check complaint access
├── ipWhitelistMiddleware.js  # IP restriction (optional)
└── auditLoggerMiddleware.js  # Log all actions
```

**Utils:**
```
backend/utils/
├── analyticsCalculator.js    # Calculate analytics
├── reportGenerator.js        # Generate PDF/Excel reports
├── notificationSender.js     # Send notifications
└── performanceTracker.js     # Track staff performance
```


---

### Frontend Files:

**Admin Components:**
```
frontend/src/modules/admin/
├── components/
│   ├── Dashboard/
│   │   ├── StatisticsCards.js
│   │   ├── ComplaintChart.js
│   │   ├── RecentComplaints.js
│   │   └── QuickActions.js
│   │
│   ├── Complaints/
│   │   ├── ComplaintTable.js
│   │   ├── ComplaintFilters.js
│   │   ├── ComplaintDetails.js
│   │   ├── AssignModal.js
│   │   ├── RejectModal.js
│   │   └── StatusUpdateModal.js
│   │
│   ├── Analytics/
│   │   ├── OverviewCharts.js
│   │   ├── DepartmentAnalytics.js
│   │   ├── StaffPerformance.js
│   │   └── TrendAnalysis.js
│   │
│   ├── Staff/
│   │   ├── StaffList.js
│   │   ├── StaffDetails.js
│   │   ├── CreateStaffModal.js
│   │   └── StaffPerformanceCard.js
│   │
│   └── Reports/
│       ├── ReportGenerator.js
│       ├── ReportList.js
│       └── ReportViewer.js
│
├── pages/
│   ├── AdminLogin.js
│   ├── AdminDashboard.js
│   ├── ComplaintsPage.js
│   ├── AnalyticsPage.js
│   ├── StaffManagementPage.js
│   ├── ReportsPage.js
│   └── AuditLogsPage.js
│
└── services/
    ├── adminAuthService.js
    ├── adminComplaintService.js
    ├── analyticsService.js
    └── staffService.js
```

**Staff Components:**
```
frontend/src/modules/staff/
├── components/
│   ├── Dashboard/
│   │   ├── MyStats.js
│   │   ├── AssignedComplaints.js
│   │   └── PerformanceCard.js
│   │
│   ├── Complaints/
│   │   ├── ComplaintList.js
│   │   ├── ComplaintDetails.js
│   │   └── ResolveModal.js
│   │
│   └── Performance/
│       ├── MyPerformance.js
│       └── BadgesDisplay.js
│
├── pages/
│   ├── StaffLogin.js
│   ├── StaffDashboard.js
│   ├── MyComplaints.js
│   └── MyPerformance.js
│
└── services/
    └── staffService.js
```


---

## 9. NOTIFICATION SYSTEM

### Real-Time Notifications

**When to Notify:**

**Admin Notifications:**
- New complaint in department
- Complaint reopened by student
- Complaint pending for >3 days
- Staff marked complaint as resolved
- Student provided feedback

**Staff Notifications:**
- New complaint assigned
- Complaint priority changed
- Admin added remark
- Deadline approaching

**Implementation Using WebSocket:**
```javascript
// Backend - Socket.io
const io = require('socket.io')(server);

// Admin connects
io.on('connection', (socket) => {
  const { userId, role } = socket.handshake.auth;
  
  // Join room based on role
  if (role === 'super_admin') {
    socket.join('super_admin');
  } else if (role === 'admin') {
    socket.join(`admin_${userId}`);
  } else if (role === 'staff') {
    socket.join(`staff_${userId}`);
  }
});

// Send notification
function sendNotification(recipientId, recipientRole, notification) {
  // Save to database
  await Notification.create(notification);
  
  // Send real-time notification
  if (recipientRole === 'super_admin') {
    io.to('super_admin').emit('notification', notification);
  } else if (recipientRole === 'admin') {
    io.to(`admin_${recipientId}`).emit('notification', notification);
  } else if (recipientRole === 'staff') {
    io.to(`staff_${recipientId}`).emit('notification', notification);
  }
}
```

**Frontend - React:**
```javascript
import { io } from 'socket.io-client';

// Connect to socket
const socket = io('http://college-server.edu', {
  auth: {
    token: adminToken,
    userId: user.id,
    role: user.role
  }
});

// Listen for notifications
socket.on('notification', (notification) => {
  // Show toast notification
  toast.info(notification.message);
  
  // Update notification badge
  setNotificationCount(prev => prev + 1);
  
  // Add to notification list
  setNotifications(prev => [notification, ...prev]);
});
```


---

## 10. SUMMARY

### What This Module Provides:

**For Super Admin:**
✅ Complete system overview
✅ Manage all complaints across departments
✅ Create and manage admin/staff accounts
✅ View comprehensive analytics
✅ Generate reports
✅ Access audit logs
✅ System configuration

**For Department Admin:**
✅ Department-specific dashboard
✅ View and manage department complaints
✅ Assign complaints to staff
✅ Track staff performance
✅ Department analytics
✅ Export department reports

**For Staff:**
✅ View assigned complaints only
✅ Update complaint status
✅ Add work notes and updates
✅ Upload resolution proof
✅ Track personal performance
✅ Earn badges and recognition

**Security Features:**
✅ Role-based access control
✅ Department-level isolation
✅ Ownership verification
✅ Complete audit trail
✅ Action logging with IP address
✅ Session management
✅ IP whitelisting (optional)

**Analytics & Reporting:**
✅ Real-time statistics
✅ Trend analysis
✅ Staff performance metrics
✅ Department comparisons
✅ Custom report generation
✅ Export to PDF/Excel/CSV

**Accountability:**
✅ Every action logged
✅ Who did what and when
✅ Cannot modify past actions
✅ Transparent workflow
✅ Performance tracking

---

## KEY BENEFITS

1. **Transparency:** Complete visibility into complaint lifecycle
2. **Accountability:** All actions tracked and logged
3. **Efficiency:** Quick assignment and resolution
4. **Performance Tracking:** Measure staff effectiveness
5. **Data-Driven Decisions:** Analytics for improvement
6. **Security:** Role-based access prevents unauthorized actions
7. **Scalability:** Handles multiple departments and staff
8. **Audit Compliance:** Complete audit trail for compliance

---

## INTEGRATION WITH PREVIOUS MODULES

**Module 1 (Architecture):** Uses the defined folder structure and API patterns

**Module 2 (Authentication):** Extends authentication to include admin/staff roles

**Module 3 (Complaint System):** Provides management interface for complaints created by students

**This module completes the complaint management workflow by providing the administrative interface needed to process, track, and resolve student complaints efficiently.**

---

## NEXT STEPS

After Module 4 approval, the system will have:
- ✅ Student authentication and verification
- ✅ Student complaint submission
- ✅ Admin and staff management dashboard
- ✅ Complete complaint lifecycle management

Future modules can add:
- AI-powered complaint categorization
- Result management system
- Student corner features
- Mobile app for staff

**The core helpdesk system is now complete and functional!**
