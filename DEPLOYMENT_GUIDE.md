# 🚀 DEPLOYMENT GUIDE

**Smart Campus Helpdesk & Student Ecosystem**  
**Version**: 1.0.0  
**Status**: Production-Ready ✅

---

## ⚡ QUICK START (5 Minutes)

### Step 1: Start MongoDB
```bash
# Windows: Check Services for "MongoDB" or run:
mongod

# Verify connection:
mongo
# Should connect without errors
```

### Step 2: Seed Database (First Time Only)
```bash
# Navigate to backend
cd backend

# Seed admin account
node scripts/seedAdmin.js

# Seed staff account
node scripts/seedStaff.js

# (Optional) Seed subjects for UT Results
node scripts/seedSubjects.js
```

### Step 3: Start Backend Server
```bash
# In backend directory
npm install  # First time only
npm start

# Wait for:
# ✅ MongoDB Connected Successfully
# 🚀 Smart Campus Helpdesk Server Started
# 📡 Server running on port 3001
```

### Step 4: Start Frontend
```bash
# Open new terminal
cd frontend

npm install  # First time only
npm start

# Browser opens automatically at http://localhost:3000
```

### Step 5: Test Login
1. Go to: `http://localhost:3000/login`
2. **Admin Login**:
   - Username: `admin`
   - Password: `admin123`
3. **Staff Login**:
   - Email: `rajesh.staff@college.edu`
   - Password: `staff123`
4. **Student**: Register new student first

---

## 📋 DETAILED DEPLOYMENT

### Prerequisites

- **Node.js**: v14+ installed
- **MongoDB**: v4+ installed and running
- **npm**: v6+ installed
- **Git**: (optional) for version control

### Environment Configuration

#### Backend `.env` File
Location: `backend/.env`

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/smart_campus_db

# JWT Secret
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

**Important**: Change `JWT_SECRET` in production!

#### Frontend Configuration
Location: `frontend/src/services/api.js`

```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

For production, change to your server URL.

---

## 🗄️ DATABASE SETUP

### Initial Seed Data

Run these scripts in order:

```bash
cd backend

# 1. Create admin account
node scripts/seedAdmin.js
# Creates: username: admin, password: admin123

# 2. Create staff account
node scripts/seedStaff.js
# Creates: email: rajesh.staff@college.edu, password: staff123

# 3. (Optional) Create subjects for UT Results
node scripts/seedSubjects.js
# Creates: Sample subjects with codes

# 4. (Optional) Create student master data
node scripts/seedStudentMaster.js
# Creates: Reference data for student registration
```

### Verify Seed Data

```bash
# Connect to MongoDB
mongo

# Switch to database
use smart_campus_db

# Check collections
db.admins.find().pretty()
db.staffs.find().pretty()
db.subjects.find().pretty()
```

---

## 🔧 TROUBLESHOOTING

### MongoDB Connection Error

**Error**: `MongoNetworkError: connect ECONNREFUSED`

**Solution**:
```bash
# Windows: Start MongoDB service
net start MongoDB

# Or check Services app for "MongoDB"
```

### Port Already in Use

**Error**: `Port 3001 is already in use`

**Solution**:
```bash
# Find process using port
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F

# Or change PORT in backend/.env
```

### Frontend Can't Connect to Backend

**Error**: `Network Error` or `CORS Error`

**Solution**:
1. Verify backend is running on port 3001
2. Check `frontend/src/services/api.js` has correct URL
3. Verify CORS is enabled in `backend/server.js`

### Student Registration Fails

**Error**: `Password must be at least 8 characters long`

**Solution**: Use password with 8+ characters (e.g., `student123`)

### Dashboard Shows "Route not found"

**Solution**: Restart backend server (routes were recently fixed)

---

## 🧪 TESTING AFTER DEPLOYMENT

### 1. Test Authentication

**Admin Login**:
```
URL: http://localhost:3000/login
Username: admin
Password: admin123
Expected: Redirect to /admin/complaints
```

**Staff Login**:
```
URL: http://localhost:3000/login
Email: rajesh.staff@college.edu
Password: staff123
Expected: Redirect to /staff/complaints
```

**Student Registration**:
```
URL: http://localhost:3000/register
Roll Number: CS2024999
Enrollment: EN2024999
Full Name: Test Student
Date of Birth: 2003-01-01
Password: student123
Expected: Success, redirect to dashboard
```

### 2. Test Student Features

After student login:
- ✅ Dashboard loads
- ✅ Can raise complaint
- ✅ Can view Student Corner
- ✅ Can search UT Results
- ✅ AI Chat shows "coming soon"

### 3. Test Admin Features

After admin login:
- ✅ Can view all complaints
- ✅ Can assign complaints to staff
- ✅ Can update complaint status

### 4. Test Staff Features

After staff login:
- ✅ Can view assigned complaints
- ✅ Can update complaint status

---

## 🌐 PRODUCTION DEPLOYMENT

### For College Server

1. **Update Environment Variables**:
   ```env
   # backend/.env
   PORT=3001
   NODE_ENV=production
   MONGODB_URI=mongodb://your-server-ip:27017/smart_campus_db
   JWT_SECRET=<generate-strong-secret>
   FRONTEND_URL=http://your-college-server-ip:3000
   ```

2. **Update Frontend API URL**:
   ```javascript
   // frontend/src/services/api.js
   const API_BASE_URL = 'http://your-college-server-ip:3001/api';
   ```

3. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   # Creates optimized production build in /build
   ```

4. **Deploy**:
   - Copy `backend/` folder to server
   - Copy `frontend/build/` folder to server
   - Install dependencies: `npm install --production`
   - Start backend: `npm start`
   - Serve frontend with nginx or Apache

### Security Checklist for Production

- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure firewall rules
- [ ] Set up MongoDB authentication
- [ ] Enable rate limiting
- [ ] Set up logging
- [ ] Configure backup strategy
- [ ] Set up monitoring

---

## 📊 MONITORING

### Backend Logs

```bash
# View server logs
cd backend
npm start

# Logs show:
# - API requests
# - Database queries
# - Errors and warnings
```

### Database Monitoring

```bash
# Connect to MongoDB
mongo

# Check database stats
use smart_campus_db
db.stats()

# Check collection counts
db.students.count()
db.complaints.count()
db.posts.count()
```

### Performance Monitoring

- Monitor API response times
- Check database query performance
- Monitor memory usage
- Track error rates

---

## 🔄 UPDATES & MAINTENANCE

### Regular Maintenance

1. **Database Backup** (Weekly):
   ```bash
   mongodump --db smart_campus_db --out backup/
   ```

2. **Clear Old Data** (Monthly):
   ```bash
   # Clear old complaints (optional)
   # Clear old posts (optional)
   ```

3. **Update Dependencies** (Monthly):
   ```bash
   cd backend
   npm update
   
   cd ../frontend
   npm update
   ```

### Adding New Features

1. Create feature branch
2. Implement and test locally
3. Update documentation
4. Deploy to staging
5. Test thoroughly
6. Deploy to production

---

## 📞 SUPPORT

### Common Issues

| Issue | Solution |
|-------|----------|
| Can't login | Check credentials, verify user exists in DB |
| Dashboard error | Restart backend server |
| MongoDB error | Ensure MongoDB service is running |
| Port conflict | Change PORT in .env or kill process |
| CORS error | Check FRONTEND_URL in backend .env |

### Getting Help

1. Check `TROUBLESHOOTING_LOGIN.md`
2. Check `FINAL_ACCEPTANCE_REPORT.md`
3. Review error logs in backend console
4. Check browser console for frontend errors

---

## ✅ DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] MongoDB installed and running
- [ ] Node.js and npm installed
- [ ] Environment variables configured
- [ ] Seed scripts executed
- [ ] Test credentials verified

### Deployment
- [ ] Backend dependencies installed
- [ ] Backend server starts without errors
- [ ] Frontend dependencies installed
- [ ] Frontend builds successfully
- [ ] Frontend connects to backend

### Post-Deployment
- [ ] Admin login works
- [ ] Staff login works
- [ ] Student registration works
- [ ] Student login works
- [ ] All features accessible
- [ ] No console errors
- [ ] Performance acceptable

### Production Only
- [ ] JWT_SECRET changed
- [ ] HTTPS enabled
- [ ] Firewall configured
- [ ] MongoDB secured
- [ ] Backups configured
- [ ] Monitoring set up

---

## 🎉 SUCCESS!

If all steps completed successfully:

✅ Backend running on `http://localhost:3001`  
✅ Frontend running on `http://localhost:3000`  
✅ MongoDB connected  
✅ Seed data loaded  
✅ All features accessible  

**System is ready for use!**

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: February 10, 2026  
**Status**: ✅ Production-Ready
