# 🚨 PRIORITY FIX: Student Complaint Visibility

## Critical Issue
**Students cannot see their complaints in "My Complaints" section**
- Complaints are created successfully
- Admin/Staff can see and update complaints
- Students cannot see their own complaints
- Status updates not visible to students

## Immediate Action Required

### Step 1: Restart Backend with Debug Logging

**Run this command:**
```bash
RESTART_WITH_DEBUG.bat
```

Or manually:
```bash
cd backend
taskkill /F /IM node.exe
npm start
```

### Step 2: Test and Monitor

1. **Watch the backend console window carefully**
2. **Login as student:**
   - Roll Number: `CS2021001`
   - Password: `password123`

3. **Create a test complaint:**
   - Title: "Test Visibility"
   - Description: "Testing if complaints show up"
   - Category: Any
   - Submit

4. **Check backend console for:**
   ```
   === VERIFY STUDENT DEBUG ===
   === CREATE COMPLAINT DEBUG ===
   ✅ Complaint created with _id: ...
   ```

5. **Go to "My Complaints" page**

6. **Check backend console for:**
   ```
   === GET MY COMPLAINTS DEBUG ===
   Found X complaints
   ```

### Step 3: Identify the Issue

The debug logs will show one of these problems:

#### Problem A: studentId is undefined
```
Extracted studentId: undefined
❌ No studentId found!
```
**Cause:** Middleware not setting req.userId
**Fix:** Token structure issue or middleware bug

#### Problem B: Found 0 complaints
```
Querying complaints with filter: { student: '67abc...' }
Found 0 complaints
```
**Cause:** Student ID mismatch between create and query
**Fix:** Database query issue

#### Problem C: Token/Auth error
```
❌ Token verification error
```
**Cause:** Invalid or expired token
**Fix:** Clear localStorage and login again

## What I've Done

### 1. Fixed Middleware (Already Applied)
- Rewrote `verifyStudent` to properly set `req.userId`
- Removed broken callback pattern
- Added comprehensive error handling

### 2. Added Debug Logging (Just Applied)
- **Middleware:** Shows token verification process
- **Create Complaint:** Shows studentId being saved
- **Get Complaints:** Shows query filter and results

### 3. Files Modified
- ✅ `backend/middleware/authMiddleware.js`
- ✅ `backend/controllers/complaintController.js`

## Debug Output Examples

### Successful Flow:

```
=== VERIFY STUDENT DEBUG ===
Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR5...
Token decoded: { userId: '67abc123def456', role: 'student' }
Set req.userId: 67abc123def456
Set req.role: student
✅ Student verified successfully

=== CREATE COMPLAINT DEBUG ===
Request body: { title: 'Test', description: '...', category: 'Infrastructure' }
req.user: undefined
req.userId: 67abc123def456
Extracted studentId: 67abc123def456
✅ Student found: John Doe CS2021001
Complaint data to save: { student: '67abc123def456', ... }
✅ Complaint created with _id: 67def456abc123
   student field: 67abc123def456

=== GET MY COMPLAINTS DEBUG ===
req.user: undefined
req.userId: 67abc123def456
req.role: student
Extracted studentId: 67abc123def456
Querying complaints with filter: { student: '67abc123def456' }
Found 3 complaints
First complaint: { id: '67def456abc123', title: 'Test', status: 'Pending' }
```

### Failed Flow (Example):

```
=== GET MY COMPLAINTS DEBUG ===
req.user: undefined
req.userId: 67abc123def456
Extracted studentId: 67abc123def456
Querying complaints with filter: { student: '67abc123def456' }
Found 0 complaints  ← PROBLEM HERE!
```

## Possible Root Causes

### 1. Student ID Mismatch
- Complaint created with one ID
- Query using different ID
- **Check:** Compare IDs in create vs get logs

### 2. Database Not Saving
- Complaint appears created but not in DB
- **Check:** `db.complaints.find()` in MongoDB

### 3. Middleware Not Working
- req.userId not being set
- **Check:** Verify Student logs show undefined

### 4. Frontend Token Issue
- Token missing or corrupted
- **Check:** Browser console localStorage

## Quick Database Check

```bash
# Open MongoDB shell
mongosh

# Switch to database
use smart_campus_db

# Count complaints
db.complaints.countDocuments()

# Show all complaints
db.complaints.find().pretty()

# Find by student ID (replace with actual ID from logs)
db.complaints.find({ student: ObjectId("67abc123def456") }).pretty()
```

## Frontend Check

Open browser console (F12):

```javascript
// Check token
const token = localStorage.getItem('token');
console.log('Token:', token);

// Decode token
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Payload:', payload);
// Should show: { userId: '...', role: 'student', ... }

// Check user
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);
```

## If Still Not Working

### Collect This Information:

1. **Backend Console Output** (copy the debug logs)
2. **Browser Console** (any errors?)
3. **Database Check** (how many complaints exist?)
4. **Token Payload** (what's in the token?)

### Share:
- Complete console output from backend
- Any error messages
- Database query results

## Expected Timeline

- **Immediate:** Restart backend with debug logging
- **5 minutes:** Test complaint creation and viewing
- **10 minutes:** Identify exact issue from logs
- **15 minutes:** Apply targeted fix based on logs

## Success Criteria

✅ Backend console shows debug logs
✅ Student can create complaint
✅ Console shows complaint saved with studentId
✅ Student can view "My Complaints"
✅ Console shows complaints found
✅ UI displays complaints list
✅ Status updates visible after admin changes

## Contact Points

If issue persists after following these steps:
1. Share backend console output
2. Share browser console errors
3. Share database query results

The debug logs will pinpoint the exact issue!

---

## IMPORTANT NOTES

1. **Debug logging is temporary** - Remove after fixing
2. **Watch console in real-time** - Don't miss the logs
3. **Test immediately** - Issue is time-sensitive
4. **Document findings** - Share what you see

## Quick Commands

```bash
# Restart with debug
RESTART_WITH_DEBUG.bat

# Check database
mongosh
use smart_campus_db
db.complaints.find().pretty()

# Test API directly
curl -X GET http://localhost:3001/api/complaints \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**This is a high-priority fix. The debug logging will reveal the exact issue within minutes of testing.**
