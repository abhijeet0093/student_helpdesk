# Complaint System Routing Architecture

## Before Fix (BROKEN) ❌

```
┌─────────────────────────────────────────────────────────────┐
│                    STUDENT FRONTEND                         │
│                                                             │
│  MyComplaints.jsx                                          │
│  └─ api.get('/complaints')  ← WRONG ENDPOINT!             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER                           │
│                                                             │
│  server.js                                                  │
│  └─ app.use('/api/complaints', complaintRoutes)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              complaintRoutes.js                             │
│                                                             │
│  router.get('/', verifyStudent, getMyComplaints)          │
│                                                             │
│  BUT WAIT! There's also:                                   │
│  router.get('/all', verifyAdmin, getAllComplaints)        │
│                                                             │
│  Student hits '/' which requires student role ✓            │
│  But the route was calling wrong controller!               │
└─────────────────────────────────────────────────────────────┘

RESULT: 403 Forbidden - "Access denied. Admin role required"
```

## After Fix (WORKING) ✅

```
┌─────────────────────────────────────────────────────────────┐
│                    STUDENT FRONTEND                         │
│                                                             │
│  MyComplaints.jsx                                          │
│  └─ api.get('/complaints/my')  ← CORRECT ENDPOINT!        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER                           │
│                                                             │
│  server.js                                                  │
│  └─ app.use('/api/complaints', complaintRoutes)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              complaintRoutes.js                             │
│                                                             │
│  router.get('/my', verifyStudent, getMyComplaints)        │
│                    ↓                                        │
│                verifyStudent checks JWT role                │
│                    ↓                                        │
│                role === 'student' ✓                         │
│                    ↓                                        │
│            getMyComplaints controller                       │
│                    ↓                                        │
│        Complaint.find({ student: userId })                 │
│                    ↓                                        │
│            Returns student's complaints                     │
└─────────────────────────────────────────────────────────────┘

RESULT: 200 OK - Student sees their complaints ✅
```

## Complete Routing Map

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND APPS                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  STUDENT APP                    ADMIN APP                   │
│  ├─ Login                       ├─ Login                    │
│  ├─ Dashboard                   ├─ Dashboard                │
│  ├─ My Complaints ──────┐       ├─ All Complaints ─────┐   │
│  ├─ Create Complaint     │       ├─ Manage Complaints   │   │
│  └─ Student Corner       │       └─ Staff Management    │   │
│                          │                               │   │
└──────────────────────────┼───────────────────────────────┼───┘
                           │                               │
                           ↓                               ↓
┌──────────────────────────────────────────────────────────────┐
│                      BACKEND API                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  /api/complaints (Student Routes)                           │
│  ├─ POST   /              → Create complaint               │
│  ├─ GET    /my            → Get my complaints ✅           │
│  ├─ GET    /:id           → Get single complaint           │
│  └─ Middleware: verifyStudent                              │
│                                                              │
│  /api/admin (Admin Routes)                                  │
│  ├─ GET    /complaints    → Get all complaints             │
│  ├─ GET    /complaints/:id → Get complaint details         │
│  ├─ PATCH  /complaints/:id → Update status                 │
│  ├─ POST   /complaints/:id/assign → Assign to staff        │
│  └─ Middleware: authorizeAdmin                             │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                    CONTROLLERS                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  complaintController.js                                     │
│  ├─ createComplaint()                                       │
│  ├─ getMyComplaints()     ← Returns student's complaints   │
│  ├─ getComplaintById()                                      │
│  └─ updateComplaintStatus()                                 │
│                                                              │
│  adminController.js                                         │
│  ├─ getAllComplaints()    ← Returns all complaints         │
│  ├─ assignComplaint()                                       │
│  └─ updateComplaintStatus()                                 │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                      DATABASE                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Complaint Collection                                       │
│  {                                                           │
│    _id: ObjectId,                                           │
│    student: ObjectId,        ← References Student          │
│    studentName: String,                                     │
│    studentRollNumber: String,                               │
│    title: String,                                           │
│    description: String,                                     │
│    category: String,                                        │
│    status: String,                                          │
│    priority: String,                                        │
│    assignedTo: ObjectId,                                    │
│    adminRemarks: String,                                    │
│    createdAt: Date,                                         │
│    updatedAt: Date                                          │
│  }                                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER LOGIN                               │
│                                                             │
│  Student enters credentials                                │
│  └─ POST /api/auth/login                                   │
│      {                                                      │
│        email: "student@test.com",                          │
│        password: "student123"                              │
│      }                                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND AUTHENTICATION                         │
│                                                             │
│  authController.login()                                    │
│  ├─ Verify credentials                                     │
│  ├─ Generate JWT token                                     │
│  │   {                                                      │
│  │     userId: "507f1f77bcf86cd799439011",                │
│  │     role: "student",                                    │
│  │     iat: 1234567890,                                    │
│  │     exp: 1234654290                                     │
│  │   }                                                      │
│  └─ Return token to frontend                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND STORES TOKEN                          │
│                                                             │
│  localStorage.setItem('token', token)                      │
│  AuthContext updates user state                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│          SUBSEQUENT API REQUESTS                            │
│                                                             │
│  api.get('/complaints/my', {                               │
│    headers: {                                              │
│      Authorization: 'Bearer eyJhbGc...'                    │
│    }                                                        │
│  })                                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              MIDDLEWARE VERIFICATION                        │
│                                                             │
│  verifyStudent middleware                                  │
│  ├─ Extract token from Authorization header               │
│  ├─ Verify JWT signature                                   │
│  ├─ Decode payload                                         │
│  ├─ Check role === 'student'                              │
│  ├─ Set req.userId = decoded.userId                       │
│  ├─ Set req.role = decoded.role                           │
│  └─ Call next() ✓                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              CONTROLLER EXECUTION                           │
│                                                             │
│  getMyComplaints(req, res)                                 │
│  ├─ Extract studentId from req.userId                     │
│  ├─ Query: Complaint.find({ student: studentId })         │
│  ├─ Populate student and assignedTo fields                │
│  ├─ Sort by createdAt descending                          │
│  └─ Return complaints array                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND DISPLAYS DATA                         │
│                                                             │
│  MyComplaints.jsx                                          │
│  ├─ Receives complaints array                             │
│  ├─ Updates state: setComplaints(data)                    │
│  ├─ Renders complaint cards                               │
│  └─ Shows filters, status badges, etc.                    │
└─────────────────────────────────────────────────────────────┘
```

## Security Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: JWT Token Verification                           │
│  ├─ Valid signature?                                       │
│  ├─ Not expired?                                           │
│  └─ Contains userId and role?                             │
│                                                             │
│  Layer 2: Role Authorization                               │
│  ├─ Student routes: role === 'student'                    │
│  ├─ Admin routes: role === 'admin'                        │
│  └─ Staff routes: role === 'staff'                        │
│                                                             │
│  Layer 3: Data Filtering                                   │
│  ├─ Students: Only their own data                         │
│  ├─ Staff: Only assigned data                             │
│  └─ Admin: All data                                        │
│                                                             │
│  Layer 4: Database Queries                                 │
│  ├─ Student: { student: userId }                          │
│  ├─ Staff: { assignedTo: userId }                         │
│  └─ Admin: {} (no filter)                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## The Fix in Context

```
BEFORE:
Student → /complaints → Admin route → 403 Forbidden ❌

AFTER:
Student → /complaints/my → Student route → Own complaints ✅
Admin → /admin/complaints → Admin route → All complaints ✅
```

**Key Insight:** The backend was already correctly structured with separate routes for students and admins. The bug was simply that the frontend was calling the wrong endpoint. One line change fixed it!

