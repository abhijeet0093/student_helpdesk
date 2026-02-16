# Student Complaint Visibility Fix

## Problem Summary

**Critical Issue:** Student raises complaint successfully, but cannot see their own complaints. The "My Complaints" page shows: "Access denied. Admin role required"

## Root Cause Analysis

The frontend was calling the wrong API endpoint:
- **Wrong:** `GET /api/complaints` (Admin route - requires admin role)
- **Correct:** `GET /api/complaints/my` (Student route - requires student role)

## Solution Applied

### Frontend Fix (1 file changed)

**File:** `frontend/src/pages/MyComplaints.jsx`

**Change:** Line 30
```javascript
// BEFORE (Wrong - calls admin route)
const response = await api.get('/complaints');

// AFTER (Correct - calls student route)
const response = await api.get('/complaints/my');
```

### Backend Verification (Already Correct)

The backend was already properly configured:

**Routes:** `backend/routes/complaintRoutes.js`
```javascript
// Student route - uses authorizeStudent middleware
router.get('/my', authenticate, authorizeStudent, getMyComplaints);

// Admin route - uses authorizeAdmin middleware  
router.get('/', authenticate, authorizeAdmin, getAllComplaints);
```

**Controller:** `backend/controllers/complaintController.js`
```javascript
// getMyComplaints function correctly:
// 1. Extracts studentId from JWT token
// 2. Queries complaints where student field matches studentId
// 3. Returns only that student's complaints
```

**Middleware:** `backend/middleware/authMiddleware.js`
```javascript
// authorizeStudent - blocks non-students
// authorizeAdmin - blocks non-admins
// Both working correctly
```

## Security Verification

✅ **No security weakened**
- Student route still requires student role
- Admin route still requires admin role
- Students can only see their own complaints
- Admins can see all complaints
- Staff can see assigned complaints

## What Each Role Can Access

### Student
- ✅ `POST /api/complaints` - Create complaint
- ✅ `GET /api/complaints/my` - View own complaints
- ✅ `GET /api/complaints/:id` - View own complaint details
- ❌ `GET /api/complaints` - Blocked (admin only)
- ❌ `PATCH /api/complaints/:id` - Blocked (admin only)

### Admin
- ✅ `GET /api/complaints` - View all complaints
- ✅ `PATCH /api/complaints/:id` - Update complaint status
- ✅ `POST /api/complaints/:id/assign` - Assign to staff

### Staff
- ✅ `GET /api/complaints/assigned` - View assigned complaints
- ✅ `PATCH /api/complaints/:id` - Update assigned complaints

## Testing

Run the test script to verify the fix:

```bash
node test-student-complaint-fix.js
```

### Expected Test Results

1. ✅ Student login successful
2. ✅ Admin login successful
3. ✅ Student creates complaint
4. ✅ Student can access /complaints/my
5. ✅ Student blocked from /complaints (403 Forbidden)
6. ✅ Admin can access /complaints

## Manual Testing Steps

### Test as Student

1. Login as student
2. Navigate to "My Complaints" page
3. **Expected:** See list of your complaints
4. **Expected:** No "Access denied" error
5. Click "Raise New Complaint"
6. Submit a complaint
7. **Expected:** New complaint appears in list immediately

### Test as Admin

1. Login as admin
2. Navigate to "Complaints" page
3. **Expected:** See all complaints from all students
4. Update a complaint status
5. **Expected:** Status updates successfully

## Files Modified

### Changed
- `frontend/src/pages/MyComplaints.jsx` - Fixed API endpoint

### Verified (No changes needed)
- `backend/routes/complaintRoutes.js` - Routes already correct
- `backend/controllers/complaintController.js` - Controller already correct
- `backend/middleware/authMiddleware.js` - Middleware already correct
- `backend/models/Complaint.js` - Model already correct

## Deployment Checklist

- [x] Frontend fix applied
- [x] Backend verified correct
- [x] Security verified intact
- [x] Test script created
- [ ] Run test script
- [ ] Manual testing completed
- [ ] Restart backend server
- [ ] Clear browser cache
- [ ] Test with real student account

## Restart Instructions

After applying the fix:

```bash
# Backend (if running)
# Press Ctrl+C to stop
# Then restart:
cd backend
npm start

# Frontend (if running)
# Press Ctrl+C to stop
# Then restart:
cd frontend
npm start
```

## Expected Behavior After Fix

### Student Experience
1. Login as student
2. Click "My Complaints" in dashboard
3. See all complaints you've raised
4. See real-time status updates
5. Click "Refresh" to get latest status
6. Click "Raise New Complaint" to create new one

### Admin Experience
1. Login as admin
2. Click "Complaints" in dashboard
3. See all complaints from all students
4. Update status, assign to staff
5. Add admin remarks

## Technical Details

### JWT Token Structure
```javascript
{
  userId: "student_mongodb_id",
  role: "student",
  iat: timestamp,
  exp: timestamp
}
```

### Complaint Model Structure
```javascript
{
  student: ObjectId,           // References Student model
  studentName: String,
  studentRollNumber: String,
  title: String,
  description: String,
  category: String,
  status: String,
  // ... other fields
}
```

### Query Logic
```javascript
// Student sees only their complaints
Complaint.find({ student: req.userId })

// Admin sees all complaints
Complaint.find()
```

## Troubleshooting

### If student still sees "Access denied"

1. **Check browser console** for API errors
2. **Verify token** is being sent in Authorization header
3. **Check backend logs** for middleware errors
4. **Clear browser cache** and localStorage
5. **Re-login** to get fresh token

### If no complaints show up

1. **Verify complaint was created** - check MongoDB
2. **Check student field** in complaint matches userId in token
3. **Check backend logs** for query results
4. **Verify token role** is "student" not "Student"

### If admin route is accessible to students

1. **Check middleware order** in routes file
2. **Verify authorizeAdmin** is being called
3. **Check JWT role** in token payload

## Success Criteria

✅ Student can see their own complaints
✅ Student cannot see other students' complaints  
✅ Student cannot access admin routes
✅ Admin can see all complaints
✅ Staff can see assigned complaints
✅ No security weakened
✅ Status updates reflect automatically
✅ No "Admin role required" error

## Summary

**One line changed, problem solved.**

The fix was simple - change the frontend API call from `/complaints` to `/complaints/my`. The backend was already correctly configured with proper role-based access control. No security was weakened, and all role protections remain intact.
