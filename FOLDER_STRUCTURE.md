# 📁 Complete Folder Structure

## Overview

This document explains the complete folder structure of the Smart Campus Helpdesk project.

## Root Directory

```
smart-campus/
├── 📂 backend/                      # Backend API (Node.js + Express)
├── 📂 frontend/                     # Frontend UI (React - to be developed)
├── 📄 MODULE_1_ARCHITECTURE.md      # System architecture documentation
├── 📄 MODULE_2_AUTHENTICATION.md    # Authentication module specs
├── 📄 MODULE_3_COMPLAINT_SYSTEM.md  # Complaint system specs
├── 📄 MODULE_4_ADMIN_STAFF_DASHBOARD.md
├── 📄 MODULE_5_STUDENT_DASHBOARD_CORNER.md
├── 📄 MODULE_6_AI_STUDENT_ASSISTANT.md
├── 📄 MODULE_7_UT_RESULT_ANALYSIS.md
├── 📄 README.md                     # Main project documentation
├── 📄 SETUP_GUIDE.md               # Step-by-step setup instructions
├── 📄 FOLDER_STRUCTURE.md          # This file
└── 📄 start-backend.bat            # Quick start script (Windows)
```

## Backend Directory Structure

```
backend/
├── 📂 config/                       # Configuration files
│   ├── 📄 db.js                    # MongoDB connection setup
│   └── 📄 multerConfig.js          # File upload configuration
│
├── 📂 controllers/                  # Business logic handlers
│   ├── 📄 authController.js        # Authentication logic
│   │   ├── registerStudent()       # Student registration
│   │   ├── loginStudent()          # Student login
│   │   └── loginAdmin()            # Admin login
│   │
│   └── 📄 complaintController.js   # Complaint management logic
│       ├── createComplaint()       # Create new complaint
│       ├── getMyComplaints()       # Get student's complaints
│       ├── getComplaintById()      # Get single complaint
│       ├── getAllComplaints()      # Get all complaints (admin)
│       └── updateComplaintStatus() # Update status (admin)
│
├── 📂 middleware/                   # Express middleware
│   └── 📄 authMiddleware.js        # JWT authentication & authorization
│       ├── authenticate()          # Verify JWT token
│       ├── authorizeStudent()      # Student-only access
│       └── authorizeAdmin()        # Admin-only access
│
├── 📂 models/                       # MongoDB schemas (Mongoose)
│   ├── 📄 Admin.js                 # Admin user schema
│   ├── 📄 Student.js               # Student user schema
│   ├── 📄 StudentMaster.js         # Official student records
│   └── 📄 Complaint.js             # Complaint schema
│
├── 📂 routes/                       # API route definitions
│   ├── 📄 authRoutes.js            # Authentication endpoints
│   │   ├── POST /api/auth/student/register
│   │   ├── POST /api/auth/student/login
│   │   └── POST /api/auth/admin/login
│   │
│   └── 📄 complaintRoutes.js       # Complaint endpoints
│       ├── POST /api/complaints           (Student)
│       ├── GET  /api/complaints/my        (Student)
│       ├── GET  /api/complaints/:id       (Student)
│       ├── GET  /api/complaints           (Admin)
│       └── PATCH /api/complaints/:id      (Admin)
│
├── 📂 scripts/                      # Utility scripts
│   ├── 📄 seedAdmin.js             # Create default admin account
│   └── 📄 seedStudentMaster.js     # Create sample student records
│
├── 📂 utils/                        # Helper functions
│   ├── 📄 tokenGenerator.js        # JWT token generation & verification
│   │   ├── generateToken()
│   │   └── verifyToken()
│   │
│   └── 📄 nameNormalizer.js        # Name & roll number normalization
│       ├── normalizeName()
│       └── normalizeRollNumber()
│
├── 📂 uploads/                      # File storage (created at runtime)
│   └── 📂 complaints/              # Complaint images
│       └── (uploaded files stored here)
│
├── 📂 node_modules/                 # NPM dependencies (auto-generated)
│
├── 📄 .env                          # Environment variables (DO NOT COMMIT)
├── 📄 .gitignore                   # Git ignore rules
├── 📄 package.json                 # NPM dependencies & scripts
├── 📄 package-lock.json            # Locked dependency versions
├── 📄 README.md                    # Backend documentation
├── 📄 server.js                    # Main entry point
└── 📄 test-api.http                # API testing file (REST Client)
```

## File Purposes Explained

### Configuration Files

**config/db.js**
- Establishes MongoDB connection
- Handles connection errors
- Exports `connectDB()` function

**config/multerConfig.js**
- Configures file upload handling
- Sets storage location and filename format
- Validates file types (images only)
- Sets file size limit (5MB)

### Controllers (Business Logic)

**controllers/authController.js**
- Handles all authentication operations
- Validates user credentials
- Generates JWT tokens
- Implements account lockout after failed attempts

**controllers/complaintController.js**
- Manages complaint CRUD operations
- Enforces access control (students see only their complaints)
- Handles file uploads
- Tracks status history

### Middleware

**middleware/authMiddleware.js**
- Verifies JWT tokens from request headers
- Loads user data and attaches to request
- Implements role-based access control
- Protects routes from unauthorized access

### Models (Database Schemas)

**models/Admin.js**
- Admin user account structure
- Password hashing on save
- Login attempt tracking

**models/Student.js**
- Student user account structure
- Links to StudentMaster via reference
- Password hashing and comparison methods

**models/StudentMaster.js**
- Official college student records
- Source of truth for verification
- Uploaded by admin only

**models/Complaint.js**
- Complaint data structure
- Status tracking with history
- File attachment support
- Admin assignment tracking

### Routes (API Endpoints)

**routes/authRoutes.js**
- Defines authentication endpoints
- Maps URLs to controller functions
- No authentication required (public routes)

**routes/complaintRoutes.js**
- Defines complaint endpoints
- Applies authentication middleware
- Applies role-based authorization
- Handles file upload middleware

### Scripts (Utilities)

**scripts/seedAdmin.js**
- Creates default admin account
- Username: admin, Password: admin123
- Run once during setup

**scripts/seedStudentMaster.js**
- Creates sample student records
- Allows testing student registration
- Can be customized with real data

### Utils (Helper Functions)

**utils/tokenGenerator.js**
- JWT token creation with 7-day expiry
- Token verification and decoding
- Centralized token logic

**utils/nameNormalizer.js**
- Normalizes names for comparison
- Handles case-insensitive matching
- Removes extra spaces

### Main Files

**server.js**
- Application entry point
- Initializes Express app
- Connects to MongoDB
- Registers middleware
- Registers routes
- Starts HTTP server

**.env**
- Environment-specific configuration
- Database connection string
- JWT secret key
- Port number
- CORS settings

**package.json**
- Project metadata
- NPM dependencies list
- NPM scripts (start, dev, seed)
- Project version

## Data Flow

### Student Registration Flow
```
1. Student fills form → Frontend
2. POST /api/auth/student/register → authRoutes.js
3. registerStudent() → authController.js
4. Verify against StudentMaster → models/StudentMaster.js
5. Create Student account → models/Student.js
6. Generate JWT token → utils/tokenGenerator.js
7. Return token → Frontend
```

### Complaint Creation Flow
```
1. Student creates complaint → Frontend
2. POST /api/complaints → complaintRoutes.js
3. authenticate() → authMiddleware.js (verify token)
4. authorizeStudent() → authMiddleware.js (check role)
5. upload.single('image') → multerConfig.js (save file)
6. createComplaint() → complaintController.js
7. Save to database → models/Complaint.js
8. Return complaint ID → Frontend
```

### Admin Status Update Flow
```
1. Admin updates status → Frontend
2. PATCH /api/complaints/:id → complaintRoutes.js
3. authenticate() → authMiddleware.js (verify token)
4. authorizeAdmin() → authMiddleware.js (check role)
5. updateComplaintStatus() → complaintController.js
6. Update complaint & add history → models/Complaint.js
7. Return updated complaint → Frontend
```

## Database Collections

### MongoDB Collections Created

**admins**
- Stores admin user accounts
- Fields: username, email, password (hashed), role, isActive

**students**
- Stores student user accounts (after registration)
- Fields: rollNumber, enrollmentNumber, fullName, password (hashed), department

**studentmasters**
- Stores official student records (uploaded by admin)
- Fields: rollNumber, enrollmentNumber, fullName, dateOfBirth, department

**complaints**
- Stores all complaints
- Fields: complaintId, studentId, category, description, status, imagePath

## Environment Variables

**.env file structure:**
```env
PORT=5001                          # Server port
NODE_ENV=development               # Environment mode
MONGODB_URI=mongodb://localhost:27017/smart_campus_db  # Database URL
JWT_SECRET=your_secret_key         # JWT signing key
FRONTEND_URL=http://localhost:3000 # CORS allowed origin
```

## NPM Scripts

```json
{
  "start": "node server.js",              // Production mode
  "dev": "nodemon server.js",             // Development mode (auto-reload)
  "seed:admin": "node scripts/seedAdmin.js",        // Create admin
  "seed:students": "node scripts/seedStudentMaster.js",  // Create students
  "seed:all": "npm run seed:admin && npm run seed:students"  // Both
}
```

## File Naming Conventions

- **Controllers:** `[feature]Controller.js` (e.g., authController.js)
- **Models:** `[Entity].js` (e.g., Student.js)
- **Routes:** `[feature]Routes.js` (e.g., authRoutes.js)
- **Middleware:** `[purpose]Middleware.js` (e.g., authMiddleware.js)
- **Utils:** `[purpose].js` (e.g., tokenGenerator.js)

## Security Files

**.gitignore**
- Prevents committing sensitive files
- Excludes: node_modules/, .env, uploads/

## Testing Files

**test-api.http**
- REST Client format
- Contains sample API requests
- Easy testing in VS Code

## Future Additions

Folders to be added for remaining modules:

```
backend/
├── controllers/
│   ├── dashboardController.js      # Module 4 & 5
│   ├── aiAssistantController.js    # Module 6
│   └── resultController.js         # Module 7
│
├── models/
│   ├── Post.js                     # Module 5
│   ├── ChatSession.js              # Module 6
│   └── UTResult.js                 # Module 7
│
└── routes/
    ├── dashboardRoutes.js
    ├── aiRoutes.js
    └── resultRoutes.js
```

## Summary

This folder structure follows:
- ✅ **MVC Pattern** (Models, Controllers, Routes)
- ✅ **Separation of Concerns** (each file has one purpose)
- ✅ **Scalability** (easy to add new modules)
- ✅ **Maintainability** (clear organization)
- ✅ **Security** (middleware protection, environment variables)

Each folder and file has a specific purpose, making the codebase easy to understand and extend.
