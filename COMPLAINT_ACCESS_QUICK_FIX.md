# Quick Fix: Student Complaint Access

## Problem
Students getting "Access denied. Admin role required" when viewing their complaints.

## Solution Applied
Fixed middleware authentication in `backend/middleware/authMiddleware.js`

## How to Apply

### Step 1: Restart Backend Server

**Windows:**
```bash
restart-backend.bat
```

**Or manually:**
```bash
cd backend
npm start
```

### Step 2: Test the Fix

1. **Login as Student**
   - Roll Number: `CS2021001`
   - Password: `password123`

2. **Create a Complaint**
   - Go to "Raise Complaint"
   - Fill in details
   - Submit

3. **View Complaints**
   - Go to "My Complaints"
   - Should see your complaints
   - No "Access denied" error

### Step 3: Verify with Test Script

```bash
node test-student-complaint-access.js
```

Expected output:
```
✅ Student Login successful
✅ Complaint created successfully
✅ Complaints fetched successfully
✅ TEST PASSED: Student can access their complaints
```

## What Was Fixed

### Before:
```javascript
// ❌ Broken callback pattern
function verifyStudent(req, res, next) {
  verifyToken(req, res, (err) => {
    if (err) return;
    if (req.role !== 'student') {
      return res.status(403).json({...});
    }
    next();
  });
}
```

### After:
```javascript
// ✅ Direct implementation
function verifyStudent(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({...});
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role;
    if (req.role !== 'student') {
      return res.status(403).json({...});
    }
    next();
  } catch (error) {
    return res.status(401).json({...});
  }
}
```

## Files Modified
- ✅ `backend/middleware/authMiddleware.js`

## Files NOT Modified (No Changes Needed)
- ❌ Frontend files
- ❌ Routes
- ❌ Controllers
- ❌ Database

## Security Status
✅ Students can view own complaints
✅ Students CANNOT view other students' complaints
✅ Students CANNOT access admin routes
✅ Admins can view all complaints
✅ Role-based access control intact

## Troubleshooting

### Still Getting Error?

1. **Check if server restarted:**
   ```bash
   # Kill all node processes
   taskkill /F /IM node.exe
   
   # Start fresh
   cd backend
   npm start
   ```

2. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear cached data
   - Refresh page

3. **Check token:**
   - Open browser console (F12)
   - Type: `localStorage.getItem('token')`
   - Should see a JWT token
   - If null, login again

4. **Verify backend is running:**
   - Open: http://localhost:3001/api/health
   - Should see: `{"success": true, "message": "Server is healthy"}`

### Test Individual Components

**Test 1: Login**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"userType\":\"student\",\"rollNumber\":\"CS2021001\",\"password\":\"password123\"}"
```

**Test 2: Get Complaints (use token from Test 1)**
```bash
curl -X GET http://localhost:3001/api/complaints \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Success Indicators

✅ No "Access denied" errors
✅ Complaints list loads
✅ Can create new complaints
✅ Can see status updates
✅ Refresh button works

## Need Help?

Run the diagnostic:
```bash
node diagnose-complaint-access.js
```

Run the full test:
```bash
node test-student-complaint-access.js
```

## Summary

**What:** Fixed middleware authentication bug
**Where:** `backend/middleware/authMiddleware.js`
**Impact:** Students can now access their complaints
**Breaking Changes:** None
**Action Required:** Restart backend server
