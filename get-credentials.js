/**
 * Interactive Credentials Tool
 * Get login credentials for Admin, Staff, and Students
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const Admin = require('./backend/models/Admin');
const Staff = require('./backend/models/Staff');
const Student = require('./backend/models/Student');
const StudentMaster = require('./backend/models/StudentMaster');

console.log('\n' + '='.repeat(60));
console.log('🔐 LOGIN CREDENTIALS TOOL');
console.log('='.repeat(60) + '\n');

async function getCredentials() {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_campus_db');
    console.log('✅ Connected to MongoDB\n');

    // Check Admin
    console.log('👨‍💼 ADMIN CREDENTIALS');
    console.log('-'.repeat(60));
    const admins = await Admin.find().select('username email');
    
    if (admins.length > 0) {
      console.log('✅ Admin accounts found:\n');
      admins.forEach(admin => {
        console.log(`   Username: ${admin.username}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: admin123 (default)`);
        console.log('');
      });
    } else {
      console.log('❌ No admin accounts found');
      console.log('   Run: node backend/scripts/seedAdmin.js');
      console.log('   Default credentials will be:');
      console.log('   Username: admin');
      console.log('   Password: admin123\n');
    }

    // Check Staff
    console.log('👨‍🏫 STAFF CREDENTIALS');
    console.log('-'.repeat(60));
    const staffMembers = await Staff.find().select('name email department');
    
    if (staffMembers.length > 0) {
      console.log(`✅ ${staffMembers.length} staff accounts found:\n`);
      staffMembers.forEach(staff => {
        console.log(`   Name: ${staff.name}`);
        console.log(`   Email: ${staff.email}`);
        console.log(`   Department: ${staff.department}`);
        console.log(`   Password: staff123 (default)`);
        console.log('');
      });
    } else {
      console.log('❌ No staff accounts found');
      console.log('   Run: node backend/scripts/seedStaff.js');
      console.log('   Default credentials will be:');
      console.log('   Email: rajesh.staff@college.edu');
      console.log('   Password: staff123\n');
    }

    // Check Students
    console.log('👨‍🎓 STUDENT CREDENTIALS');
    console.log('-'.repeat(60));
    const students = await Student.find().select('fullName rollNumber email department').limit(5);
    
    if (students.length > 0) {
      console.log(`✅ ${students.length} student accounts found (showing first 5):\n`);
      students.forEach(student => {
        console.log(`   Name: ${student.fullName}`);
        console.log(`   Roll Number: ${student.rollNumber}`);
        console.log(`   Email: ${student.email}`);
        console.log(`   Department: ${student.department}`);
        console.log(`   Password: [Set during registration]`);
        console.log('');
      });
      
      const totalStudents = await Student.countDocuments();
      if (totalStudents > 5) {
        console.log(`   ... and ${totalStudents - 5} more students\n`);
      }
    } else {
      console.log('❌ No student accounts found');
      console.log('   Students must register first at: http://localhost:3000/register');
      console.log('   Or check if StudentMaster data exists\n');
    }

    // Check StudentMaster
    console.log('📋 STUDENT MASTER DATA (Valid Roll Numbers)');
    console.log('-'.repeat(60));
    const studentMasters = await StudentMaster.find().select('rollNumber fullName department').limit(5);
    
    if (studentMasters.length > 0) {
      console.log(`✅ ${studentMasters.length} valid roll numbers found (showing first 5):\n`);
      studentMasters.forEach(sm => {
        console.log(`   Roll Number: ${sm.rollNumber}`);
        console.log(`   Name: ${sm.fullName}`);
        console.log(`   Department: ${sm.department}`);
        console.log('');
      });
      
      const totalMasters = await StudentMaster.countDocuments();
      if (totalMasters > 5) {
        console.log(`   ... and ${totalMasters - 5} more roll numbers\n`);
      }
      
      console.log('   ℹ️  Use these roll numbers to register new students\n');
    } else {
      console.log('❌ No StudentMaster data found');
      console.log('   Run: node backend/scripts/seedStudentMaster.js');
      console.log('   This will create valid roll numbers for registration\n');
    }

    // Summary
    console.log('='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Admins: ${admins.length}`);
    console.log(`Staff: ${staffMembers.length}`);
    console.log(`Students: ${await Student.countDocuments()}`);
    console.log(`Valid Roll Numbers: ${await StudentMaster.countDocuments()}`);
    console.log('');

    // Quick Start Guide
    console.log('='.repeat(60));
    console.log('🚀 QUICK START');
    console.log('='.repeat(60));
    console.log('');
    
    if (admins.length === 0) {
      console.log('1. Create Admin:');
      console.log('   node backend/scripts/seedAdmin.js');
      console.log('');
    }
    
    if (staffMembers.length === 0) {
      console.log('2. Create Staff:');
      console.log('   node backend/scripts/seedStaff.js');
      console.log('');
    }
    
    if (studentMasters.length === 0) {
      console.log('3. Create StudentMaster data:');
      console.log('   node backend/scripts/seedStudentMaster.js');
      console.log('');
    }
    
    console.log('4. Login URLs:');
    console.log('   Frontend: http://localhost:3000/login');
    console.log('   Backend Health: http://localhost:3001/api/health');
    console.log('');
    
    console.log('5. Default Credentials:');
    if (admins.length > 0) {
      console.log('   Admin: admin / admin123');
    }
    if (staffMembers.length > 0) {
      console.log('   Staff: rajesh.staff@college.edu / staff123');
    }
    console.log('   Student: Register first, then login with Roll Number');
    console.log('');

    console.log('📖 For more details, see: GET_CREDENTIALS.md');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure MongoDB is running');
    console.log('2. Check backend/.env file exists');
    console.log('3. Verify MONGODB_URI in .env');
    console.log('');
    process.exit(1);
  }
}

getCredentials();
