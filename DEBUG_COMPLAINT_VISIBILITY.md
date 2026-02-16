# Debug: Complaint Visibility Issue

## Problem
- Students create complaints successfully
- Complaints don't show in "My Complaints"
- Status updates from admin/staff not visible to students

## Debug Logging Added

I've added comprehensive debug logging to track the exact issue:

### Files Modified:
1. `backend/middleware/authMiddleware.js` - Added logging to verifyStudent
2. `backend/controllers/complaintController.js` - Added logging to createComplaint and getMyComplaints

## How to Debug

### Step 1: Restart Backend with Logging

```bash
cd backend
npm start
```

The console will now show detailed logs for every request.

### Step 2: Test Complaint Creation

1. Login as student (CS2021001 / password123)
2. Create a complaint
3. Watch the backend console

**Expected Console Output:**
```
=== VERIFY STUDENT DEBUG ===
Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR5...
Token decoded: { userId: '...', role: 'student' }
Set req.userId: 67abc123...
Set req.role: student
✅ Student verified successfully

=== CREATE COMPLAINT DEBUG ===
Request body: { title: '...', description: '...', ... }
req.user: undefined
req.userId: 67abc123...
Extracted studentId: 67abc123...
✅ Student found: John Doe CS2021001
Complaint data to save: { student: '67abc123...', ... }
✅ Complaint created with _id: 67def456...
   student field: 67abc123...
```

### Step 3: Test Viewing Complaints

1. Go to "My Complaints" page
2. Watch the backend console

**Expected Console Output:**
```
=== VERIFY STUDENT DEBUG ===
Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR5...
Token decoded: { userId: '67abc123...', role: 'student' }
Set req.userId: 67abc123...
Set req.role: student
✅ Student verified successfully

=== GET MY COMPLAINTS DEBUG ===
req.user: undefined
req.userId: 67abc123...
req.role: student
Extracted studentId: 67abc123...
Querying complaints with filter: { student: '67abc123...' }
Found 3 complaints
First complaint: { id: '67def456...', title: '...', student: {...}, status: 'Pending' }
```

## Common Issues and Solutions

### Issue 1: studentId is undefined

**Console shows:**
```
Extracted studentId: undefined
❌ No studentId found!
```

**Solution:** Middleware not setting req.userId correctly
- Check if JWT_SECRET matches in .env
- Verify token is being sent from frontend
- Check token payload structure

### Issue 2: Found 0 complaints

**Console shows:**
```
Querying complaints with filter: { student: '67abc123...' }
Found 0 complaints
```

**Possible Causes:**
1. **Student ID mismatch** - Created with different ID than querying
2. **Database issue** - Complaints not actually saved
3. **Query filter wrong** - Field name mismatch

**Debug Steps:**
```javascript
// Check what's in database
use smart_campus_db
db.complaints.find().pretty()

// Check student field
db.complaints.find({ student: ObjectId("67abc123...") })
```

### Issue 3: Role mismatch

**Console shows:**
```
❌ Role mismatch: expected 'student', got 'admin'
```

**Solution:** Wrong user logged in or token corrupted
- Clear localStorage and login again
- Verify correct credentials

### Issue 4: Token verification error

**Console shows:**
```
❌ Token verification error: jwt malformed
```

**Solution:** Invalid token
- Clear localStorage
- Login again
- Check JWT_SECRET in backend/.env

## Manual Database Check

If complaints still not showing, check database directly:

```bash
# Connect to MongoDB
mongosh

# Switch to database
use smart_campus_db

# Count total complaints
db.complaints.countDocuments()

# Find all complaints
db.complaints.find().pretty()

# Find complaints for specific student
db.complaints.find({ student: ObjectId("PASTE_STUDENT_ID_HERE") }).pretty()

# Check if student field exists
db.complaints.find({ student: { $exists: true } }).count()
```

## Frontend Debug

Open browser console (F12) and check:

```javascript
// Check if token exists
localStorage.getItem('token')

// Check user data
localStorage.getItem('user')

// Decode token manually
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);
```

## API Testing with curl

Test the API directly:

```bash
# 1. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"userType\":\"student\",\"rollNumber\":\"CS2021001\",\"password\":\"password123\"}"

# Copy the token from response

# 2. Get complaints
curl -X GET http://localhost:3001/api/complaints \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Expected vs Actual

### Expected Flow:
```
1. Student logs in → Token generated with userId
2. Student creates complaint → Saved with student: userId
3. Student views complaints → Query: { student: userId }
4. Complaints returned → Student sees their complaints
```

### If Not Working:
```
Check each step:
1. Is userId in token? → Check token payload
2. Is complaint saved with correct student field? → Check database
3. Is query using correct userId? → Check console logs
4. Is query finding complaints? → Check database query
```

## Quick Fix Checklist

- [ ] Backend server restarted
- [ ] Console shows debug logs
- [ ] Student can login successfully
- [ ] Token contains userId and role
- [ ] Complaint creation shows studentId in logs
- [ ] Complaint saved to database
- [ ] Get complaints shows correct studentId in query
- [ ] Database has complaints with matching student field
- [ ] Frontend receives complaints array
- [ ] UI displays complaints

## Next Steps

1. **Restart backend** to enable debug logging
2. **Test complaint creation** and watch console
3. **Test viewing complaints** and watch console
4. **Share console output** if issue persists

The debug logs will show exactly where the problem is occurring.
