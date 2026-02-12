# 🚨 Quick Fix Guide - Login Not Working

## Run This First!

### Step 1: Test Your Setup

```bash
cd backend
node test-connection.js
```

This will tell you exactly what's wrong!

---

## Most Common Issues & Instant Fixes

### ❌ Issue: MongoDB Not Connected

**You'll see:**
```
❌ MongoDB connection failed!
```

**Quick Fix:**

**Windows:**
```bash
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

**Don't have MongoDB installed?**
Use MongoDB Atlas (free cloud database):
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create a cluster (choose free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_campus_db
```

---

### ❌ Issue: No Admin/Students in Database

**You'll see:**
```
⚠️ No collections found. Database is empty!
```

**Quick Fix:**
```bash
cd backend

# Seed admin
node scripts/seedAdmin.js

# Seed staff
node scripts/seedStaff.js

# Seed subjects
node scripts/seedSubjects.js
```

**Expected output:**
```
✅ Admin seeded successfully
✅ Staff seeded successfully
✅ Subjects seeded successfully
```

---

### ❌ Issue: Backend Not Running

**Quick Fix:**
```bash
cd backend
npm install
npm start
```

**You should see:**
```
Server running in development mode on port 3001
MongoDB Connected: ...
```

---

### ❌ Issue: Frontend Not Running

**Quick Fix:**
```bash
cd frontend
npm install
npm start
```

**Browser should open automatically at:**
```
http://localhost:3000
```

---

## ✅ Complete Fresh Start (If Nothing Works)

Run these commands in order:

```bash
# 1. Stop everything (Ctrl+C in all terminals)

# 2. Start MongoDB
# Windows:
net start MongoDB

# 3. Backend setup
cd backend
npm install
node test-connection.js
node scripts/seedAdmin.js
node scripts/seedStaff.js
npm start

# 4. Open NEW terminal for frontend
cd frontend
npm install
npm start

# 5. Open browser
# Go to: http://localhost:3000
```

---

## 🧪 Test Login

After setup, try these credentials:

**Student:**
- Roll Number: `CS2024001`
- Password: `Test@123`

**Admin:**
- Username: `admin`
- Password: `admin123`

---

## 🔍 Check Browser Console

If login still fails:

1. Press `F12` in browser
2. Go to **Console** tab
3. Try to login
4. Copy any error messages
5. Share them with me!

---

## 📞 Need More Help?

Run this and share the output:

```bash
cd backend
node test-connection.js
```

Also share:
1. Backend terminal output
2. Browser console errors (F12 → Console)
3. What happens when you click Login

I'll help you fix it! 🚀
