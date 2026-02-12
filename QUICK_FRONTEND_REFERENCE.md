# Quick Frontend Reference

## Start Commands

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm start
```

Or use batch files:
```bash
start-backend.bat
start-frontend.bat
```

---

## Test Credentials

| Role | Username/Email | Password |
|------|---------------|----------|
| Student | CS2024001 | Test@123 |
| Admin | admin | admin123 |
| Staff | rajesh.staff@college.edu | staff123 |

---

## API Base URL

```javascript
http://localhost:3001/api
```

---

## Import Patterns

### Using Auth
```javascript
import { useAuth } from '../context/AuthContext';

const { user, role, login, logout, isAuthenticated } = useAuth();
```

### Using API Services
```javascript
import authService from '../services/authService';
import complaintService from '../services/complaintService';
import dashboardService from '../services/dashboardService';
import postService from '../services/postService';
import aiService from '../services/aiService';
import resultService from '../services/resultService';
```

### Protected Routes
```javascript
import ProtectedRoute from '../routes/ProtectedRoute';

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

## Common Patterns

### API Call with Loading & Error
```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await someService.getData();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

### Form Submission
```javascript
const [formData, setFormData] = useState({ field1: '', field2: '' });
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
  setError('');
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    await someService.submitData(formData);
    // Success handling
  } catch (err) {
    setError(err.response?.data?.message || 'Submission failed');
  } finally {
    setLoading(false);
  }
};
```

---

## Folder Structure

```
src/
├── pages/          → Full page components
├── components/     → Reusable UI components
├── services/       → API call functions
├── context/        → Global state (Auth)
├── routes/         → Route protection
└── styles/         → CSS files
```

---

## Styling Guidelines

### Colors
```css
Primary: #667eea
Secondary: #764ba2
Success: #4caf50
Error: #f44336
Background: #f5f5f5
Text: #333
Light Text: #666
Border: #e0e0e0
```

### Common Classes
```css
.loader-container
.loader
.text-center
.mt-20, .mb-20, .p-20
```

---

## Backend Endpoints Quick Reference

### Auth
- POST `/auth/student/register`
- POST `/auth/student/login`
- POST `/auth/admin/login`
- POST `/auth/staff/login`

### Dashboard
- GET `/student/dashboard`

### Complaints
- POST `/complaints`
- GET `/complaints/my`
- GET `/admin/complaints`
- PATCH `/complaints/:id`

### Posts
- POST `/posts`
- GET `/posts?page=1&limit=10`
- POST `/posts/:id/like`
- POST `/posts/:id/comment`
- DELETE `/posts/:id`

### AI Chat
- POST `/ai/chat`
- GET `/ai/history`
- DELETE `/ai/history`

### Results
- GET `/results/my`
- POST `/results`

---

## Development Workflow

1. **Create Page Component** in `src/pages/`
2. **Create Reusable Components** in `src/components/`
3. **Add Route** in `App.js`
4. **Use Existing Services** from `src/services/`
5. **Add Styles** in `src/styles/` or inline
6. **Test** with backend running

---

## Tips

- Always use existing services (don't create new API calls)
- Use `useAuth()` hook for user data
- Wrap protected routes with `<ProtectedRoute>`
- Show loading states during API calls
- Display user-friendly error messages
- Keep components small and focused
- Use functional components with hooks
- Follow existing naming conventions
