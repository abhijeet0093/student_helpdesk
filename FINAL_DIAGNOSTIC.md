# FINAL DIAGNOSTIC - Student Complaint Access

## Current Status
❌ Error: "Access denied. Admin role required"
✅ Middleware code is fixed
❓ Need to identify why it's still failing

## Diagnostic Steps

### Step 1: Check if Backend is Running with New Code

Open backend console window and look for this when server starts:
```
✅ MongoDB Connected Successfully
🚀 Smart Campus Helpdesk Server Started
📡 Server running on port 3001
```

**If you don't see a backend console window:**
```bash
cd backend
npm start
```

### Step 2: Check Browser Network Tab

1. Open browser (F12)
2. Go to Network tab
3. Click "My Complaints"
4. Look for the request to "complaints"
5. Check:
   - **Request URL**: Should be `http://localhost:3001/api/complaints`
   - **Status Code**: What is it? (403, 401, 200?)
   - **Response**: What does it say?

### Step 3: Check Token in Browser

In browser console (F12), run:
```javascript
const token = localStorage.getItem('token');
if (token) {
  const parts = token.split('.');
  const payload = JSON.parse(atob(parts[1]));
  console.log('Token Payload:', payload);
  console.log('Role:', payload.role);
  console.log('User ID:', payload.userId);
} else {
  console.log('No token found!');
}
```

**Expected output:**
```
Token Payload: {userId: "67abc...", role: "student", iat: ..., exp: ...}
Role: student
User ID: 67abc...
```

**If role is NOT "student":**
- You're logged in as wrong user
- Logout and login as student (CS2021001 / password123)

### Step 4: Test API Directly

Open Command Prompt and run:
```bash
curl -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"userType\":\"student\",\"rollNumber\":\"CS2021001\",\"password\":\"password123\"}"
```

Copy the token from response, then:
```bash
curl -X GET http://localhost:3001/api/complaints ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**If this works but browser doesn't:**
- Frontend issue (cached token, wrong endpoint)

**If this also fails:**
- Backend issue (middleware, routes)

## Common Issues and Solutions

### Issue 1: Backend Not Restarted
**Symptom:** No debug logs in backend console
**Solution:**
```bash
# Stop backend (Ctrl+C in backend window)
cd backend
npm start
```

### Issue 2: Wrong User Logged In
**Symptom:** Token has role='admin' or role='staff'
**Solution:**
1. Click Logout
2. Login as student:
   - Roll Number: CS2021001
   - Password: password123

### Issue 3: Cached Token
**Symptom:** Old token with wrong data
**Solution:**
1. Browser console: `localStorage.clear()`
2. Refresh page (F5)
3. Login again

### Issue 4: Frontend Calling Wrong Endpoint
**Symptom:** Network tab shows `/api/admin/complaints`
**Solution:** Check MyComplaints.jsx line 40 - should be `api.get('/complaints')`

### Issue 5: Port Conflict
**Symptom:** Backend won't start, "port already in use"
**Solution:**
```bash
taskkill /F /IM node.exe
cd backend
npm start
```

## What to Share

If still not working, share:

1. **Backend Console Output** (when you access My Complaints)
2. **Browser Network Tab** (screenshot of the complaints request)
3. **Token Payload** (from browser console check above)
4. **Backend Startup Logs** (first 20 lines when server starts)

## Expected vs Actual

### Expected Flow:
```
1. Student logs in → Token: {userId: "...", role: "student"}
2. Frontend calls: GET /api/complaints
3. Backend: verifyStudent middleware
4. Middleware: Decodes token, sets req.userId, req.role
5. Middleware: Checks role === 'student' ✅
6. Controller: Gets complaints for studentId
7. Response: 200 OK with complaints array
```

### If Getting "Admin role required":
```
1. Student logs in → Token: {userId: "...", role: "???"}
2. Frontend calls: GET /api/??? (wrong endpoint?)
3. Backend: ??? middleware (wrong middleware?)
4. Middleware: Checks role === 'admin' ❌
5. Response: 403 "Access denied. Admin role required"
```

## Quick Checklist

- [ ] Backend server is running
- [ ] Backend console shows debug logs
- [ ] Logged in as student (not admin/staff)
- [ ] Token has role='student'
- [ ] Browser calling /api/complaints (not /api/admin/complaints)
- [ ] No cached old token
- [ ] Backend restarted after code changes

## Emergency Reset

If nothing works, complete reset:

```bash
# 1. Stop all
taskkill /F /IM node.exe

# 2. Clear browser
# In browser console: localStorage.clear()

# 3. Restart backend
cd backend
npm start

# 4. Restart frontend
cd frontend
npm start

# 5. Login fresh
# Use: CS2021001 / password123
```

---

**The fix is in the code. We just need to identify why it's not being used!**
