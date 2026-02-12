# Login & Registration Troubleshooting Guide

## 🔍 Step-by-Step Debugging

### Step 1: Check if Backend is Running

Open your backend terminal and verify you see:
```
Server running in development mode on port 3001
MongoDB Connected: ...
```

If you don't see this, the backend isn't running properly.

**Fix:**
```bash
cd backend
npm start
```

---

### Step 2: Check if MongoDB is Connected

**Check the backend terminal output:**
- ✅ Should see: `MongoDB Connected: mongodb://localhost:27017/smart_campus_db`
- ❌ If you see connection errors, MongoDB isn't running

**Fix for MongoDB not running:**

**Windows:**
```bash
# Start MongoDB service
net start MongoDB
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Alternative: Use MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Update `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_campus_db
```

---

### Step 3: Seed the Database with Test Data

The database needs initial data (admin, staff, students).

**Run these commands:**
```bash
cd backend

# Seed admin account
node scripts/seedAdmin.js

# Seed staff accounts
node scripts/seedStaff.js

# Seed subjects (for results)
node scripts/seedSubjects.js
```

**Expected output:**
```
Admin seeded successfully
Staff seeded successfully
Subjects seeded successfully
```

---

### Step 4: Test Backend API Directly

Open a new terminal and test if the backend is responding:

**Test health check:**
```bash
curl http://localhost:3001/api/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-02-08T..."
}
```

**Test student registration:**
```bash
curl -X POST http://localhost:3001/api/auth/student/register ^
  -H "Content-Type: application/json" ^
  -d "{\"rollNumber\":\"TEST001\",\"enrollmentNumber\":\"EN001\",\"fullName\":\"Test Student\",\"dateOfBirth\":\"2000-01-01\",\"password\":\"Test@123\"}"
```

**Test student login:**
```bash
curl -X POST http://localhost:3001/api/auth/student/login ^
  -H "Content-Type: application/json" ^
  -d "{\"rollNumber\":\"CS2024001\",\"password\":\"Test@123\"}"
```

If these work, backend is fine. If not, there's a backend issue.

---

### Step 5: Check Frontend Console for Errors

1. Open your browser (Chrome/Firefox)
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Try to login
5. Look for error messages

**Common errors and fixes:**

**Error: "Network Error" or "Failed to fetch"**
- Backend is not running
- Wrong backend URL
- CORS issue

**Fix:**
```javascript
// Check frontend/src/services/api.js
// Make sure baseURL is correct:
const API_BASE_URL = 'http://localhost:3001/api';
```

**Error: "401 Unauthorized"**
- Wrong credentials
- User doesn't exist in database

**Fix:**
- Make sure you seeded the database
- Use correct test credentials

**Error: "500 Internal Server Error"**
- Backend error
- Check backend terminal for error details

---

### Step 6: Check Network Tab

In browser Developer Tools:
1. Go to **Network** tab
2. Try to login
3. Look for the login request
4. Click on it to see details

**Check:**
- Request URL: Should be `http://localhost:3001/api/auth/student/login`
- Status: Should be `200 OK` (if successful)
- Response: Should contain `token` and `student` data

---

### Step 7: Verify Frontend is Running

**Check frontend terminal:**
```
Compiled successfully!
webpack compiled with 0 warnings
```

**Open browser:**
```
http://localhost:3000
```

You should see the login page.

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot POST /api/auth/student/login"

**Cause:** Backend routes not configured properly

**Fix:**
```bash
cd backend
# Check if authRoutes.js exists
ls routes/authRoutes.js

# If missing, the route file is not created
```

---

### Issue 2: "CORS Error"

**Cause:** Frontend and backend on different origins

**Fix in backend/server.js:**
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

### Issue 3: "MongooseError: Operation buffering timed out"

**Cause:** MongoDB not connected

**Fix:**
1. Start MongoDB service
2. Or use MongoDB Atlas cloud database

---

### Issue 4: "Invalid credentials"

**Cause:** User doesn't exist or wrong password

**Fix:**
1. Seed the database:
```bash
cd backend
node scripts/seedAdmin.js
```

2. Or register a new student first

---

### Issue 5: Registration not working

**Cause:** Validation errors or duplicate user

**Check backend terminal for error message**

**Common fixes:**
- Use unique roll number
- Password must be at least 6 characters
- All fields are required

---

## 🧪 Test Credentials

After seeding the database, use these:

**Student:**
- Roll Number: `CS2024001`
- Password: `Test@123`

**Admin:**
- Username: `admin`
- Password: `admin123`

**Staff:**
- Email: `rajesh.staff@college.edu`
- Password: `staff123`

---

## 📋 Complete Checklist

Run through this checklist:

- [ ] MongoDB is running
- [ ] Backend server is running on port 3001
- [ ] Frontend server is running on port 3000
- [ ] Database is seeded with test data
- [ ] Backend health check works: `http://localhost:3001/api/health`
- [ ] Frontend loads: `http://localhost:3000`
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls

---

## 🔧 Quick Fix Commands

**Restart everything:**
```bash
# Terminal 1 - Stop and restart backend
cd backend
# Press Ctrl+C to stop
npm start

# Terminal 2 - Stop and restart frontend
cd frontend
# Press Ctrl+C to stop
npm start
```

**Reseed database:**
```bash
cd backend
node scripts/seedAdmin.js
node scripts/seedStaff.js
```

**Clear browser cache:**
- Press `Ctrl + Shift + Delete`
- Clear cookies and cache
- Reload page

---

## 📞 Still Not Working?

If login still doesn't work, provide me with:

1. **Backend terminal output** (copy the error messages)
2. **Frontend browser console errors** (F12 → Console tab)
3. **Network tab details** (F12 → Network tab → Click on failed request)

I'll help you debug further!

---

## ✅ Success Indicators

When everything works, you should see:

**Backend terminal:**
```
Server running in development mode on port 3001
MongoDB Connected: mongodb://localhost:27017/smart_campus_db
```

**Frontend browser console:**
```
(No errors)
```

**After login:**
- Redirects to `/dashboard`
- Shows student name and info
- No error messages

---

## 🎯 Quick Test Script

Create a file `test-login.js` in backend folder:

```javascript
const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/student/login', {
      rollNumber: 'CS2024001',
      password: 'Test@123'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', response.data.token);
    console.log('Student:', response.data.student.fullName);
  } catch (error) {
    console.log('❌ Login failed!');
    console.log('Error:', error.response?.data?.message || error.message);
  }
}

testLogin();
```

Run it:
```bash
cd backend
node test-login.js
```

This will tell you if the backend login is working.
