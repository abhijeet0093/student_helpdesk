# Check Backend Console Output

## What to Look For

When you see "Access denied. Admin role required" in the browser, check the **backend console window** for these debug messages:

### Expected Output (If Working):
```
=== VERIFY STUDENT DEBUG ===
Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR5...
Token decoded: { userId: '67abc...', role: 'student' }
Set req.userId: 67abc...
Set req.role: student
✅ Student verified successfully

=== GET MY COMPLAINTS DEBUG ===
req.user: undefined
req.userId: 67abc...
req.role: student
Extracted studentId: 67abc...
Querying complaints with filter: { student: '67abc...' }
Found X complaints
```

### If You See Nothing:
- Backend server is NOT running the new code
- You need to restart it

### If You See This:
```
❌ Role mismatch: expected 'student', got 'admin'
```
- You're logged in as admin, not student
- Logout and login as student

### If You See This:
```
❌ Token verification error: jwt malformed
```
- Token is corrupted
- Clear localStorage and login again

## Steps to Check:

1. **Find the backend console window** (black window with server logs)

2. **If you don't see it:**
   - Backend is not running
   - Start it: `cd backend && npm start`

3. **If backend console shows old startup (no debug messages):**
   - Server needs restart
   - Press `Ctrl+C` in backend window
   - Run: `npm start`

4. **After restart, try accessing "My Complaints" again**

5. **Watch the backend console** - you should see the debug messages

## Quick Test:

Open a new command prompt and run:
```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{"success":true,"message":"Server is healthy","database":"Connected"}
```

If this fails, backend is not running!

## What the Error Means:

"Access denied. Admin role required" comes from line 104 in authMiddleware.js:

```javascript
function authorizeAdmin(req, res, next) {
  if (req.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'  // ← This message
    });
  }
  next();
}
```

This means the request is going through `authorizeAdmin` instead of `verifyStudent`.

**Possible causes:**
1. Wrong route being called (frontend calling /api/admin/complaints instead of /api/complaints)
2. Routes registered in wrong order in server.js
3. Token has role='admin' instead of role='student'

## Next Step:

**Share the backend console output** when you click "My Complaints" and I'll tell you exactly what's wrong!
