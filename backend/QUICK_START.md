# 🚀 Quick Start Guide

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your settings (MongoDB URI, JWT Secret, etc.)

## Start Server

```bash
npm run dev
```

## Expected Console Output

```
=================================================
🚀 Smart Campus Helpdesk Server Started
=================================================
📡 Server running on port 5000
🌐 Base URL: http://localhost:5000
🔗 Health Check: http://localhost:5000/api/health
=================================================
✅ MongoDB Connected Successfully
```

## Test Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Base Route
```bash
curl http://localhost:5000/
```

## API Endpoints

### Authentication
- `POST /api/auth/student/register` - Register student
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/admin/login` - Admin login

### Complaints (Student)
- `POST /api/complaints` - Create complaint (requires auth)
- `GET /api/complaints/my` - Get own complaints (requires auth)
- `GET /api/complaints/:id` - Get single complaint (requires auth)

### Complaints (Admin)
- `GET /api/complaints` - Get all complaints (requires admin auth)
- `PATCH /api/complaints/:id` - Update complaint status (requires admin auth)

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `net start MongoDB` (Windows) or `brew services start mongodb-community` (Mac)
- Check MONGODB_URI in `.env`

### Port Already in Use
- Change PORT in `.env` to a different port (e.g., 5001)

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

## Success Indicators

✅ Server starts without errors
✅ MongoDB connects successfully
✅ Health check returns 200 OK
✅ No "Route.post() requires a callback" errors
✅ No "undefined" import errors

## Ready for Production

The backend is now running and ready to accept requests!
