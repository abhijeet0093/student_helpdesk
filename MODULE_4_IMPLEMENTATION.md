# Module 4: Admin & Staff Dashboard - Implementation Guide

## Overview

This module enables college authorities (Admin & Staff) to manage student complaints efficiently with role-based access control.

---

## 🎯 Implemented Features

### 1. **Staff Authentication**
- Staff login with email and password
- JWT token generation
- Account lockout after 5 failed attempts
- Password hashing with bcrypt

### 2. **Admin Complaint Management**
- View all complaints with filters
- Assign complaints to staff members
- View detailed complaint information
- Track complaint statistics

### 3. **Staff Complaint Management**
- View only assigned complaints
- Update status of assigned complaints
- Add remarks to complaints
- Cannot access unassigned complaints

### 4. **Access Control**
- Role-based authorization middleware
- Admin: Full access to all complaints
- Staff: Limited to assigned complaints only
- Unauthorized access blocked

### 5. **Activity Logging**
- Track who updated each complaint
- Store update timestamp
- Maintain status history
- Record admin/staff actions

---

## 📁 Files Created

### Models
- `backend/models/Staff.js` - Staff user schema

### Controllers
- `backend/controllers/adminController.js` - Admin operations
- `backend/controllers/staffController.js` - Staff operations

### Routes
- `backend/routes/adminRoutes.js` - Admin endpoints
- `backend/routes/staffRoutes.js` - Staff endpoints

### Scripts
- `backend/scripts/seedStaff.js` - Create sample staff accounts

### Updates
- `backend/models/Complaint.js` - Extended for staff assignment
- `backend/controllers/authController.js` - Added staff login
- `backend/middleware/authMiddleware.js` - Added staff authorization
- `backend/routes/authRoutes.js` - Added staff login route

---

## 🗄️ Database Schema

### Staff Model
```javascript
{
  name: String,              // Staff member name
  email: String,             // Unique email
  password: String,          // Hashed password
  department: String,        // Department (Infrastructure, IT, etc.)
  role: "staff",            // Fixed role
  isActive: Boolean,        // Account status
  loginAttempts: Number,    // Failed login tracking
  lockUntil: Date,          // Account lock timestamp
  createdAt: Date,
  lastLogin: Date
}
```

### Complaint Model Updates
```javascript
{
  // ... existing fields ...
  
  assignedTo: ObjectId,           // Staff/Admin ID
  assignedToModel: String,        // "Admin" or "Staff"
  assignedToName: String,         // Cached name
  
  lastUpdatedBy: {
    userId: ObjectId,
    userModel: String,            // "Admin" or "Staff"
    userName: String,
    timestamp: Date
  },
  
  statusHistory: [{
    status: String,
    changedBy: ObjectId,
    changedByModel: String,       // "Student", "Admin", or "Staff"
    changedByName: String,
    timestamp: Date,
    note: String
  }]
}
```

---

## 🔌 API Endpoints

### Staff Authentication

**Staff Login**
```
POST /api/auth/staff/login

Body:
{
  "email": "rajesh.staff@college.edu",
  "password": "staff123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Rajesh Kumar",
    "email": "rajesh.staff@college.edu",
    "department": "Infrastructure",
    "role": "staff"
  }
}
```

---

### Admin Routes

**Get All Complaints**
```
GET /api/admin/complaints
Headers: Authorization: Bearer <admin_token>

Query Parameters (optional):
- status: Pending | In Progress | Resolved | Rejected
- category: Infrastructure | Academic | Hostel | etc.
- department: Computer Science | Mechanical | etc.

Response:
{
  "success": true,
  "data": {
    "complaints": [...],
    "statistics": {
      "total": 150,
      "pending": 45,
      "inProgress": 60,
      "resolved": 30,
      "rejected": 15
    }
  }
}
```

**Get Complaint Details**
```
GET /api/admin/complaints/:id
Headers: Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": {
    "complaintId": "CMP2024001",
    "studentName": "Rahul Kumar",
    "category": "Infrastructure",
    "description": "...",
    "status": "Pending",
    "assignedToName": null,
    "statusHistory": [...]
  }
}
```

**Assign Complaint to Staff**
```
POST /api/admin/complaints/:id/assign
Headers: Authorization: Bearer <admin_token>

Body:
{
  "staffId": "65a1b2c3d4e5f6789abcdef0",
  "note": "Please check and resolve this issue"
}

Response:
{
  "success": true,
  "message": "Complaint assigned successfully",
  "data": {
    "complaintId": "CMP2024001",
    "assignedTo": "Rajesh Kumar",
    "status": "In Progress"
  }
}
```

---

### Staff Routes

**Get Assigned Complaints**
```
GET /api/staff/complaints
Headers: Authorization: Bearer <staff_token>

Query Parameters (optional):
- status: In Progress | Resolved | Rejected

Response:
{
  "success": true,
  "data": {
    "complaints": [...],
    "total": 5
  }
}
```

**Get Complaint Details (Only Assigned)**
```
GET /api/staff/complaints/:id
Headers: Authorization: Bearer <staff_token>

Response:
{
  "success": true,
  "data": {
    "complaintId": "CMP2024001",
    "studentName": "Rahul Kumar",
    "description": "...",
    "status": "In Progress",
    "assignedToName": "Rajesh Kumar"
  }
}
```

**Update Complaint Status (Only Assigned)**
```
PATCH /api/staff/complaints/:id/status
Headers: Authorization: Bearer <staff_token>

Body:
{
  "status": "Resolved",
  "remark": "Issue has been fixed. Projector is working now."
}

Response:
{
  "success": true,
  "message": "Complaint status updated successfully",
  "data": {
    "complaintId": "CMP2024001",
    "status": "Resolved",
    "updatedAt": "2024-02-08T12:00:00Z"
  }
}
```

---

## 🔐 Access Control

### Authorization Middleware

**authorizeAdmin**
- Allows only admin role
- Blocks student and staff

**authorizeStaff**
- Allows only staff role
- Blocks student and admin

**authorizeAdminOrStaff**
- Allows admin or staff roles
- Blocks students

### Route Protection

| Endpoint | Allowed Roles |
|----------|---------------|
| POST /api/auth/staff/login | Public |
| GET /api/admin/complaints | Admin only |
| POST /api/admin/complaints/:id/assign | Admin only |
| GET /api/staff/complaints | Staff only |
| PATCH /api/staff/complaints/:id/status | Staff only |

---

## 🔄 Workflow Examples

### Workflow 1: Admin Assigns Complaint to Staff

```
1. Student creates complaint
   → Status: "Pending"
   → assignedTo: null

2. Admin logs in
   → POST /api/auth/admin/login
   → Receives JWT token

3. Admin views all complaints
   → GET /api/admin/complaints
   → Sees complaint CMP2024001

4. Admin assigns to staff
   → POST /api/admin/complaints/CMP2024001/assign
   → Body: { staffId: "...", note: "Please fix" }
   → Status changes to "In Progress"
   → assignedTo: staff._id
   → assignedToName: "Rajesh Kumar"

5. Staff receives assignment
   → Can now see complaint in their list
```

### Workflow 2: Staff Updates Complaint Status

```
1. Staff logs in
   → POST /api/auth/staff/login
   → Receives JWT token

2. Staff views assigned complaints
   → GET /api/staff/complaints
   → Sees complaint CMP2024001

3. Staff views complaint details
   → GET /api/staff/complaints/CMP2024001
   → Reads full description and images

4. Staff resolves issue
   → PATCH /api/staff/complaints/CMP2024001/status
   → Body: { status: "Resolved", remark: "Fixed" }
   → Status changes to "Resolved"
   → lastUpdatedBy: staff info
   → statusHistory updated

5. Student sees updated status
   → GET /api/complaints/my
   → Sees status "Resolved" with remark
```

### Workflow 3: Staff Tries to Access Unassigned Complaint

```
1. Staff logs in
   → POST /api/auth/staff/login

2. Staff tries to view unassigned complaint
   → GET /api/staff/complaints/CMP2024002
   → Response: 404 "Complaint not found or not assigned to you"

3. Access denied
   → Staff can only see assigned complaints
```

---

## 🧪 Testing

### Setup Test Data

```bash
# Create staff accounts
npm run seed:staff

# Output:
# ✅ Staff accounts created successfully!
# - Rajesh Kumar | rajesh.staff@college.edu | Infrastructure
# - Priya Sharma | priya.staff@college.edu | IT Services
# - Amit Verma | amit.staff@college.edu | Academic
```

### Test Staff Login

```bash
POST http://localhost:3001/api/auth/staff/login
Body: {
  "email": "rajesh.staff@college.edu",
  "password": "staff123"
}

# Save the token for next requests
```

### Test Admin Assignment

```bash
# 1. Login as admin
POST http://localhost:3001/api/auth/admin/login
Body: { "username": "admin", "password": "admin123" }

# 2. Get staff ID
# Use MongoDB Compass or mongosh to get staff ObjectId

# 3. Assign complaint
POST http://localhost:3001/api/admin/complaints/CMP2024001/assign
Headers: Authorization: Bearer <admin_token>
Body: {
  "staffId": "65a1b2c3d4e5f6789abcdef0",
  "note": "Please resolve"
}
```

### Test Staff Access

```bash
# 1. Login as staff
POST http://localhost:3001/api/auth/staff/login

# 2. View assigned complaints
GET http://localhost:3001/api/staff/complaints
Headers: Authorization: Bearer <staff_token>

# 3. Update status
PATCH http://localhost:3001/api/staff/complaints/CMP2024001/status
Headers: Authorization: Bearer <staff_token>
Body: { "status": "Resolved", "remark": "Fixed" }
```

---

## 🔒 Security Features

1. **Password Hashing**
   - bcrypt with 10 rounds
   - Never store plain text passwords

2. **Account Lockout**
   - 5 failed login attempts
   - 30-minute lockout period

3. **JWT Authentication**
   - Token-based authentication
   - 7-day expiration
   - Role included in token

4. **Role-Based Access**
   - Middleware checks user role
   - Blocks unauthorized access
   - Returns 403 Forbidden

5. **Assignment Verification**
   - Staff can only access assigned complaints
   - Database-level filtering
   - No data leakage

---

## 📊 Database Queries

### Get Staff Assigned Complaints
```javascript
Complaint.find({
  assignedTo: staffId,
  assignedToModel: 'Staff'
})
```

### Get All Complaints (Admin)
```javascript
Complaint.find({})
  .sort({ createdAt: -1 })
```

### Assign Complaint
```javascript
complaint.assignedTo = staff._id;
complaint.assignedToModel = 'Staff';
complaint.assignedToName = staff.name;
complaint.status = 'In Progress';
```

---

## 🎯 Key Features

✅ Staff authentication with JWT
✅ Admin can assign complaints to staff
✅ Staff can view only assigned complaints
✅ Staff can update complaint status
✅ Activity logging (who updated what)
✅ Status history tracking
✅ Role-based access control
✅ Account lockout protection
✅ Unauthorized access blocked

---

## 📝 Sample Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

**Staff:**
- Email: `rajesh.staff@college.edu`, Password: `staff123`
- Email: `priya.staff@college.edu`, Password: `staff123`
- Email: `amit.staff@college.edu`, Password: `staff123`

---

## 🚀 Next Steps

1. Test all endpoints with Postman/Thunder Client
2. Verify role-based access control
3. Test assignment workflow
4. Develop frontend admin dashboard
5. Develop frontend staff dashboard

---

## ✨ Summary

Module 4 is complete with:
- ✅ Staff model and authentication
- ✅ Admin complaint management
- ✅ Staff complaint management
- ✅ Role-based access control
- ✅ Activity logging
- ✅ Seed scripts for testing

**Status:** Fully functional and ready for frontend integration! 🎉
