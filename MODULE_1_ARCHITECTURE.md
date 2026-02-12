# Module 1: Core Foundation Architecture
## Smart Campus Helpdesk & Student Ecosystem

---

## 1. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    STUDENT'S BROWSER                         │
│              (Access from anywhere via web)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP Requests (REST API)
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  FRONTEND (React.js)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  - Login/Registration Pages                          │   │
│  │  - Dashboard (Student/Admin)                         │   │
│  │  - Shared Components (Navbar, Footer, etc.)          │   │
│  │  - Module Containers (Complaint, AI, Results, etc.)  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ API Calls (fetch/axios)
                     │
┌────────────────────▼────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Routes Layer                                        │   │
│  │  - /api/auth (login, register, logout)              │   │
│  │  - /api/users (profile, update)                     │   │
│  │  - /api/complaints (future)                         │   │
│  │  - /api/results (future)                            │   │
│  └────────────┬─────────────────────────────────────────┘   │
│               │                                              │
│  ┌────────────▼─────────────────────────────────────────┐   │
│  │  Controllers Layer                                   │   │
│  │  - Business logic for each route                    │   │
│  │  - Data validation                                  │   │
│  │  - Error handling                                   │   │
│  └────────────┬─────────────────────────────────────────┘   │
│               │                                              │
│  ┌────────────▼─────────────────────────────────────────┐   │
│  │  Models Layer                                        │   │
│  │  - MongoDB schemas (User, Complaint, etc.)          │   │
│  │  - Database operations                              │   │
│  └────────────┬─────────────────────────────────────────┘   │
└───────────────┼──────────────────────────────────────────────┘
                │
                │ Mongoose ODM
                │
┌───────────────▼──────────────────────────────────────────────┐
│              DATABASE (MongoDB)                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Collections:                                        │    │
│  │  - users                                             │    │
│  │  - complaints (future)                               │    │
│  │  - results (future)                                  │    │
│  │  - notifications (future)                            │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  Location: College Server (Production)                       │
│            localhost:27017 (Development)                     │
└───────────────────────────────────────────────────────────────┘
```

---

## 2. FOLDER STRUCTURE

```
smart-campus-helpdesk/
│
├── frontend/                          # React application
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── assets/                    # Images, logos
│   │
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── common/                # Shared across all modules
│   │   │   │   ├── Navbar.js
│   │   │   │   ├── Footer.js
│   │   │   │   ├── Sidebar.js
│   │   │   │   ├── LoadingSpinner.js
│   │   │   │   └── ErrorMessage.js
│   │   │   │
│   │   │   ├── auth/                  # Authentication components
│   │   │   │   ├── Login.js
│   │   │   │   ├── Register.js
│   │   │   │   └── ForgotPassword.js
│   │   │   │
│   │   │   └── dashboard/             # Dashboard components
│   │   │       ├── StudentDashboard.js
│   │   │       └── AdminDashboard.js
│   │   │
│   │   ├── modules/                   # Feature modules (future)
│   │   │   ├── complaints/            # Complaint module
│   │   │   ├── ai-assistant/          # AI module
│   │   │   ├── results/               # Results module
│   │   │   └── student-corner/        # Student corner module
│   │   │
│   │   ├── services/                  # API communication
│   │   │   ├── api.js                 # Axios instance config
│   │   │   ├── authService.js         # Auth API calls
│   │   │   └── userService.js         # User API calls
│   │   │
│   │   ├── context/                   # React Context (state management)
│   │   │   ├── AuthContext.js         # User authentication state
│   │   │   └── ThemeContext.js        # UI theme state
│   │   │
│   │   ├── utils/                     # Helper functions
│   │   │   ├── validation.js          # Form validation
│   │   │   ├── formatters.js          # Date, text formatters
│   │   │   └── constants.js           # App constants
│   │   │
│   │   ├── styles/                    # CSS files
│   │   │   ├── global.css
│   │   │   └── variables.css          # CSS variables
│   │   │
│   │   ├── App.js                     # Main app component
│   │   ├── index.js                   # Entry point
│   │   └── routes.js                  # Route definitions
│   │
│   ├── package.json
│   └── .env                           # Environment variables
│
├── backend/                           # Node.js + Express server
│   ├── config/
│   │   ├── database.js                # MongoDB connection
│   │   ├── env.js                     # Environment config
│   │   └── constants.js               # Server constants
│   │
│   ├── models/                        # MongoDB schemas
│   │   ├── User.js                    # User schema
│   │   ├── Complaint.js               # Complaint schema (future)
│   │   ├── Result.js                  # Result schema (future)
│   │   └── Notification.js            # Notification schema (future)
│   │
│   ├── controllers/                   # Business logic
│   │   ├── authController.js          # Login, register, logout
│   │   ├── userController.js          # User profile operations
│   │   ├── complaintController.js     # Complaint operations (future)
│   │   └── resultController.js        # Result operations (future)
│   │
│   ├── routes/                        # API endpoints
│   │   ├── authRoutes.js              # /api/auth/*
│   │   ├── userRoutes.js              # /api/users/*
│   │   ├── complaintRoutes.js         # /api/complaints/* (future)
│   │   └── resultRoutes.js            # /api/results/* (future)
│   │
│   ├── middleware/                    # Express middleware
│   │   ├── authMiddleware.js          # JWT verification
│   │   ├── errorHandler.js            # Global error handler
│   │   ├── validator.js               # Request validation
│   │   └── logger.js                  # Request logging
│   │
│   ├── utils/                         # Helper functions
│   │   ├── tokenGenerator.js          # JWT token creation
│   │   ├── emailService.js            # Email sending (future)
│   │   └── fileUpload.js              # File handling (future)
│   │
│   ├── uploads/                       # Uploaded files storage
│   │
│   ├── server.js                      # Express app entry point
│   ├── package.json
│   └── .env                           # Environment variables
│
├── docs/                              # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── USER_MANUAL.md
│
└── README.md                          # Project overview
```

---

## 3. MONGODB COLLECTIONS

### Database Name: `smart_campus_db`

### Collection 1: `users`
**Purpose:** Store all user accounts (students, admins, faculty)

**Sample Document:**
```javascript
{
  _id: ObjectId("..."),
  studentId: "CS2024001",           // Unique college ID
  email: "student@college.edu",
  password: "hashed_password",       // Bcrypt hashed
  fullName: "John Doe",
  role: "student",                   // student | admin | faculty
  department: "Computer Science",
  semester: 6,
  phoneNumber: "9876543210",
  profilePicture: "/uploads/profile.jpg",
  isActive: true,
  createdAt: ISODate("2024-01-15"),
  updatedAt: ISODate("2024-01-15")
}
```

### Collection 2: `complaints` (Future - Module 2)
**Purpose:** Store student complaints/helpdesk tickets

**Sample Document:**
```javascript
{
  _id: ObjectId("..."),
  complaintId: "CMP2024001",
  studentId: ObjectId("..."),        // Reference to users collection
  category: "Infrastructure",        // Infrastructure | Academic | Hostel | etc.
  subject: "Broken projector in Room 301",
  description: "...",
  priority: "medium",                // low | medium | high
  status: "pending",                 // pending | in-progress | resolved | closed
  attachments: ["/uploads/photo.jpg"],
  assignedTo: ObjectId("..."),       // Admin/Faculty ID
  createdAt: ISODate("2024-01-15"),
  resolvedAt: null
}
```

### Collection 3: `results` (Future - Module 3)
**Purpose:** Store student exam results

**Sample Document:**
```javascript
{
  _id: ObjectId("..."),
  studentId: ObjectId("..."),
  semester: 6,
  examType: "Mid-Term",              // Mid-Term | End-Term | Internal
  subjects: [
    {
      subjectCode: "CS601",
      subjectName: "Machine Learning",
      marksObtained: 85,
      totalMarks: 100,
      grade: "A"
    }
  ],
  cgpa: 8.5,
  publishedDate: ISODate("2024-01-15"),
  isPublished: true
}
```

### Collection 4: `notifications` (Future - All Modules)
**Purpose:** Store system notifications for users

**Sample Document:**
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  type: "complaint_update",          // complaint_update | result_published | announcement
  title: "Your complaint has been resolved",
  message: "...",
  isRead: false,
  link: "/complaints/CMP2024001",
  createdAt: ISODate("2024-01-15")
}
```

### Collection 5: `announcements` (Future)
**Purpose:** College-wide announcements

**Sample Document:**
```javascript
{
  _id: ObjectId("..."),
  title: "Holiday Notice",
  content: "...",
  category: "general",               // general | academic | event
  targetAudience: ["student", "faculty"],
  postedBy: ObjectId("..."),         // Admin ID
  isActive: true,
  createdAt: ISODate("2024-01-15"),
  expiresAt: ISODate("2024-01-20")
}
```

---

## 4. DATA FLOW EXPLANATION

### Example: Student Login Flow

**Step 1: Student Opens Website**
- Browser loads React app from college server
- React shows login page

**Step 2: Student Enters Credentials**
- Student types email and password
- React validates input (email format, password length)

**Step 3: Frontend Sends Request**
- React calls: `POST /api/auth/login`
- Sends: `{ email: "student@college.edu", password: "123456" }`

**Step 4: Backend Receives Request**
- Express route `/api/auth/login` catches the request
- Passes to `authController.js`

**Step 5: Controller Processes**
- Controller checks if email exists in `users` collection
- Compares password hash using bcrypt
- If valid: generates JWT token
- If invalid: sends error message

**Step 6: Backend Sends Response**
- Success: `{ token: "jwt_token", user: {...} }`
- Error: `{ error: "Invalid credentials" }`

**Step 7: Frontend Handles Response**
- Stores token in browser (localStorage or cookie)
- Saves user info in React Context
- Redirects to dashboard

**Step 8: Future Requests**
- Every API call includes token in header
- Backend verifies token using middleware
- Allows/denies access based on token validity

---

### Example: Viewing Dashboard (Authenticated)

**Step 1: React Checks Authentication**
- On page load, checks if token exists
- If no token: redirect to login
- If token exists: proceed

**Step 2: Fetch User Data**
- React calls: `GET /api/users/profile`
- Includes token in header: `Authorization: Bearer <token>`

**Step 3: Backend Verifies Token**
- Middleware checks token validity
- Extracts user ID from token
- Fetches user data from `users` collection

**Step 4: Send Data to Frontend**
- Backend sends: `{ user: { name, email, department, ... } }`

**Step 5: React Displays Dashboard**
- Shows personalized greeting: "Welcome, John Doe"
- Displays department, semester info
- Shows quick links to modules

---

## 5. HOW THIS SUPPORTS MULTIPLE MODULES

### Modular Architecture Benefits

**1. Independent Module Development**
- Each module lives in its own folder (`frontend/src/modules/complaints/`)
- Can be developed by different teams simultaneously
- Easy to add/remove modules without breaking others

**2. Shared Components**
- Common UI elements (Navbar, Footer) used by all modules
- Consistent look and feel across the system
- Update once, reflects everywhere

**3. Centralized Authentication**
- Single login system for all modules
- User context shared across modules
- No need to re-authenticate for each feature

**4. Scalable Database Design**
- Each module has its own collection(s)
- Collections can reference each other using ObjectId
- Example: Complaint references User via `studentId`

**5. API Route Organization**
- Each module has dedicated routes: `/api/complaints`, `/api/results`
- Easy to add new routes without cluttering
- Clear separation of concerns

**6. Future Module Integration Example**

When adding "Complaint Module":
- **Frontend:** Create `frontend/src/modules/complaints/` folder
- **Backend:** Create `complaintController.js` and `complaintRoutes.js`
- **Database:** Use existing `complaints` collection
- **Integration:** Add link in dashboard, no changes to auth system

---

## 6. WHY THIS STRUCTURE IS BEST FOR COLLEGE PROJECTS

### Beginner-Friendly
- **Clear Separation:** Frontend and backend are separate folders
- **Logical Naming:** Folder names match their purpose
- **Easy Navigation:** Find files quickly (all routes in `routes/` folder)

### Cost-Effective (Zero Cost)
- **Open Source Stack:** React, Node.js, Express, MongoDB are free
- **No Cloud Costs:** Runs on college server
- **No License Fees:** All tools are community-supported

### Scalable
- **Add Modules Easily:** Just create new folders and routes
- **Handle Growth:** MongoDB scales from 100 to 10,000 students
- **Performance:** Can add caching, load balancing later

### Maintainable
- **MVC Pattern:** Models, Controllers, Routes are separated
- **Reusable Code:** Components and utilities can be shared
- **Documentation:** Each module can have its own README

### Secure
- **JWT Authentication:** Industry-standard token system
- **Password Hashing:** Bcrypt protects passwords
- **Middleware Protection:** Routes can be protected easily
- **Role-Based Access:** Admin vs Student permissions

### Team-Friendly
- **Multiple Developers:** Different people can work on different modules
- **Version Control:** Git-friendly structure
- **Code Reviews:** Easy to review changes in specific folders

### Production-Ready
- **Environment Config:** `.env` files for dev/production settings
- **Error Handling:** Centralized error management
- **Logging:** Track issues and debug easily
- **Deployment:** Can be deployed to college server with minimal setup

---

## NEXT STEPS (After Module 1 Approval)

1. **Module 2:** Design Complaint/Helpdesk System
2. **Module 3:** Design AI Assistant Integration
3. **Module 4:** Design Result Management System
4. **Module 5:** Design Student Corner Features

Each module will plug into this foundation seamlessly.

---

## TECHNOLOGY JUSTIFICATION

### Why React.js?
- Component-based (reusable UI pieces)
- Large community support
- Easy to learn for beginners
- Works great for single-page applications

### Why Node.js + Express?
- JavaScript on both frontend and backend (easier for students)
- Fast and lightweight
- Huge npm ecosystem
- Perfect for REST APIs

### Why MongoDB?
- Flexible schema (easy to modify collections)
- JSON-like documents (matches JavaScript objects)
- Easy to set up locally
- Scales well for college-sized data

---

**This architecture is designed to grow with your project while keeping things simple and organized.**
