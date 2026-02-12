# 🚀 START HERE - Frontend Development Guide

## Quick Start (2 Minutes)

### 1. Start Backend
```bash
cd backend
npm start
```
✅ Backend runs on: http://localhost:3001

### 2. Start Frontend
```bash
cd frontend
npm start
```
✅ Frontend runs on: http://localhost:3000

### 3. Test Login
Open browser: http://localhost:3000

**Student Login:**
- Roll Number: `CS2024001`
- Password: `Test@123`

---

## What's Been Built ✅

### Phase 1: Foundation & Authentication (COMPLETE)

1. **Authentication System**
   - Multi-role login (Student, Admin, Staff)
   - Student registration
   - JWT token management
   - Role-based access control

2. **API Integration**
   - All backend endpoints mapped
   - Automatic token injection
   - Global error handling
   - 6 service modules ready

3. **Routing System**
   - Protected routes
   - Role-based access
   - Auto-redirects

4. **UI Components**
   - Login page
   - Registration page
   - Loading spinner
   - Clean, modern design

---

## Project Structure

```
frontend/src/
├── pages/          → Login ✅, Register ✅
├── components/     → Loader ✅
├── services/       → All API services ✅
├── context/        → AuthContext ✅
├── routes/         → ProtectedRoute ✅
└── styles/         → Login.css ✅
```

---

## What to Build Next

### Phase 2: Student Dashboard (NEXT)
**File:** `frontend/src/pages/StudentDashboard.jsx`

**Features:**
- Student info card
- Complaint statistics
- Recent complaints
- Quick actions

**API Calls:**
```javascript
import dashboardService from '../services/dashboardService';
import complaintService from '../services/complaintService';

// Get dashboard data
const data = await dashboardService.getDashboardData();

// Get recent complaints
const complaints = await complaintService.getMyComplaints();
```

---

## Important Files to Read

### For Understanding
1. `FRONTEND_STATUS.md` - Current status
2. `FRONTEND_ARCHITECTURE.md` - System design
3. `QUICK_FRONTEND_REFERENCE.md` - Code patterns

### For Development
1. `backend/test-api.http` - All API endpoints
2. `frontend/src/services/` - API service functions
3. `frontend/src/pages/Login.jsx` - Example page

---

## Development Rules

### ✅ DO
- Use existing API services
- Follow patterns in Login.jsx
- Show loading states
- Handle errors gracefully
- Use `useAuth()` hook for user data
- Keep components small

### ❌ DON'T
- Create new API calls (use services)
- Mix backend logic in UI
- Skip error handling
- Build all pages at once
- Add extra features

---

## Code Patterns

### Using Auth
```javascript
import { useAuth } from '../context/AuthContext';

const { user, role, logout } = useAuth();
```

### API Call with Loading
```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await someService.getData();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### Protected Route
```javascript
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute allowedRoles={['student']}>
      <StudentDashboard />
    </ProtectedRoute>
  } 
/>
```

---

## Available API Services

All services are in `frontend/src/services/`:

```javascript
// Auth
import authService from '../services/authService';
authService.login(credentials, role)
authService.logout()
authService.getCurrentUser()

// Dashboard
import dashboardService from '../services/dashboardService';
dashboardService.getDashboardData()

// Complaints
import complaintService from '../services/complaintService';
complaintService.createComplaint(data)
complaintService.getMyComplaints()
complaintService.updateComplaintStatus(id, status, remark)

// Posts (Student Corner)
import postService from '../services/postService';
postService.createPost(text)
postService.getFeed(page, limit)
postService.toggleLike(postId)
postService.addComment(postId, text)

// AI Chat
import aiService from '../services/aiService';
aiService.sendMessage(message)
aiService.getChatHistory()
aiService.clearHistory()

// Results
import resultService from '../services/resultService';
resultService.getMyResults()
```

---

## Testing Credentials

| Role | Login | Password |
|------|-------|----------|
| Student | CS2024001 | Test@123 |
| Admin | admin | admin123 |
| Staff | rajesh.staff@college.edu | staff123 |

---

## Troubleshooting

### Frontend won't start
```bash
cd frontend
npm install
npm start
```

### Backend not responding
```bash
cd backend
npm start
```

### Login not working
- Check backend is running on port 3001
- Check credentials are correct
- Open browser console for errors

### API calls failing
- Check backend is running
- Check token in localStorage (DevTools → Application → Local Storage)
- Check network tab for request details

---

## Next Steps

1. **Read** `FRONTEND_STATUS.md` for complete overview
2. **Review** `frontend/src/pages/Login.jsx` for code patterns
3. **Check** `backend/test-api.http` for API endpoints
4. **Build** Student Dashboard page next

---

## Need Help?

### Documentation
- `FRONTEND_STATUS.md` - Current status
- `FRONTEND_ARCHITECTURE.md` - System design
- `FRONTEND_SETUP.md` - Detailed setup
- `QUICK_FRONTEND_REFERENCE.md` - Quick reference

### Code Examples
- `frontend/src/pages/Login.jsx` - Complete page example
- `frontend/src/services/authService.js` - API service example
- `frontend/src/context/AuthContext.jsx` - Context example

---

## Success Checklist

- [x] Dependencies installed
- [x] Backend running on port 3001
- [x] Frontend running on port 3000
- [x] Login works for all roles
- [x] Registration works
- [x] Protected routes work
- [x] API services ready
- [ ] Student Dashboard (NEXT)
- [ ] Complaint Management
- [ ] Student Corner
- [ ] AI Chat
- [ ] Results Page

---

## Ready to Code! 🎉

Everything is set up and working. The foundation is solid. All API services are ready. 

**Next Command:**
```
"Build the Student Dashboard page"
```

Let's build something awesome! 🚀
