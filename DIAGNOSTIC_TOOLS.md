# 🛠️ Diagnostic Tools Guide

## Overview

I've created several tools to help you diagnose and fix login issues quickly.

---

## 🚀 Quick Start Tools

### 1. START_SERVERS.bat
**Purpose:** Automatically start MongoDB, Backend, and Frontend

**Usage:**
```bash
START_SERVERS.bat
```

**What it does:**
- Starts MongoDB service
- Opens new terminal for backend
- Opens new terminal for frontend
- Shows you the URLs to access

**When to use:**
- First time starting the project
- After restarting your computer
- When you want to start everything at once

---

### 2. check-status.bat
**Purpose:** Check if all services are running

**Usage:**
```bash
check-status.bat
```

**What it checks:**
- ✅ MongoDB status
- ✅ Backend status (port 3001)
- ✅ Frontend status (port 3000)
- ✅ Backend API functionality

**When to use:**
- Before trying to login
- When something isn't working
- To verify everything is running

---

### 3. test-backend-api.js
**Purpose:** Test all backend login endpoints

**Usage:**
```bash
node test-backend-api.js
```

**What it tests:**
- Health check endpoint
- Student login
- Admin login
- Staff login

**Output:**
```
✅ Health check passed
✅ Student login successful
✅ Admin login successful
✅ Staff login successful
```

**When to use:**
- To verify backend is working
- Before testing frontend
- When login fails in browser

---

### 4. test-login.html
**Purpose:** Visual test page for login API

**Usage:**
1. Open `test-login.html` in your browser
2. Click "Test Backend Health"
3. Select user type
4. Click "Test Login"

**Features:**
- Visual interface
- Detailed error messages
- Shows full API response
- Tests all user types

**When to use:**
- When you want visual feedback
- To see exact API responses
- To test without using the main app

---

### 5. backend/test-connection.js
**Purpose:** Comprehensive database diagnostic

**Usage:**
```bash
cd backend
node test-connection.js
```

**What it checks:**
- Environment variables
- MongoDB connection
- Database collections
- Admin user exists
- Student data exists

**Output:**
```
1️⃣ Checking environment variables:
   PORT: 3001 ✅
   MONGODB_URI: mongodb://localhost:27017/smart_campus_db ✅

2️⃣ Testing MongoDB connection...
   ✅ MongoDB connected successfully!

3️⃣ Checking database collections:
   Found collections:
   - students
   - admins
   - staff

4️⃣ Checking if admin user exists:
   ✅ Admin user found: admin

5️⃣ Checking if students exist:
   ✅ Found 1 student(s)
```

**When to use:**
- When MongoDB connection fails
- To check if database has data
- Before seeding database

---

## 📋 Diagnostic Workflow

### Scenario 1: Fresh Start

```bash
# Step 1: Start everything
START_SERVERS.bat

# Step 2: Wait 15 seconds

# Step 3: Check status
check-status.bat

# Step 4: If database is empty, seed it
cd backend
node scripts/seedAdmin.js
node scripts/seedStaff.js

# Step 5: Test backend
node test-backend-api.js

# Step 6: Try login in browser
# Go to: http://localhost:3000
```

---

### Scenario 2: Login Not Working

```bash
# Step 1: Check what's running
check-status.bat

# Step 2: Test backend API
node test-backend-api.js

# Step 3: If backend test fails, check database
cd backend
node test-connection.js

# Step 4: If database is empty, seed it
node scripts/seedAdmin.js
node scripts/seedStaff.js

# Step 5: Test again
node test-backend-api.js

# Step 6: Try login in browser
```

---

### Scenario 3: Backend Issues

```bash
# Step 1: Check MongoDB
net start MongoDB

# Step 2: Check database connection
cd backend
node test-connection.js

# Step 3: If connection fails, check .env file
# Make sure MONGODB_URI is correct

# Step 4: Restart backend
# Press Ctrl+C in backend terminal
npm start

# Step 5: Test API
node test-backend-api.js
```

---

### Scenario 4: Frontend Issues

```bash
# Step 1: Check if backend is working
node test-backend-api.js

# Step 2: If backend works, check frontend
# Open browser console (F12)
# Try to login
# Look for errors

# Step 3: Check Network tab
# F12 → Network → Try login
# Click on failed request
# Check request URL and response

# Step 4: Restart frontend
# Press Ctrl+C in frontend terminal
npm start
```

---

## 🎯 Quick Reference

### All Diagnostic Commands

```bash
# Start everything
START_SERVERS.bat

# Check status
check-status.bat

# Test backend API
node test-backend-api.js

# Test database connection
cd backend
node test-connection.js

# Seed database
cd backend
node scripts/seedAdmin.js
node scripts/seedStaff.js

# Test in browser
# Open: test-login.html
```

---

## 📊 Understanding Test Results

### ✅ All Tests Pass

```
✅ Health check passed
✅ Student login successful
✅ Admin login successful
✅ Staff login successful
```

**Meaning:** Backend is working perfectly!

**Next step:** If frontend login still fails, check browser console (F12)

---

### ❌ Health Check Fails

```
❌ Health check failed
Error: connect ECONNREFUSED
```

**Meaning:** Backend is not running

**Fix:**
```bash
cd backend
npm start
```

---

### ❌ Login Fails (404)

```
❌ Student login failed
Status: 404
Message: Account not found
```

**Meaning:** User doesn't exist in database

**Fix:**
```bash
cd backend
node scripts/seedAdmin.js
node scripts/seedStaff.js
```

---

### ❌ Login Fails (401)

```
❌ Student login failed
Status: 401
Message: Incorrect password
```

**Meaning:** Wrong password

**Fix:** Use correct test credentials:
- Student: `CS2024001` / `Test@123`
- Admin: `admin` / `admin123`
- Staff: `rajesh.staff@college.edu` / `staff123`

---

### ❌ MongoDB Connection Fails

```
❌ MongoDB connection failed!
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Meaning:** MongoDB is not running

**Fix:**
```bash
net start MongoDB
```

---

## 🔍 Advanced Debugging

### Check Backend Logs

Look at Terminal 1 (backend) for error messages:

```
MongooseError: Operation buffering timed out
→ MongoDB not connected

Error: listen EADDRINUSE: address already in use :::3001
→ Port 3001 already in use

Cannot find module 'express'
→ Run: npm install
```

---

### Check Browser Console

Press F12 → Console tab:

```
Network Error
→ Backend not running

Failed to fetch
→ CORS issue or backend not running

404 Not Found
→ User doesn't exist

401 Unauthorized
→ Wrong password

500 Internal Server Error
→ Backend error (check backend terminal)
```

---

### Check Network Tab

Press F12 → Network tab → Click on failed request:

**Request URL:**
- Should be: `http://localhost:3001/api/auth/student/login`
- If different, check `frontend/src/services/api.js`

**Status:**
- 200 OK → Success
- 404 Not Found → User doesn't exist
- 401 Unauthorized → Wrong password
- 500 Internal Server Error → Backend error

**Response:**
- Should contain: `{ token: "...", user: {...} }`
- If error: `{ success: false, message: "..." }`

---

## 📞 Getting Help

If all diagnostic tools show success but login still fails, provide:

1. **Output of:**
   ```bash
   check-status.bat
   ```

2. **Output of:**
   ```bash
   node test-backend-api.js
   ```

3. **Browser console errors:**
   - Press F12
   - Go to Console tab
   - Copy all errors

4. **Network tab details:**
   - Press F12
   - Go to Network tab
   - Try to login
   - Click on failed request
   - Copy request and response

---

## ✅ Success Indicators

When everything works:

**check-status.bat:**
```
✅ MongoDB is running
✅ Backend is running
✅ Frontend is running
✅ All login tests passed
```

**test-backend-api.js:**
```
✅ Health check passed
✅ Student login successful
✅ Admin login successful
✅ Staff login successful
```

**test-login.html:**
```
✅ Backend is running!
✅ Login Successful!
Token: Received ✓
```

**Browser:**
- No errors in console
- Login redirects to dashboard
- Shows student info

---

## 🎓 Tips

1. **Always check status first:**
   ```bash
   check-status.bat
   ```

2. **Test backend before frontend:**
   ```bash
   node test-backend-api.js
   ```

3. **Use test-login.html for visual feedback:**
   - Open in browser
   - See detailed error messages

4. **Check browser console:**
   - Press F12
   - Look for errors

5. **Keep terminals open:**
   - Terminal 1: Backend
   - Terminal 2: Frontend
   - Don't close them!

---

## 🚀 You're Ready!

Use these tools to quickly diagnose and fix any issues. They'll tell you exactly what's wrong and how to fix it!

Happy coding! 🎉
