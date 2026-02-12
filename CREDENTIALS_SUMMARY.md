# 🔐 Login Credentials - Summary

## ✅ Everything You Need to Login

---

## 📋 Default Credentials

### 👨‍💼 Admin
```
Username: admin
Password: admin123
Login URL: http://localhost:3000/login (Admin tab)
```

### 👨‍🏫 Staff
```
Email: rajesh.staff@college.edu
Password: staff123
Login URL: http://localhost:3000/login (Staff tab)
```

### 👨‍🎓 Student
```
Step 1: Register at http://localhost:3000/register
Step 2: Login with your Roll Number and Password
Login URL: http://localhost:3000/login (Student tab)
```

---

## 🚀 How to Get Credentials

### Method 1: Run Interactive Tool (Easiest)
```bash
node get-credentials.js
```
This will show you all existing credentials in your database.

### Method 2: Use Batch File (Windows)
```bash
show-credentials.bat
```
Double-click the file or run from command prompt.

### Method 3: Create Credentials
```bash
# Create admin
node backend/scripts/seedAdmin.js

# Create staff
node backend/scripts/seedStaff.js

# Create student master data (for registration)
node backend/scripts/seedStudentMaster.js
```

### Method 4: Check Specific Type
```bash
node backend/scripts/checkCredentials.js admin
node backend/scripts/checkCredentials.js staff
node backend/scripts/checkCredentials.js student
```

---

## 📁 Files Created for You

1. **GET_CREDENTIALS.md** - Complete credentials guide
2. **get-credentials.js** - Interactive tool to show credentials
3. **show-credentials.bat** - Windows batch file
4. **backend/scripts/checkCredentials.js** - Check specific credentials
5. **CREDENTIALS_QUICK_REFERENCE.txt** - Quick reference card

---

## 🎯 Quick Start

### Step 1: Create Credentials
```bash
node backend/scripts/seedAdmin.js
node backend/scripts/seedStaff.js
node backend/scripts/seedStudentMaster.js
```

### Step 2: View Credentials
```bash
node get-credentials.js
```

### Step 3: Login
Go to http://localhost:3000/login and use the credentials shown.

---

## 💡 Tips

1. **Admin and Staff** credentials are created by seed scripts
2. **Student** accounts must be registered first
3. All passwords are hashed with bcrypt for security
4. Default passwords are for development only
5. Change passwords in production

---

## 🔍 What Each Tool Does

### get-credentials.js
- Shows all existing credentials
- Checks database for accounts
- Provides quick start guide
- Shows what's missing

### seedAdmin.js
- Creates admin account
- Username: admin
- Password: admin123

### seedStaff.js
- Creates 2 staff accounts
- Rajesh Kumar (Computer Science)
- Priya Sharma (Mechanical Engineering)
- Password: staff123

### seedStudentMaster.js
- Creates valid roll numbers
- Required for student registration
- Students can only register with valid roll numbers

### checkCredentials.js
- Check specific credential type
- Usage: `node backend/scripts/checkCredentials.js [admin|staff|student]`

---

## 📊 Credentials Table

| Role | Username/Email | Password | Created By |
|------|---------------|----------|------------|
| Admin | admin | admin123 | seedAdmin.js |
| Staff | rajesh.staff@college.edu | staff123 | seedStaff.js |
| Staff | priya.staff@college.edu | staff123 | seedStaff.js |
| Student | [Roll Number] | [Your Password] | Registration |

---

## 🎓 Student Registration Process

1. **Seed StudentMaster Data**
   ```bash
   node backend/scripts/seedStudentMaster.js
   ```
   This creates valid roll numbers.

2. **Register Student**
   - Go to http://localhost:3000/register
   - Enter details (use a valid roll number from StudentMaster)
   - Set your password
   - Click Register

3. **Login**
   - Go to http://localhost:3000/login
   - Select "Student" tab
   - Enter Roll Number and Password
   - Click Login

---

## 🔐 Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- Account locks after 5 failed login attempts
- Default passwords are for development only
- Change passwords in production environment

---

## 🆘 Troubleshooting

### "Invalid credentials"
✅ **Solution:** Run seed scripts to create accounts
```bash
node backend/scripts/seedAdmin.js
node backend/scripts/seedStaff.js
```

### "User not found"
✅ **Solution:** Account doesn't exist, create it first
- Admin/Staff: Run seed scripts
- Student: Register first

### "Account locked"
✅ **Solution:** Too many failed login attempts
- Create new account
- Or reset in database

### Can't see credentials
✅ **Solution:** Run the interactive tool
```bash
node get-credentials.js
```

### MongoDB connection error
✅ **Solution:** 
- Ensure MongoDB is running
- Check backend/.env file
- Verify MONGODB_URI

---

## 📖 More Information

- **Complete Guide:** GET_CREDENTIALS.md
- **Quick Reference:** CREDENTIALS_QUICK_REFERENCE.txt
- **Project Start:** START_PROJECT.md
- **Testing Report:** WHITEBOX_TEST_COMPLETE.md

---

## ✅ Summary

**You have 5 ways to get credentials:**

1. ⭐ Run `node get-credentials.js` (Recommended)
2. Run `show-credentials.bat` (Windows)
3. Run seed scripts to create accounts
4. Check `GET_CREDENTIALS.md` for defaults
5. View `CREDENTIALS_QUICK_REFERENCE.txt`

**Default credentials are:**
- Admin: admin / admin123
- Staff: rajesh.staff@college.edu / staff123
- Student: Register first

**🎉 You're all set! Start logging in!**
