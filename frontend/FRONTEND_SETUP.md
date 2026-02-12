# Frontend Setup Guide

## Current Status: Phase 1 Complete ✅

### What's Been Built

#### 1. Project Structure
```
frontend/src/
├── pages/
│   ├── Login.jsx ✅
│   └── Register.jsx ✅
├── components/
│   └── Loader.jsx ✅
├── services/
│   ├── api.js ✅
│   ├── authService.js ✅
│   ├── complaintService.js ✅
│   ├── dashboardService.js ✅
│   ├── postService.js ✅
│   ├── aiService.js ✅
│   └── resultService.js ✅
├── context/
│   └── AuthContext.jsx ✅
├── routes/
│   └── ProtectedRoute.jsx ✅
├── styles/
│   └── Login.css ✅
└── App.js ✅ (with routing)
```

#### 2. Dependencies Installed
- ✅ axios (API calls)
- ✅ react-router-dom (routing)

#### 3. Features Implemented

**Authentication System:**
- Login page with 3 user types (Student, Admin, Staff)
- Student registration page
- AuthContext for global state management
- Protected routes with role-based access
- Token management in localStorage
- Auto-redirect on unauthorized access

**API Service Layer:**
- Centralized API configuration
- Request/response interceptors
- Automatic token injection
- Service modules for all backend endpoints:
  - Auth (login, register, logout)
  - Complaints (CRUD operations)
  - Dashboard (student data)
  - Posts (Student Corner)
  - AI Chat
  - Results (UT marks)

**Routing:**
- Public routes: /login, /register
- Protected routes with role checks
- Placeholder pages for dashboard, admin, staff

---

## How to Run

### 1. Start Backend (if not running)
```bash
cd backend
npm start
```
Backend runs on: http://localhost:3001

### 2. Start Frontend
```bash
cd frontend
npm start
```
Frontend runs on: http://localhost:3000

### 3. Test Login

**Student Login:**
- Roll Number: CS2024001
- Password: Test@123

**Admin Login:**
- Username: admin
- Password: admin123

**Staff Login:**
- Email: rajesh.staff@college.edu
- Password: staff123

---

## Next Steps

### Phase 2: Student Dashboard
- [ ] Create StudentDashboard.jsx
- [ ] Show student info
- [ ] Display complaint statistics
- [ ] Show recent complaints

### Phase 3: Complaint Management
- [ ] Create Complaint.jsx (Student view)
- [ ] Create/view complaints
- [ ] Upload attachments
- [ ] Track status

### Phase 4: Student Corner
- [ ] Create StudentCorner.jsx
- [ ] Post feed with pagination
- [ ] Like/comment functionality
- [ ] Create post with attachments

### Phase 5: AI Chat
- [ ] Create AIChat.jsx
- [ ] WhatsApp-like chat UI
- [ ] Message history
- [ ] Real-time responses

### Phase 6: Results
- [ ] Create Results.jsx
- [ ] View UT-1 and UT-2 marks
- [ ] Performance analysis
- [ ] Subject-wise comparison

### Phase 7: Admin/Staff Pages
- [ ] Admin complaint management
- [ ] Staff assigned complaints
- [ ] Status updates

---

## Design Guidelines

### Colors
- Primary: #667eea (Purple-blue)
- Secondary: #764ba2 (Purple)
- Success: #4caf50
- Error: #f44336
- Background: #f5f5f5

### Typography
- System fonts for fast loading
- Clear hierarchy
- Readable sizes (14px-16px body)

### UI Principles
- Clean and minimal
- Fast loading (no heavy libraries)
- Mobile responsive
- Accessibility first
- User-friendly error messages

---

## API Endpoints Reference

All endpoints are in `backend/test-api.http`

**Base URL:** http://localhost:3001/api

**Authentication:**
- POST /auth/student/register
- POST /auth/student/login
- POST /auth/admin/login
- POST /auth/staff/login

**Student Dashboard:**
- GET /student/dashboard

**Complaints:**
- POST /complaints
- GET /complaints/my
- GET /admin/complaints
- PATCH /complaints/:id

**Posts (Student Corner):**
- POST /posts
- GET /posts
- POST /posts/:id/like
- POST /posts/:id/comment
- DELETE /posts/:id

**AI Chat:**
- POST /ai/chat
- GET /ai/history
- DELETE /ai/history

**Results:**
- GET /results/my
- POST /results (Teacher/Admin)

---

## Notes

- Backend must be running on port 3001
- Frontend runs on port 3000
- All API calls include JWT token automatically
- Unauthorized requests redirect to login
- Role-based access control is enforced
