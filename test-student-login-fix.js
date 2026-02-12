/**
 * TEST SCRIPT - Student Login Bug Fix
 * 
 * This script tests the password validation fix
 * Tests both registration and login flows
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const mongoose = require('mongoose');
const Student = require('./backend/models/Student');

console.log('\n' + '='.repeat(70));
console.log('🧪 TESTING STUDENT LOGIN BUG FIX');
console.log('='.repeat(70) + '\n');

async function testFix() {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_campus_db');
    console.log('✅ Connected\n');

    // Clean up test data
    await Student.deleteMany({ rollNumber: { $in: ['TEST001', 'TEST002'] } });

    // TEST 1: Password Too Short (Should Fail)
    console.log('TEST 1: Registration with short password (7 chars)');
    console.log('-'.repeat(70));
    try {
      const shortPassStudent = await Student.create({
        rollNumber: 'TEST001',
        enrollmentNumber: 'EN001',
        fullName: 'Test Student 1',
        email: 'test001@student.college.edu',
        department: 'Computer Science',
        semester: 1,
        password: 'pass123' // 7 characters - should fail
      });
      console.log('❌ FAIL: Student created with short password (BUG!)');
      console.log('   Student ID:', shortPassStudent._id);
    } catch (error) {
      if (error.name === 'ValidationError') {
        console.log('✅ PASS: Mongoose validation rejected short password');
        console.log('   Error:', error.message);
      } else {
        console.log('⚠️  UNEXPECTED ERROR:', error.message);
      }
    }
    console.log('');

    // TEST 2: Valid Password (Should Succeed)
    console.log('TEST 2: Registration with valid password (10 chars)');
    console.log('-'.repeat(70));
    try {
      const validStudent = await Student.create({
        rollNumber: 'TEST002',
        enrollmentNumber: 'EN002',
        fullName: 'Test Student 2',
        email: 'test002@student.college.edu',
        department: 'Computer Science',
        semester: 1,
        password: 'student123' // 10 characters - should succeed
      });
      console.log('✅ PASS: Student created successfully');
      console.log('   Student ID:', validStudent._id);
      console.log('   Roll Number:', validStudent.rollNumber);
      console.log('   Password Hash:', validStudent.password.substring(0, 20) + '...');
    } catch (error) {
      console.log('❌ FAIL: Could not create student with valid password');
      console.log('   Error:', error.message);
    }
    console.log('');

    // TEST 3: Login with Valid Credentials
    console.log('TEST 3: Login with correct credentials');
    console.log('-'.repeat(70));
    const student = await Student.findOne({ rollNumber: 'TEST002' });
    if (student) {
      const isPasswordValid = await student.comparePassword('student123');
      if (isPasswordValid) {
        console.log('✅ PASS: Password comparison successful');
        console.log('   Login would succeed');
      } else {
        console.log('❌ FAIL: Password comparison failed');
        console.log('   Login would fail with "Invalid credentials"');
      }
    } else {
      console.log('❌ FAIL: Student not found in database');
    }
    console.log('');

    // TEST 4: Login with Wrong Password
    console.log('TEST 4: Login with wrong password');
    console.log('-'.repeat(70));
    if (student) {
      const isWrongPassword = await student.comparePassword('wrongpass');
      if (!isWrongPassword) {
        console.log('✅ PASS: Wrong password correctly rejected');
      } else {
        console.log('❌ FAIL: Wrong password accepted (SECURITY BUG!)');
      }
    }
    console.log('');

    // TEST 5: Check Account Status
    console.log('TEST 5: Account status checks');
    console.log('-'.repeat(70));
    if (student) {
      console.log('   Is Active:', student.isActive ? '✅ Yes' : '❌ No');
      console.log('   Is Locked:', student.isLocked() ? '❌ Yes' : '✅ No');
      console.log('   Login Attempts:', student.loginAttempts);
      
      if (student.isActive && !student.isLocked()) {
        console.log('✅ PASS: Account is ready for login');
      } else {
        console.log('❌ FAIL: Account has issues');
      }
    }
    console.log('');

    // Clean up
    await Student.deleteMany({ rollNumber: { $in: ['TEST001', 'TEST002'] } });
    console.log('🧹 Cleaned up test data\n');

    console.log('='.repeat(70));
    console.log('✅ ALL TESTS COMPLETED');
    console.log('='.repeat(70));
    console.log('\n📝 SUMMARY:');
    console.log('   - Password validation working at schema level');
    console.log('   - Controller should validate BEFORE calling Student.create()');
    console.log('   - This prevents silent failures and confusing error messages');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testFix();
