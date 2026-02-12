/**
 * Check Credentials Script
 * Usage: node backend/scripts/checkCredentials.js [admin|staff|student]
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Admin = require('../models/Admin');
const Staff = require('../models/Staff');
const Student = require('../models/Student');
const StudentMaster = require('../models/StudentMaster');

const checkType = process.argv[2] || 'all';

async function checkCredentials() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_campus_db');
    console.log('✅ Connected to MongoDB\n');

    if (checkType === 'admin' || checkType === 'all') {
      console.log('👨‍💼 ADMIN CREDENTIALS');
      console.log('='.repeat(60));
      const admins = await Admin.find().select('username email createdAt');
      
      if (admins.length > 0) {
        admins.forEach(admin => {
          console.log(`Username: ${admin.username}`);
          console.log(`Email: ${admin.email}`);
          console.log(`Password: admin123 (default)`);
          console.log(`Created: ${admin.createdAt}`);
          console.log('-'.repeat(60));
        });
      } else {
        console.log('❌ No admin found');
        console.log('Run: node backend/scripts/seedAdmin.js\n');
      }
    }

    if (checkType === 'staff' || checkType === 'all') {
      console.log('\n👨‍🏫 STAFF CREDENTIALS');
      console.log('='.repeat(60));
      const staff = await Staff.find().select('name email department createdAt');
      
      if (staff.length > 0) {
        staff.forEach(s => {
          console.log(`Name: ${s.name}`);
          console.log(`Email: ${s.email}`);
          console.log(`Department: ${s.department}`);
          console.log(`Password: staff123 (default)`);
          console.log(`Created: ${s.createdAt}`);
          console.log('-'.repeat(60));
        });
      } else {
        console.log('❌ No staff found');
        console.log('Run: node backend/scripts/seedStaff.js\n');
      }
    }

    if (checkType === 'student' || checkType === 'all') {
      console.log('\n👨‍🎓 STUDENT CREDENTIALS');
      console.log('='.repeat(60));
      const students = await Student.find().select('fullName rollNumber email department').limit(10);
      const totalStudents = await Student.countDocuments();
      
      if (students.length > 0) {
        console.log(`Found ${totalStudents} students (showing first 10):\n`);
        students.forEach(s => {
          console.log(`Name: ${s.fullName}`);
          console.log(`Roll Number: ${s.rollNumber}`);
          console.log(`Email: ${s.email}`);
          console.log(`Department: ${s.department}`);
          console.log(`Password: [Set during registration]`);
          console.log('-'.repeat(60));
        });
      } else {
        console.log('❌ No students found');
        console.log('Students must register at: http://localhost:3000/register\n');
      }
    }

    if (checkType === 'master' || checkType === 'all') {
      console.log('\n📋 STUDENT MASTER DATA');
      console.log('='.repeat(60));
      const masters = await StudentMaster.find().select('rollNumber fullName department').limit(10);
      const totalMasters = await StudentMaster.countDocuments();
      
      if (masters.length > 0) {
        console.log(`Found ${totalMasters} valid roll numbers (showing first 10):\n`);
        masters.forEach(m => {
          console.log(`Roll Number: ${m.rollNumber}`);
          console.log(`Name: ${m.fullName}`);
          console.log(`Department: ${m.department}`);
          console.log('-'.repeat(60));
        });
      } else {
        console.log('❌ No StudentMaster data found');
        console.log('Run: node backend/scripts/seedStudentMaster.js\n');
      }
    }

    console.log('\n✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

console.log('🔍 Checking credentials...\n');
checkCredentials();
