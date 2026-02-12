# 🔐 Login Credentials Guide

## Quick Access - Default Credentials

### 👨‍💼 Admin Login
```
Username: admin
Password: admin123
```
**Login URL:** http://localhost:3000/login (select "Admin")

---

### 👨‍🏫 Staff Login
```
Email: rajesh.staff@college.edu
Password: staff123
```
**Login URL:** http://localhost:3000/login (select "Staff")

**Alternative Staff:**
```
Email: priya.staff@college.edu
Password: staff123
```

---

### 👨‍🎓 Student Login

**Option 1: Register New Student**
1. Go to http://localhost:3000/register
2. Fill in your details
3. Use your Roll Number and password to login

**Option 2: Use Seeded Student (if available)**
```
Roll Number: [Check StudentMaster collection]
Password: [Your registered password]
```

---

## 🚀 How to Create Credentials

### Create Admin Account
```bash
node backend/scripts/seedAdmin.js
```

**Output:**
```
✅ Admin created successfully!
Username: admin
Password: admin123

📝 Login credentials:
   Username: admin
   Password: admin123
```

---

### Create Staff Accounts
```bash
node backend/scripts/seedStaff.js
```

**Output:**
```
✅ Staff created successfully!

2 staff members added:
- Rajesh Kumar (rajesh.staff@college.edu) - Computer Science
- Priya Sharma (priya.staff@college.edu) - Mechanical Engineering

📝 Login credentials:
   Email: rajesh.staff@college.edu
   Password: staff123
```

---

### Create Student Account

**Method 1: Via Registration Page**
1. Open http://localhost:3000/register
2. Enter:
   - Full Name
   - Roll Number (must exist in StudentMaster)
   - Email
   - Password
   - Department
   - Semester
3. Click "Register"
4. Login with Roll Number and Password

**Method 2: Seed StudentMaster Data First**
```bash
node backend/scripts/seedStudentMaster.js
```

This creates sample student records that can be used for registration.

---

## 📋 Complete Credentials List

### Admin Credentials
| Username | Password | Role | Email |
|----------|----------|------|-------|
| admin | admin123 | Admin | admin@college.edu |

### Staff Credentials
| Name | Email | Password | Department |
|------|-------|----------|------------|
| Rajesh Kumar | rajesh.staff@college.edu | staff123 | Computer Science |
| Priya Sharma | priya.staff@college.edu | staff123 | Mechanical Engineering |

### Student Credentials
| Roll Number | Password | Status |
|-------------|----------|--------|
| [Your Roll No] | [Your Password] | Register first |

---

## 🔍 Check Existing Credentials

### Check Admin
```bash
node backend/scripts/checkCredentials.js admin
```

### Check Staff
```bash
node backend/scripts/checkCredentials.js staff
```

### Check Students
```bash
node backend/scripts/checkCredentials.js student
```

---

## 🛠️ Interactive Credential Tool

Run the interactive tool to get credentials:
```bash
node get-credentials.js
```

This will:
1. Check if credentials exist
2. Show existing credentials
3. Offer to create new ones if missing

---

## 📝 Login Process

### Admin Login
1. Go to http://localhost:3000/login
2. Select "Admin" tab
3. Enter:
   - Username: `admin`
   - Password: `admin123`
4. Click "Login"

### Staff Login
1. Go to http://localhost:3000/login
2. Select "Staff" tab
3. Enter:
   - Email: `rajesh.staff@college.edu`
   - Password: `staff123`
4. Click "Login"

### Student Login
1. Go to http://localhost:3000/login
2. Select "Student" tab (default)
3. Enter:
   - Roll Number: [Your Roll Number]
   - Password: [Your Password]
4. Click "Login"

---

## 🔐 Password Security

### Default Passwords
- **Admin:** admin123
- **Staff:** staff123
- **Student:** [Set during registration]

### Password Requirements
- Minimum 6 characters
- Automatically hashed with bcrypt (10 rounds)
- Stored securely in database

### Change Password
Currently, passwords can only be changed by:
1. Updating directly in database
2. Re-running seed scripts (will reset)
3. Registering new account

---

## 🚨 Troubleshooting

### "Invalid credentials" error

**For Admin:**
- Verify username is exactly: `admin`
- Verify password is exactly: `admin123`
- Run seed script: `node backend/scripts/seedAdmin.js`

**For Staff:**
- Verify email format is correct
- Verify password is exactly: `staff123`
- Run seed script: `node backend/scripts/seedStaff.js`

**For Student:**
- Verify you've registered first
- Verify Roll Number matches registration
- Check StudentMaster data exists

### "User not found" error

**Admin/Staff:**
- Run the appropriate seed script
- Check MongoDB connection
- Verify database has the collections

**Student:**
- Register a new account first
- Ensure StudentMaster data exists
- Run: `node backend/scripts/seedStudentMaster.js`

### Account locked

If you see "Account locked" message:
- You've failed login 5 times
- Wait or reset in database
- Or create new account

---

## 💾 Database Check

### Check if credentials exist in MongoDB

**Using MongoDB Compass:**
1. Connect to `mongodb://localhost:27017`
2. Open `smart_campus_db` database
3. Check collections:
   - `admins` - Admin accounts
   - `staff` - Staff accounts
   - `students` - Student accounts
   - `studentmasters` - Valid roll numbers

**Using MongoDB Shell:**
```bash
mongosh
use smart_campus_db
db.admins.find()
db.staff.find()
db.students.find()
```

---

## 🎯 Quick Start Checklist

- [ ] MongoDB is running
- [ ] Backend server is running (port 3001)
- [ ] Frontend is running (port 3000)
- [ ] Admin seeded: `node backend/scripts/seedAdmin.js`
- [ ] Staff seeded: `node backend/scripts/seedStaff.js`
- [ ] StudentMaster seeded: `node backend/scripts/seedStudentMaster.js`
- [ ] Try logging in with default credentials

---

## 📞 Need Help?

1. **Run the interactive tool:**
   ```bash
   node get-credentials.js
   ```

2. **Check seed scripts:**
   ```bash
   ls backend/scripts/
   ```

3. **Verify database:**
   - Open MongoDB Compass
   - Check `smart_campus_db` collections

4. **Test API directly:**
   ```bash
   # Test admin login
   curl -X POST http://localhost:3001/api/auth/admin/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

---

## 🎉 Summary

**Default credentials are ready to use:**

✅ **Admin:** admin / admin123  
✅ **Staff:** rajesh.staff@college.edu / staff123  
✅ **Student:** Register first, then login

**Just run the seed scripts and start logging in!**
