# 🚨 FIX LOGIN ISSUES - STEP BY STEP

## You are on React App page but login/registration not working?

Follow these steps **IN ORDER**:

---

## ✅ STEP 1: Check if MongoDB is Running

**Windows Command:**
```bash
net start MongoDB
```

**Expected Output:**
```
The MongoDB Server (MongoDB) service is starting.
The MongoDB Server (MongoDB) service was started successfully.
```

**If you get "service name is invalid":**
- MongoDB might not be installed
- Or it's installed with a different name
- Check with: `net start | findstr /i "mongo"`

**Alternative: Use MongoDB Atlas (Cloud)**
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create a cluster
4. Get connection string
5. Update `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_campus_db
```

---

## ✅ STEP 2: Start Backend Server

**Open Terminal 1:**
```bash
cd backend
npm install
npm start
```

**Expected Output:**
```
Server running in development mode on port 3001
MongoDB Connected: mongodb://localhost:27017/smart_campus_db
```

**If you see errors:**
- MongoDB connection error → Go back to Step 1
- Port already in use → Kill the process or use different port
- Module not found → Run `npm install` again

**Keep this terminal open!**

---

## ✅ STEP 3: Seed Database with Test Data

**Open Terminal 2:**
```bash
cd backend

# Seed admin account
node scripts/seedAdmin.js

# Seed staff accounts  
node scripts/seedStaff.js

# Seed subjects (for results module)
node scripts/seedSubjects.js
```

**Expected Output:**
```
✅ Admin seeded successfully
✅ Staff seeded successfully
✅ Subjects seeded successfully
```

**If you get errors:**
- Make sure MongoDB is running (Step 1)
- Make sure backend is running (Step 2)

---

## ✅ STEP 4: Test Backend API

**Option A: Use Test Script**
```bash
node test-backend-api.js
```

**Option B: Use Test HTML Page**
1. Open `test-login.html` in your browser
2. Click "Test Backend Health"
3. Click "Test Login"
4. Should see ✅ Success messages

**Option C: Use curl**
```bash
curl http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

**If backend test fails:**
- Backend is not running → Go back to Step 2
- MongoDB not connected → Go back to Step 1

---

## ✅ STEP 5: Start Frontend

**Open Terminal 3:**
```bash
cd frontend
npm install
npm start
```

**Expected Output:**
```
Compiled successfully!
webpack compiled with 0 warnings

Local: http://localhost:3000
```

**Browser should open automatically at:**
```
http://localhost:3000
```

**Keep this terminal open!**

---

## ✅ STEP 6: Test Login in Browser

**Go to:** http://localhost:3000

**Try these credentials:**

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

## 🐛 STEP 7: If Login Still Fails

### Check Browser Console

1. Press `F12` in browser
2. Go to **Console** tab
3. Try to login
4. Look for error messages

**Common Errors:**

**Error: "Network Error"**
- Backend is not running
- Check Terminal 1 (backend should be running)

**Error: "Failed to fetch"**
- CORS issue
- Check `backend/.env` has: `FRONTEND_URL=http://localhost:3000`
- Restart backend

**Error: "404 Not Found"**
- User doesn't exist in database
- Go back to Step 3 (seed database)

**Error: "401 Unauthorized"**
- Wrong password
- Try the test credentials above

**Error: "500 Internal Server Error"**
- Backend error
- Check Terminal 1 for error details

### Check Network Tab

1. Press `F12` in browser
2. Go to **Network** tab
3. Try to login
4. Click on the failed request
5. Check:
   - Request URL: Should be `http://localhost:3001/api/auth/student/login`
   - Status: Should be `200 OK`
   - Response: Should contain `token` and `user` data

---

## 📋 Quick Checklist

Before asking for help, verify:

- [ ] MongoDB is running (`net start MongoDB`)
- [ ] Backend is running on port 3001 (Terminal 1)
- [ ] Frontend is running on port 3000 (Terminal 3)
- [ ] Database is seeded (Step 3)
- [ ] Backend health check works: http://localhost:3001/api/health
- [ ] Test login page works: Open `test-login.html`
- [ ] Browser console shows no errors (F12)
- [ ] Using correct test credentials

---

## 🎯 Quick Commands Summary

**Start Everything:**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm start

# Terminal 3 - Test
node test-backend-api.js
```

**Seed Database:**
```bash
cd backend
node scripts/seedAdmin.js
node scripts/seedStaff.js
node scripts/seedSubjects.js
```

**Test Backend:**
```bash
# Option 1: Script
node test-backend-api.js

# Option 2: HTML
# Open test-login.html in browser

# Option 3: curl
curl http://localhost:3001/api/health
```

---

## 🆘 Still Not Working?

If you've followed all steps and it still doesn't work, provide me with:

1. **Backend terminal output** (copy all text from Terminal 1)
2. **Browser console errors** (F12 → Console tab → copy errors)
3. **Network tab details** (F12 → Network tab → click failed request → copy response)
4. **Output of:** `node test-backend-api.js`

I'll help you debug further!

---

## ✅ Success Indicators

When everything works correctly:

**Terminal 1 (Backend):**
```
Server running in development mode on port 3001
MongoDB Connected: mongodb://localhost:27017/smart_campus_db
```

**Terminal 3 (Frontend):**
```
Compiled successfully!
webpack compiled with 0 warnings
```

**Browser:**
- No errors in console (F12)
- Login redirects to dashboard
- Shows student name and info

**Test Script:**
```
✅ Health check passed
✅ Student login successful
✅ Admin login successful
✅ Staff login successful
```

---

## 🚀 You're All Set!

Once login works, you can access:

- **Student Dashboard:** http://localhost:3000/dashboard
- **AI Chat:** http://localhost:3000/ai-chat
- **UT Results:** http://localhost:3000/results
- **Student Corner:** http://localhost:3000/student-corner

Enjoy your Smart Campus Helpdesk! 🎓
