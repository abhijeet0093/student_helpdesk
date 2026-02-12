# 🚀 Complete Setup Guide - Smart Campus Helpdesk

## Step-by-Step Installation

### Step 1: Install Prerequisites

#### 1.1 Install Node.js
1. Download Node.js from: https://nodejs.org/
2. Choose LTS version (recommended)
3. Run installer and follow instructions
4. Verify installation:
```bash
node --version
npm --version
```

#### 1.2 Install MongoDB
1. Download MongoDB Community Edition: https://www.mongodb.com/try/download/community
2. Run installer (choose "Complete" installation)
3. Install as Windows Service (check the box)
4. Install MongoDB Compass (optional GUI tool)
5. Verify installation:
```bash
mongosh --version
```

### Step 2: Setup Project

#### 2.1 Navigate to Project
```bash
cd smart-campus
```

#### 2.2 Install Backend Dependencies
```bash
cd backend
npm install
```

This will install:
- express (web framework)
- mongoose (MongoDB driver)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- multer (file uploads)
- cors (cross-origin requests)
- dotenv (environment variables)

### Step 3: Start MongoDB

#### Windows:
```bash
net start MongoDB
```

#### Mac/Linux:
```bash
sudo systemctl start mongod
```

#### Verify MongoDB is Running:
```bash
mongosh
# Should connect successfully
# Type 'exit' to quit
```

### Step 4: Seed Initial Data

#### 4.1 Create Admin Account
```bash
npm run seed:admin
```

Output:
```
✅ Admin account created successfully!
Username: admin
Password: admin123
Email: admin@college.edu
```

#### 4.2 Create Sample Students
```bash
npm run seed:students
```

Output:
```
✅ Student master data seeded successfully!
3 students added:
- CS2024001 | RAHUL KUMAR SHARMA | Computer Science
- CS2024002 | PRIYA SINGH | Computer Science
- ME2024001 | AMIT PATEL | Mechanical Engineering
```

### Step 5: Start Backend Server

#### Option A: Using Batch File (Windows)
Double-click `start-backend.bat` in the root folder

#### Option B: Using Command Line
```bash
cd backend
npm start
```

#### Option C: Development Mode (auto-reload)
```bash
cd backend
npm run dev
```

### Step 6: Verify Installation

#### 6.1 Check Server is Running
Open browser and visit: http://localhost:5001/api/health

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-02-08T10:00:00.000Z"
}
```

#### 6.2 Test Admin Login
Use Postman, Thunder Client, or curl:

```bash
curl -X POST http://localhost:5001/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "admin",
    "email": "admin@college.edu",
    "role": "admin"
  }
}
```

### Step 7: Test Student Registration

#### 7.1 Register a Student
```bash
curl -X POST http://localhost:5001/api/auth/student/register \
  -H "Content-Type: application/json" \
  -d "{
    \"rollNumber\": \"CS2024001\",
    \"enrollmentNumber\": \"EN2024CS001\",
    \"fullName\": \"RAHUL KUMAR SHARMA\",
    \"dateOfBirth\": \"2003-05-15\",
    \"password\": \"Test@123\"
  }"
```

#### 7.2 Login as Student
```bash
curl -X POST http://localhost:5001/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d "{
    \"rollNumber\": \"CS2024001\",
    \"password\": \"Test@123\"
  }"
```

Save the token from response for next steps.

### Step 8: Test Complaint System

#### 8.1 Create a Complaint (Student)
```bash
curl -X POST http://localhost:5001/api/complaints \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"category\": \"Infrastructure\",
    \"description\": \"The projector in Room 301 is not working properly. It keeps flickering.\"
  }"
```

#### 8.2 View My Complaints (Student)
```bash
curl http://localhost:5001/api/complaints/my \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

#### 8.3 View All Complaints (Admin)
```bash
curl http://localhost:5001/api/complaints \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### 8.4 Update Complaint Status (Admin)
```bash
curl -X PATCH http://localhost:5001/api/complaints/CMP2024001 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"Resolved\",
    \"adminRemark\": \"Projector has been repaired\"
  }"
```

## 📁 Project Structure Overview

```
smart-campus/
├── backend/
│   ├── config/              # Configuration
│   │   ├── db.js           # MongoDB connection
│   │   └── multerConfig.js # File upload config
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   └── complaintController.js
│   ├── middleware/          # Express middleware
│   │   └── authMiddleware.js
│   ├── models/              # Database schemas
│   │   ├── Admin.js
│   │   ├── Student.js
│   │   ├── StudentMaster.js
│   │   └── Complaint.js
│   ├── routes/              # API endpoints
│   │   ├── authRoutes.js
│   │   └── complaintRoutes.js
│   ├── scripts/             # Utility scripts
│   │   ├── seedAdmin.js
│   │   └── seedStudentMaster.js
│   ├── utils/               # Helper functions
│   │   ├── tokenGenerator.js
│   │   └── nameNormalizer.js
│   ├── uploads/             # File storage
│   │   └── complaints/
│   ├── .env                 # Environment variables
│   ├── package.json         # Dependencies
│   └── server.js           # Entry point
│
├── start-backend.bat        # Quick start script
└── README.md               # Documentation
```

## 🔧 Configuration Files

### backend/.env
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart_campus_db
JWT_SECRET=your_jwt_secret_key_change_this_in_production
FRONTEND_URL=http://localhost:3000
```

## 🧪 Testing with VS Code REST Client

If you have REST Client extension in VS Code:

1. Open `backend/test-api.http`
2. Click "Send Request" above each endpoint
3. View responses inline

## 🐛 Troubleshooting

### Problem: Port 5001 already in use
**Solution:** Change PORT in `.env` file to 5002 or another available port

### Problem: MongoDB connection failed
**Solution:**
1. Check MongoDB service is running: `net start MongoDB`
2. Verify MongoDB is on port 27017
3. Try connecting with MongoDB Compass to test

### Problem: Module not found errors
**Solution:**
```bash
cd backend
rm -rf node_modules
npm install
```

### Problem: Cannot register student
**Solution:** Make sure you've run the seed script:
```bash
npm run seed:students
```

### Problem: JWT token expired
**Solution:** Login again to get a new token

### Problem: File upload fails
**Solution:** Check that `uploads/complaints` folder exists and has write permissions

## 📊 Database Collections

After running the application, MongoDB will have these collections:

- **admins** - Admin user accounts
- **students** - Student user accounts
- **studentmasters** - Official student records (source of truth)
- **complaints** - Complaint records with status tracking

## 🔐 Default Credentials

### Admin Account
- Username: `admin`
- Password: `admin123`
- Email: `admin@college.edu`

### Sample Students (for registration)
1. **Student 1:**
   - Roll Number: `CS2024001`
   - Enrollment: `EN2024CS001`
   - Name: `RAHUL KUMAR SHARMA`
   - DOB: `2003-05-15`
   - Password: (set during registration)

2. **Student 2:**
   - Roll Number: `CS2024002`
   - Enrollment: `EN2024CS002`
   - Name: `PRIYA SINGH`
   - DOB: `2003-08-20`
   - Password: (set during registration)

## 📝 Available NPM Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server (auto-reload)
npm run seed:admin     # Create admin account
npm run seed:students  # Create sample student master data
npm run seed:all       # Run both seed scripts
```

## 🎯 Next Steps

1. ✅ Backend is running
2. ✅ Database is connected
3. ✅ Admin account created
4. ✅ Sample students added
5. 🔄 Test all API endpoints
6. 🔄 Develop frontend (React)
7. 🔄 Implement remaining modules

## 📞 Support

If you encounter any issues:
1. Check this guide carefully
2. Review error messages in console
3. Check MongoDB logs
4. Verify all prerequisites are installed

## 🎉 Success Checklist

- [ ] Node.js installed
- [ ] MongoDB installed and running
- [ ] Backend dependencies installed
- [ ] Admin account created
- [ ] Sample students seeded
- [ ] Server starts without errors
- [ ] Health check endpoint works
- [ ] Admin login works
- [ ] Student registration works
- [ ] Complaint creation works

If all items are checked, your setup is complete! 🚀
