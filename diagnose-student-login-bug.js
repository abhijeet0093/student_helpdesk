/**
 * CRITICAL BUG DIAGNOSIS - Student Login
 * This script will identify the exact cause of login failure
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const mongoose = require('mongoose');

console.log('\n' + '='.repeat(70));
console.log('🔍 CRITICAL BUG DIAGNOSIS - STUDENT LOGIN');
console.log('='.repeat(70) + '\n');

async function diagnose() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_campus_db');
    console.log('✅ Connected\n');

    const Student = require('./backend/models/Student');

    // Check if any students exist
    const studentCount = await Student.countDocuments();
    console.log(`📊 Total students in database: ${studentCount}\n`);

    if (studentCount === 0) {
      console.log('❌ NO STUDENTS FOUND IN DATABASE');
      console.log('   This is why login fails - no students exist!');
      console.log('   Run: node backend/scripts/seedStudentsNew.js\n');
      process.exit(0);
    }

    // Get a sample student
    const sampleStudent = await Student.findOne();
    console.log('📋 Sample Student Data:');
    console.log('   Roll Number:', sampleStudent.rollNumber);
    console.log('   Full Name:', sampleStudent.fullName);
    console.log('   Email:', sampleStudent.email);
    console.log('   Department:', sampleStudent.department);
    console.log('   Password Hash:', sampleStudent.password.substring(0, 20) + '...');
    console.log('   Is Active:', sampleStudent.isActive);
    console.log('   Login Attempts:', sampleStudent.loginAttempts);
    console.log('   Lock Until:', sampleStudent.lockUntil);
    console.log('');

    // Test password comparison
    console.log('🔐 Testing Password Comparison:');
    const testPassword = 'student123'; // Common test password
    
    console.log(`   Testing password: "${testPassword}"`);
    const isValid = await sampleStudent.comparePassword(testPassword);
    console.log(`   Result: ${isValid ? '✅ MATCH' : '❌ NO MATCH'}`);
    console.log('');

    // Test with wrong password
    console.log('   Testing wrong password: "wrongpass"');
    const isWrong = await sampleStudent.comparePassword('wrongpass');
    console.log(`   Result: ${isWrong ? '❌ MATCH (BUG!)' : '✅ NO MATCH (correct)'}`);
    console.log('');

    // Check if comparePassword method exists
    console.log('🔍 Checking comparePassword method:');
    if (typeof sampleStudent.comparePassword === 'function') {
      console.log('   ✅ comparePassword method exists');
    } else {
      console.log('   ❌ comparePassword method MISSING - THIS IS THE BUG!');
    }
    console.log('');

    // Check if isLocked method exists
    console.log('🔍 Checking isLocked method:');
    if (typeof sampleStudent.isLocked === 'function') {
      console.log('   ✅ isLocked method exists');
      console.log('   Is account locked?', sampleStudent.isLocked());
    } else {
      console.log('   ❌ isLocked method MISSING');
    }
    console.log('');

    // Simulate login process
    console.log('🧪 Simulating Login Process:');
    const testRollNumber = sampleStudent.rollNumber;
    const testPass = 'student123';
    
    console.log(`   1. Looking up student by rollNumber: ${testRollNumber}`);
    const foundStudent = await Student.findOne({ rollNumber: testRollNumber });
    
    if (!foundStudent) {
      console.log('   ❌ Student NOT FOUND - THIS IS THE BUG!');
    } else {
      console.log('   ✅ Student found');
      
      console.log(`   2. Checking if account is locked...`);
      if (foundStudent.isLocked()) {
        console.log('   ❌ Account is LOCKED - THIS IS THE BUG!');
      } else {
        console.log('   ✅ Account not locked');
      }
      
      console.log(`   3. Checking if account is active...`);
      if (!foundStudent.isActive) {
        console.log('   ❌ Account is INACTIVE - THIS IS THE BUG!');
      } else {
        console.log('   ✅ Account is active');
      }
      
      console.log(`   4. Comparing password...`);
      const passwordMatch = await foundStudent.comparePassword(testPass);
      if (!passwordMatch) {
        console.log('   ❌ Password does NOT match - THIS IS THE BUG!');
        console.log('   Possible causes:');
        console.log('      - Password was not hashed correctly during registration');
        console.log('      - comparePassword method is broken');
        console.log('      - Test password is wrong');
      } else {
        console.log('   ✅ Password matches');
      }
    }
    console.log('');

    console.log('='.repeat(70));
    console.log('📊 DIAGNOSIS COMPLETE');
    console.log('='.repeat(70));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

diagnose();
