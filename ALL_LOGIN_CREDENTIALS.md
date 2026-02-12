# 🔐 Complete Login Credentials

## Quick Access - All User Types

---

## 👨‍🎓 STUDENT LOGIN

### Option 1: Register New Student (Recommended)
Since student registration is now fixed, you can register a new student:

**Registration URL:** http://localhost:3000/register

**Fill in the form:**
- Roll Number: `CS2024001` (or any format like IT2024001, ENTC2024001)
- Enrollment Number: `EN2024CS001` (or any unique number)
- Full Name: `Your Name`
- Date of Birth: `2000-01-01` (any date)
- Password: `student123` (minimum 6 characters)

**After Registration:**
- Login URL: http://localhost:3000/login
- Select "Student" tab
- Roll Number: `CS2024001` (what you registered with)
- Password: `student123` (what you set)

### Option 2: Use Seeded Student (If Available)
If you've run the seed script, you can use:

**Login Credentials:**
```
Roll Number: CS2021001
Password: student123
```

**To create seeded students:**
```bash
node backend/scripts/seedStudentsNew.js
```

This creates 5 sample students:
1. Rahul Sharma - CS2021001
2. Priya Patel - IT2021002
3. Amit Kumar - ENTC2021003
4. Sneha Desai - CS2022004
5. Vikram Singh - IT2022005

All with password: `student123`

---

## 👨‍💼 ADMIN LOGIN

**Login URL:** http://localhost:3000/login (select "Admin" tab)

**Credentials:**
```
Username: admin
Password: admin123
```

**To create admin account:**
```bash
node backend/scripts/seedAdmin.js
```

**Admin Features:**
- View all complaints
- Update complaint status
- Assign complaints to staff
- View staff list
- Access admin dashboard

---

## 👨‍🏫 STAFF LOGIN

**Login URL:** http://localhost:3000/login (select "Staff" tab)

**Credentials (Option 1):**
```
Email: rajesh.staff@college.edu
Password: staff123
```

**Credentials (Option 2):**
```
Email: priya.staff@college.edu
Password: staff123
```

**To create staff accounts:**
```bash
node backend/scripts/seedStaff.js
```

**Staff Features:**
- View assigned complaints
- Update complaint status
- Access staff dashboard

---

## 📊 Complete Credentials Table

| User Type | Login Field | Username/Email/Roll No | Password | Role |
|-----------|-------------|------------------------|----------|------|
| **Student** | Roll Number | CS2024001 (register first) | student123 | student |
| **Student** | Roll Number | CS2021001 (seeded) | student123 | student |
| **Admin** | Username | admin | admin123 | admin |
| **Staff** | Email | rajesh.staff@college.edu | staff123 | staff |
| **Staff** | Email | priya.staff@college.edu | staff123 | staff |

---

## 🚀 Quick Setup Guide

### Step 1: Start Services
```bash
# Terminal 1 - Start MongoDB
mongod

# Terminal 2 - Start Backend
cd backend
npm run dev

# Terminal 3 - Start Frontend
cd frontend
npm start
```

### Step 2: Create Accounts
```bash
# Create admin
node backend/scripts/seedAdmin.js

# Create staff
node backend/scripts/seedStaff.js

# Create students (optional - or register via UI)
node backend/scripts/seedStudentsNew.js
```

### Step 3: Login
Go to http://localhost:3000/login and use credentials above.

---

## 🎯 Login Process by User Type

### Student Login Process
1. **Register First** (if not seeded)
   - Go to http://localhost:3000/register
   - Fill: Roll Number, Enrollment Number, Full Name, DOB, Password
   - Click "Register"
   - You'll be redirected to login

2. **Login**
   - Go to http://localhost:3000/login
   - Select "Student" tab
   - Enter Roll Number (e.g., CS2024001)
   - Enter Password (e.g., student123)
   - Click "Login"

3. **Success**
   - Redirected to Student Dashboard
   - Can submit complaints, view posts, chat with AI, etc.

### Admin Login Process
1. **Ensure Admin Exists**
   ```bash
   node backend/scripts/seedAdmin.js
   ```

2. **Login**
   - Go to http://localhost:3000/login
   - Select "Admin" tab
   - Enter Username: `admin`
   - Enter Password: `admin123`
   - Click "Login"

3. **Success**
   - Redirected to Admin Dashboard
   - Can manage complaints, view all students, etc.

### Staff Login Process
1. **Ensure Staff Exists**
   ```bash
   node backend/scripts/seedStaff.js
   ```

2. **Login**
   - Go to http://localhost:3000/login
   - Select "Staff" tab
   - Enter Email: `rajesh.staff@college.edu`
   - Enter Password: `staff123`
   - Click "Login"

3. **Success**
   - Redirected to Staff Dashboard
   - Can view assigned complaints, update status, etc.

---

## 🔧 Create Custom Credentials

### Create Custom Student
**Via Registration Page:**
1. Go to http://localhost:3000/register
2. Use any Roll Number format: CS2024XXX, IT2024XXX, ENTC2024XXX
3. Use any Enrollment Number: EN2024CSXXX
4. Set your own password (min 6 characters)

**Via Seed Script:**
Edit `backend/scripts/seedStudentsNew.js` and add your data.

### Create Custom Admin
Edit `backend/scripts/seedAdmin.js`:
```javascript
const admin = await Admin.create({
  username: 'yourusername',
  email: 'youremail@college.edu',
  password: 'yourpassword'
});
```

### Create Custom Staff
Edit `backend/scripts/seedStaff.js` and add to staffMembers array:
```javascript
{
  name: 'Your Name',
  email: 'your.email@college.edu',
  department: 'Your Department',
  password: 'yourpassword'
}
```

---

## 🧪 Test Credentials

### Test Student Registration & Login
```bash
# 1. Register via UI
http://localhost:3000/register
Roll Number: TEST2024001
Enrollment: EN2024TEST001
Name: Test Student
DOB: 2000-01-01
Password: test123

# 2. Login
http://localhost:3000/login
Roll Number: TEST2024001
Password: test123
```

### Test Admin Login
```bash
http://localhost:3000/login
Username: admin
Password: admin123
```

### Test Staff Login
```bash
http://localhost:3000/login
Email: rajesh.staff@college.edu
Password: staff123
```

---

## 🐛 Troubleshooting

### "Invalid credentials" for Student
**Cause:** Student not registered or wrong credentials  
**Solution:**
1. Register first at http://localhost:3000/register
2. Or run: `node backend/scripts/seedStudentsNew.js`
3. Use exact Roll Number and Password

### "Invalid credentials" for Admin
**Cause:** Admin not seeded  
**Solution:**
```bash
node backend/scripts/seedAdmin.js
```
Then use: admin / admin123

### "Invalid credentials" for Staff
**Cause:** Staff not seeded  
**Solution:**
```bash
node backend/scripts/seedStaff.js
```
Then use: rajesh.staff@college.edu / staff123

### "Account locked"
**Cause:** Too many failed login attempts  
**Solution:**
- Wait 30 minutes
- Or clear database and re-seed
- Or create new account

---

## 📝 Important Notes

### Student Registration
- ✅ **NOW FIXED** - Registration works correctly
- Roll Number format: CS2024001, IT2024001, ENTC2024001, etc.
- Email is auto-generated: rollnumber@student.college.edu
- Department is auto-extracted from Roll Number prefix
- Semester defaults to 1

### Password Security
- All passwords are hashed with bcrypt
- Minimum 6 characters for students
- Minimum 8 characters for admin/staff
- Never stored as plain text

### Login Attempts
- Maximum 5 failed attempts
- Account locks for 30 minutes after 5 failures
- Counter resets on successful login

---

## 🎉 Quick Reference Card

```
╔══════════════════════════════════════════════════════════╗
║                  LOGIN CREDENTIALS                       ║
╚══════════════════════════════════════════════════════════╝

👨‍🎓 STUDENT
   Register at: http://localhost:3000/register
   Or use seeded: CS2021001 / student123

👨‍💼 ADMIN
   Username: admin
   Password: admin123

👨‍🏫 STAFF
   Email: rajesh.staff@college.edu
   Password: staff123

🌐 Login URL: http://localhost:3000/login
```

---

## 📞 Need Help?

**View all credentials in database:**
```bash
node get-credentials.js
```

**Check specific type:**
```bash
node backend/scripts/checkCredentials.js student
node backend/scripts/checkCredentials.js admin
node backend/scripts/checkCredentials.js staff
```

**Quick display:**
```bash
node show-default-credentials.js
```

---

## ✅ Summary

**Student:**
- Register first OR use seeded credentials
- Roll Number: CS2024001 (or register your own)
- Password: student123

**Admin:**
- Username: admin
- Password: admin123

**Staff:**
- Email: rajesh.staff@college.edu
- Password: staff123

**All credentials are ready to use after running seed scripts!** 🎉
