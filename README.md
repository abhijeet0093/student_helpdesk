# Smart Campus Helpdesk & Student Ecosystem

A comprehensive college management system with complaint handling, authentication, and student services.

## 📁 Project Structure

```
smart-campus/
├── backend/                    # Node.js + Express Backend
│   ├── config/                # Configuration files
│   │   ├── db.js             # MongoDB connection
│   │   └── multerConfig.js   # File upload configuration
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   └── complaintController.js
│   ├── middleware/            # Express middleware
│   │   └── authMiddleware.js # JWT authentication
│   ├── models/                # MongoDB schemas
│   │   ├── Admin.js
│   │   ├── Student.js
│   │   ├── StudentMaster.js
│   │   └── Complaint.js
│   ├── routes/                # API routes
│   │   ├── authRoutes.js
│   │   └── complaintRoutes.js
│   ├── utils/                 # Helper functions
│   │   ├── tokenGenerator.js
│   │   └── nameNormalizer.js
│   ├── uploads/               # Uploaded files storage
│   │   └── complaints/
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js             # Entry point
│
├── frontend/                  # React Frontend (to be developed)
│   └── (React app structure)
│
└── MODULE_*.md               # Module documentation files
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v14 or higher)
   - Download: https://nodejs.org/

2. **MongoDB** (Community Edition)
   - Download: https://www.mongodb.com/try/download/community
   - Install and start MongoDB service

### Installation Steps

#### 1. Clone/Download Project
```bash
cd smart-campus
```

#### 2. Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start MongoDB service (Windows)
net start MongoDB

# Start the server
npm start
```

Server will run on: **http://localhost:5001**

#### 3. Verify Installation

Open browser and visit:
- Health Check: http://localhost:5001/api/health
- Should see: `{"success": true, "message": "Server is running"}`

## 📝 Environment Configuration

The `.env` file in backend folder contains:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/smart_campus_db

# JWT Secret
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## 🔌 API Endpoints

### Authentication

**Student Registration**
```
POST /api/auth/student/register
Body: {
  "rollNumber": "CS2024001",
  "enrollmentNumber": "EN2024CS001",
  "fullName": "Rahul Kumar",
  "dateOfBirth": "2003-05-15",
  "password": "MyPass@123"
}
```

**Student Login**
```
POST /api/auth/student/login
Body: {
  "rollNumber": "CS2024001",
  "password": "MyPass@123"
}
```

**Admin Login**
```
POST /api/auth/admin/login
Body: {
  "username": "admin",
  "password": "admin123"
}
```

### Complaints (Student)

**Create Complaint**
```
POST /api/complaints
Headers: Authorization: Bearer <token>
Body (FormData): {
  "category": "Infrastructure",
  "description": "Projector not working in Room 301",
  "image": <file>
}
```

**Get My Complaints**
```
GET /api/complaints/my
Headers: Authorization: Bearer <token>
```

### Complaints (Admin)

**Get All Complaints**
```
GET /api/complaints
Headers: Authorization: Bearer <admin_token>
```

**Update Complaint Status**
```
PATCH /api/complaints/:id
Headers: Authorization: Bearer <admin_token>
Body: {
  "status": "Resolved",
  "adminRemark": "Issue fixed"
}
```

## 🧪 Testing the API

### Using Postman or Thunder Client

1. **Register a Student** (requires StudentMaster data first)
2. **Login** to get JWT token
3. **Create Complaint** with the token
4. **View Complaints** with the token

### Sample Admin Account

To create an admin account, you can use MongoDB Compass or mongosh:

```javascript
use smart_campus_db

db.admins.insertOne({
  username: "admin",
  email: "admin@college.edu",
  password: "$2a$10$YourHashedPasswordHere",
  role: "admin",
  isActive: true,
  loginAttempts: 0,
  createdAt: new Date()
})
```

Or use the registration endpoint after modifying the code temporarily.

## 📦 Dependencies

### Backend
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **multer** - File upload handling
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

## 🛠️ Development

### Start Development Server (with auto-reload)
```bash
cd backend
npm run dev
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 📚 Module Documentation

- **MODULE_1_ARCHITECTURE.md** - System architecture overview
- **MODULE_2_AUTHENTICATION.md** - Authentication system details
- **MODULE_3_COMPLAINT_SYSTEM.md** - Complaint management details
- **MODULE_4_ADMIN_STAFF_DASHBOARD.md** - Admin dashboard specs
- **MODULE_5_STUDENT_DASHBOARD_CORNER.md** - Student features
- **MODULE_6_AI_STUDENT_ASSISTANT.md** - AI assistant specs
- **MODULE_7_UT_RESULT_ANALYSIS.md** - Result analysis specs

## 🐛 Troubleshooting

### Port Already in Use
If port 5001 is busy, change PORT in `.env` file:
```env
PORT=5002
```

### MongoDB Connection Failed
1. Ensure MongoDB service is running:
   ```bash
   net start MongoDB
   ```
2. Check MongoDB is listening on port 27017
3. Verify connection string in `.env`

### Module Not Found Errors
```bash
cd backend
npm install
```

## 🔐 Security Notes

- Change `JWT_SECRET` in production
- Never commit `.env` file to git
- Use strong passwords for admin accounts
- Implement rate limiting for production

## 📞 Support

For issues or questions, refer to the module documentation files.

## 📄 License

ISC
