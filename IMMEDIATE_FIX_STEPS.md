# 🚨 IMMEDIATE FIX - Student Cannot See Complaints

## Current Situation
- Error shown: **"Access denied. Admin role required"**
- Student has raised complaints
- Admin/Staff can see and update complaints
- Student cannot see their own complaints

## Root Cause
The backend server is running with the OLD buggy middleware code. The fix has been applied to the files, but the server needs to be restarted to load the new code.

## IMMEDIATE ACTION (Do This Now!)

### Option 1: Quick Fix (Recommended)
```bash
FIX_NOW_EMERGENCY.bat
```

### Option 2: Manual Fix
```bash
# Stop backend
taskkill /F /IM node.exe

# Start backend
cd backend
npm start
```

### Option 3: If Above Don't Work
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Clear npm cache
cd backend
npm cache clean --force

# Reinstall if needed
npm install

# Start fresh
npm start
```

## After Restarting Backend

### Step 1: Clear Browser Cache
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"

### Step 2: Logout and Login Again
1. Click logout in the app
2. Login again with:
   - Roll Number: `CS2021001`
   - Password: `password123`

### Step 3: Test
1. Go to "My Complaints"
2. Click "Refresh" button
3. Complaints should now appear!

## Why This Happened

The middleware file was fixed, but Node.js caches the old code in memory. Restarting the server loads the new fixed code.

### What Was Fixed:
```javascript
// OLD CODE (Buggy)
function verifyStudent(req, res, next) {
  verifyToken(req, res, (err) => {  // ❌ Broken callback
    if (err) return;
    if (req.role !== 'student') {
      return res.status(403).json({
        message: 'Access denied. Admin role required.'  // ← This error!
      });
    }
    next();
  });
}

// NEW CODE (Fixed)
function verifyStudent(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No token provided'
      });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;  // ✅ Properly set
    req.role = decoded.role;      // ✅ Properly set
    if (req.role !== 'student') {
      return res.status(403).json({
        message: 'Access denied. Student role required.'
      });
    }
    next();  // ✅ Continue to controller
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
}
```

## Verification Steps

After restart, check:

### 1. Backend Console Should Show:
```
✅ MongoDB Connected Successfully
🚀 Smart Campus Helpdesk Server Started
📡 Server running on port 3001
```

### 2. When You Visit "My Complaints":
Backend console should show:
```
=== VERIFY STUDENT DEBUG ===
Token decoded: { userId: '...', role: 'student' }
✅ Student verified successfully

=== GET MY COMPLAINTS DEBUG ===
Extracted studentId: ...
Found X complaints
```

### 3. Browser Should Show:
- List of your complaints
- No error messages
- Status badges (Pending, In Progress, Resolved)

## If Still Not Working

### Check 1: Is Backend Running?
Open: http://localhost:3001/api/health

Should see:
```json
{
  "success": true,
  "message": "Server is healthy",
  "database": "Connected"
}
```

### Check 2: Check Backend Console
Look for any errors when server starts:
- MongoDB connection errors?
- Port already in use?
- Module not found errors?

### Check 3: Check Browser Console (F12)
Look for:
- Network errors?
- 401/403 errors?
- Token issues?

### Check 4: Verify Token
In browser console (F12):
```javascript
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);

// Decode token
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  // Should show: { userId: '...', role: 'student', ... }
}
```

## Emergency Fallback

If nothing works, try this complete reset:

```bash
# 1. Stop everything
taskkill /F /IM node.exe

# 2. Backend
cd backend
npm cache clean --force
del package-lock.json
rmdir /s /q node_modules
npm install
npm start

# 3. Frontend (in new terminal)
cd frontend
npm cache clean --force
del package-lock.json
rmdir /s /q node_modules
npm install
npm start
```

## Success Indicators

✅ Backend starts without errors
✅ No "Access denied" error in UI
✅ Complaints list loads
✅ Can see complaint details
✅ Can see status updates
✅ Refresh button works

## Timeline

- **0-2 min**: Restart backend
- **2-3 min**: Clear browser cache, logout/login
- **3-5 min**: Test and verify complaints appear
- **Total**: 5 minutes to fix

## Contact

If issue persists after following ALL steps:
1. Share backend console output (screenshot or text)
2. Share browser console errors (F12 → Console tab)
3. Share network tab (F12 → Network → filter by "complaints")

---

**The fix is ready. Just restart the backend server!**
