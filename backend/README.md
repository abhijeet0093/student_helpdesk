# Backend - Smart Campus Helpdesk

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file (already exists) with:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart_campus_db
JWT_SECRET=your_jwt_secret_key_change_this_in_production
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### 4. Run Server
```bash
# Production mode
npm start

# Development mode (auto-reload)
npm run dev
```

## API Testing

### Health Check
```bash
curl http://localhost:5001/api/health
```

### Student Registration
```bash
curl -X POST http://localhost:5001/api/auth/student/register \
  -H "Content-Type: application/json" \
  -d '{
    "rollNumber": "CS2024001",
    "enrollmentNumber": "EN2024CS001",
    "fullName": "Test Student",
    "dateOfBirth": "2003-05-15",
    "password": "Test@123"
  }'
```

## Folder Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # MongoDB schemas
├── routes/          # API routes
├── utils/           # Helper functions
├── uploads/         # File storage
└── server.js        # Entry point
```

## Available Endpoints

### Authentication
- POST `/api/auth/student/register` - Student registration
- POST `/api/auth/student/login` - Student login
- POST `/api/auth/admin/login` - Admin login

### Complaints (Student)
- POST `/api/complaints` - Create complaint
- GET `/api/complaints/my` - Get my complaints
- GET `/api/complaints/:id` - Get complaint details

### Complaints (Admin)
- GET `/api/complaints` - Get all complaints
- PATCH `/api/complaints/:id` - Update complaint status

## Database Collections

- `students` - Student user accounts
- `admins` - Admin accounts
- `studentmasters` - Official student records
- `complaints` - Complaint records
