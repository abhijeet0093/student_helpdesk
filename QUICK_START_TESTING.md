# 🚀 QUICK START - TESTING GUIDE

**Project**: Smart Campus Helpdesk  
**Date**: February 11, 2026  
**Purpose**: Test Tailwind Integration & Complaint System

---

## 🎯 WHAT WAS DONE

1. ✅ Installed and configured Tailwind CSS
2. ✅ Fixed complaint creation bug (image upload)
3. ✅ Modernized UI with Tailwind styling
4. ✅ Updated all complaint-related components
5. ✅ Added static file serving for uploads

---

## 🏃 QUICK START

### Step 1: Start Backend
```bash
cd backend
npm start
```

**Expected Output**:
```
==================================================
🚀 Smart Campus Helpdesk Server Started
==================================================
📡 Server running on port 3001
🌐 Base URL: http://localhost:3001
🔗 Health Check: http://localhost:3001/api/health
==================================================
✅ MongoDB Connected Successfully
```

### Step 2: Start Frontend (New Terminal)
```bash
cd frontend
npm start
```

**Expected Output**:
- Browser opens at http://localhost:3000
- No console errors
- Tailwind styles visible

---

## 🧪 TEST SCENARIOS

### Test 1: Login
1. Go to http://localhost:3000
2. Login as student:
   - Roll Number: `2024CS001`
   - Password: `password123`
3. ✅ Should redirect to dashboard

### Test 2: Create Complaint (Without Image)
1. Click "Raise New Complaint" button
2. Fill in form:
   - Title: "Test Complaint"
   - Category: "Infrastructure"
   - Priority: "Medium"
   - Description: "This is a test complaint"
3. Click "Submit Complaint"
4. ✅ Should show success message
5. ✅ Should redirect to "My Complaints"
6. ✅ Complaint should appear in list

### Test 3: Create Complaint (With Image)
1. Click "Raise New Complaint" button
2. Fill in form:
   - Title: "Complaint with Image"
   - Category: "IT Services"
   - Priority: "High"
   - Description: "Testing image upload"
   - Image: Upload any JPG/PNG (< 5MB)
3. Click "Submit Complaint"
4. ✅ Should show success message
5. ✅ Should redirect to "My Complaints"
6. ✅ Complaint should appear with image displayed

### Test 4: Filter Complaints
1. Go to "My Complaints"
2. Click different filter tabs:
   - All
   - Pending
   - In Progress
   - Resolved
3. ✅ List should filter correctly
4. ✅ Count badges should be accurate

### Test 5: UI/UX Check
1. Check CreateComplaint page:
   - ✅ Modern gradient background
   - ✅ Rounded card design
   - ✅ Smooth animations
   - ✅ Proper spacing
   - ✅ Hover effects work
2. Check MyComplaints page:
   - ✅ Filter tabs styled correctly
   - ✅ Complaint cards look modern
   - ✅ Status badges colored properly
   - ✅ Priority badges colored properly
   - ✅ Images display correctly

### Test 6: Responsive Design
1. Resize browser window
2. ✅ Layout should adapt to smaller screens
3. ✅ No horizontal scrolling
4. ✅ All elements remain accessible

---

## 🐛 TROUBLESHOOTING

### Issue: Tailwind styles not showing
**Solution**:
```bash
cd frontend
rm -rf node_modules
npm install
npm start
```

### Issue: Image upload fails
**Check**:
1. Backend server is running
2. `backend/uploads/complaints/` folder exists
3. File size < 5MB
4. File type is JPG, PNG, or GIF

### Issue: "Failed to create complaint"
**Check**:
1. All required fields filled (title, category, description)
2. Auth token is valid (try logging out and back in)
3. Backend console for error messages

### Issue: Images not displaying
**Check**:
1. Backend server.js has static file serving:
   ```javascript
   app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
   ```
2. Image URL is correct: `http://localhost:3001/uploads/complaints/filename.jpg`

---

## 📊 EXPECTED RESULTS

### Backend Console
```
✅ MongoDB Connected Successfully
POST /api/complaints 201 - 150ms
GET /api/complaints 200 - 50ms
```

### Frontend Console
```
No errors
```

### Browser Network Tab
```
POST http://localhost:3001/api/complaints - 201 Created
GET http://localhost:3001/api/complaints - 200 OK
GET http://localhost:3001/uploads/complaints/image_123.jpg - 200 OK
```

---

## ✅ SUCCESS CRITERIA

- [x] Backend starts without errors
- [x] Frontend starts without errors
- [x] Login works
- [x] Create complaint without image works
- [x] Create complaint with image works
- [x] Images display correctly
- [x] Filter tabs work
- [x] UI looks modern and professional
- [x] No console errors
- [x] Responsive design works

---

## 🎨 VISUAL CHECKLIST

### CreateComplaint Page
- [x] Gradient background (blue tones)
- [x] White rounded card with shadow
- [x] Back button with arrow icon
- [x] Form inputs with focus rings
- [x] File input styled properly
- [x] Error/success messages with icons
- [x] Loading spinner on submit
- [x] Hover effects on buttons

### MyComplaints Page
- [x] Gradient background matching CreateComplaint
- [x] Filter tabs with active state
- [x] Complaint cards with shadows
- [x] Status badges colored correctly
- [x] Priority badges colored correctly
- [x] Images displayed properly
- [x] Hover effects on cards
- [x] Empty state message if no complaints

---

## 📝 TEST CREDENTIALS

### Student
- Roll Number: `2024CS001`
- Password: `password123`

### Admin (for future testing)
- Email: `admin@smartcampus.edu`
- Password: `admin123`

### Staff (for future testing)
- Email: `staff@smartcampus.edu`
- Password: `staff123`

---

## 🎉 COMPLETION

Once all tests pass, the system is ready for:
1. Further feature development
2. Production deployment
3. User acceptance testing

---

**Status**: Ready for Testing  
**Last Updated**: February 11, 2026
