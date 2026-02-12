# Frontend Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     SMART CAMPUS FRONTEND                    │
│                    React.js Application                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│   ROUTING    │      │     AUTH     │     │  API LAYER   │
│ React Router │      │   Context    │     │    Axios     │
└──────────────┘      └──────────────┘     └──────────────┘
        │                     │                     │
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   PAGE COMPONENTS │
                    └──────────────────┘
```

---

## Component Hierarchy

```
App.js (Root)
│
├── AuthProvider (Context)
│   │
│   └── Router
│       │
│       ├── Public Routes
│       │   ├── /login → Login.jsx
│       │   └── /register → Register.jsx
│       │
│       └── Protected Routes
│           ├── /dashboard → StudentDashboard.jsx (TODO)
│           ├── /complaints → Complaints.jsx (TODO)
│           ├── /corner → StudentCorner.jsx (TODO)
│           ├── /ai-chat → AIChat.jsx (TODO)
│           ├── /results → Results.jsx (TODO)
│           ├── /admin/* → Admin pages (TODO)
│           └── /staff/* → Staff pages (TODO)
```

---

## Data Flow

### Authentication Flow
```
1. User enters credentials
   │
   ▼
2. Login.jsx calls authService.login()
   │
   ▼
3. authService makes API call via axios
   │
   ▼
4. Backend returns JWT token
   │
   ▼
5. Token stored in localStorage
   │
   ▼
6. AuthContext updates user state
   │
   ▼
7. User redirected to dashboard
   │
   ▼
8. All subsequent API calls include token
```

### API Request Flow
```
Component
   │
   ▼
Service Function (e.g., complaintService.getMyComplaints())
   │
   ▼
api.js (Axios instance)
   │
   ├─→ Request Interceptor (adds JWT token)
   │
   ▼
Backend API (http://localhost:3001/api)
   │
   ▼
Response
   │
   ├─→ Response Interceptor (handles 401 errors)
   │
   ▼
Component receives data
```

---

## Service Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    API SERVICES                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  api.js (Base Configuration)                            │
│  ├── Base URL: http://localhost:3001/api               │
│  ├── Request Interceptor: Add JWT token                │
│  └── Response Interceptor: Handle 401 errors           │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  authService.js                                         │
│  ├── registerStudent()                                  │
│  ├── loginStudent()                                     │
│  ├── loginAdmin()                                       │
│  ├── loginStaff()                                       │
│  ├── logout()                                           │
│  └── getCurrentUser()                                   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  complaintService.js                                    │
│  ├── createComplaint()                                  │
│  ├── getMyComplaints()                                  │
│  ├── getAllComplaints()                                 │
│  ├── assignComplaint()                                  │
│  └── updateComplaintStatus()                            │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  dashboardService.js                                    │
│  └── getDashboardData()                                 │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  postService.js                                         │
│  ├── createPost()                                       │
│  ├── getFeed()                                          │
│  ├── toggleLike()                                       │
│  ├── addComment()                                       │
│  ├── reportPost()                                       │
│  └── deletePost()                                       │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  aiService.js                                           │
│  ├── sendMessage()                                      │
│  ├── getChatHistory()                                   │
│  └── clearHistory()                                     │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  resultService.js                                       │
│  ├── getMyResults()                                     │
│  ├── enterResult()                                      │
│  └── getStudentResults()                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## State Management

### Global State (AuthContext)
```javascript
{
  user: {
    // Student: { rollNumber, fullName, ... }
    // Admin: { username, ... }
    // Staff: { email, name, ... }
  },
  role: 'student' | 'admin' | 'staff',
  loading: boolean,
  isAuthenticated: boolean,
  login: function,
  logout: function
}
```

### Local State (Component Level)
- Form data
- Loading states
- Error messages
- UI state (modals, dropdowns, etc.)

---

## Route Protection

```
User tries to access /dashboard
   │
   ▼
ProtectedRoute checks:
   ├─→ Is user authenticated?
   │   ├─→ No → Redirect to /login
   │   └─→ Yes → Continue
   │
   └─→ Is user role allowed?
       ├─→ No → Redirect to /unauthorized
       └─→ Yes → Render component
```

---

## File Organization

```
frontend/src/
│
├── pages/                    (Full page components)
│   ├── Login.jsx            ✅ Multi-role login
│   ├── Register.jsx         ✅ Student registration
│   ├── StudentDashboard.jsx ⏳ TODO
│   ├── Complaints.jsx       ⏳ TODO
│   ├── StudentCorner.jsx    ⏳ TODO
│   ├── AIChat.jsx           ⏳ TODO
│   └── Results.jsx          ⏳ TODO
│
├── components/               (Reusable UI components)
│   ├── Loader.jsx           ✅ Loading spinner
│   ├── Navbar.jsx           ⏳ TODO
│   ├── Sidebar.jsx          ⏳ TODO
│   ├── PostCard.jsx         ⏳ TODO
│   └── ChatBubble.jsx       ⏳ TODO
│
├── services/                 (API integration)
│   ├── api.js               ✅ Axios config
│   ├── authService.js       ✅ Auth APIs
│   ├── complaintService.js  ✅ Complaint APIs
│   ├── dashboardService.js  ✅ Dashboard APIs
│   ├── postService.js       ✅ Post APIs
│   ├── aiService.js         ✅ AI APIs
│   └── resultService.js     ✅ Result APIs
│
├── context/                  (Global state)
│   └── AuthContext.jsx      ✅ Auth state
│
├── routes/                   (Route protection)
│   └── ProtectedRoute.jsx   ✅ Role-based access
│
├── styles/                   (CSS files)
│   └── Login.css            ✅ Login/Register styles
│
├── App.js                    ✅ Main app with routing
├── App.css                   ✅ Global styles
├── index.js                  ✅ Entry point
└── index.css                 ✅ Base styles
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 19.2.4 | UI library |
| Routing | React Router v6 | Client-side routing |
| HTTP Client | Axios | API calls |
| State Management | Context API | Global auth state |
| Styling | Vanilla CSS | Custom styles |
| Build Tool | Create React App | Development setup |

---

## Security Features

1. **JWT Token Management**
   - Stored in localStorage
   - Auto-injected in API requests
   - Cleared on logout

2. **Route Protection**
   - Authentication check
   - Role-based access control
   - Auto-redirect on unauthorized

3. **API Security**
   - CORS handled by backend
   - Token validation on backend
   - 401 errors trigger logout

4. **Input Validation**
   - Form validation before submission
   - Error messages for invalid input
   - Password strength requirements

---

## Performance Considerations

1. **Fast Loading**
   - No heavy UI libraries
   - Minimal dependencies
   - Optimized for college lab PCs

2. **Code Splitting**
   - React Router lazy loading (can be added)
   - Component-level code splitting (future)

3. **API Optimization**
   - Centralized axios instance
   - Request/response interceptors
   - Error handling at service layer

---

## Next Steps

### Immediate (Phase 2)
- Build StudentDashboard.jsx
- Create Navbar component
- Add dashboard statistics

### Short Term (Phase 3-4)
- Complaint management UI
- Student Corner feed
- Post creation with attachments

### Medium Term (Phase 5-6)
- AI Chat interface
- Results display
- Performance analysis UI

### Long Term (Phase 7)
- Admin dashboard
- Staff complaint management
- Analytics and reports
