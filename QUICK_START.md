# ⚡ Quick Start Guide

## 🎯 Get Running in 5 Minutes

### Step 1: Start MongoDB (30 seconds)
```bash
net start MongoDB
```

### Step 2: Install Dependencies (2 minutes)
```bash
cd backend
npm install
```

### Step 3: Seed Database (30 seconds)
```bash
npm run seed:admin
npm run seed:students
```

### Step 4: Start Server (10 seconds)
```bash
npm start
```

### Step 5: Test (1 minute)
Open browser: **http://localhost:3001/api/health**

Should see:
```json
{
  "success": true,
  "message": "Server is running"
}
```

## ✅ You're Done!

Server is running on: **http://localhost:3001**

## 🔑 Default Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

**Test Students (for registration):**
- Roll: `CS2024001`, Enrollment: `EN2024CS001`, Name: `RAHUL KUMAR SHARMA`, DOB: `2003-05-15`
- Roll: `CS2024002`, Enrollment: `EN2024CS002`, Name: `PRIYA SINGH`, DOB: `2003-08-20`

## 📡 API Endpoints

### Test Admin Login
```bash
POST http://localhost:3001/api/auth/admin/login
Body: {"username": "admin", "password": "admin123"}
```

### Register Student
```bash
POST http://localhost:3001/api/auth/student/register
Body: {
  "rollNumber": "CS2024001",
  "enrollmentNumber": "EN2024CS001",
  "fullName": "RAHUL KUMAR SHARMA",
  "dateOfBirth": "2003-05-15",
  "password": "Test@123"
}
```

### Login Student
```bash
POST http://localhost:3001/api/auth/student/login
Body: {"rollNumber": "CS2024001", "password": "Test@123"}
```

### Create Complaint (use token from login)
```bash
POST http://localhost:3001/api/complaints
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
  "category": "Infrastructure",
  "description": "Projector not working in Room 301"
}
```

## 🛠️ Useful Commands

```bash
npm start          # Start server
npm run dev        # Start with auto-reload
npm run seed:admin # Create admin account
npm run seed:students # Create sample students
```

## 🐛 Troubleshooting

**Port in use?**
Change PORT in `backend/.env` to another number (e.g., 3002)

**MongoDB not running?**
```bash
net start MongoDB
```

**Dependencies missing?**
```bash
cd backend
npm install
```

## 📚 Full Documentation

- **SETUP_GUIDE.md** - Complete setup instructions
- **FOLDER_STRUCTURE.md** - Project structure explained
- **README.md** - Full project documentation
- **backend/README.md** - Backend API documentation

## 🎉 Next Steps

1. ✅ Server running
2. Test API endpoints with Postman/Thunder Client
3. Use `backend/test-api.http` for quick testing
4. Build frontend (React)
5. Implement remaining modules

---

**Need help?** Check SETUP_GUIDE.md for detailed instructions.
