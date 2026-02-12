/**
 * DEBUG AUTHENTICATION FLOW
 * Step-by-step debugging of registration and login
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const API_URL = 'http://localhost:3001/api';

// Test student data
const testStudent = {
  rollNumber: 'CS2024001',
  enrollmentNumber: 'EN2024CS001',
  fullName: 'RAHUL KUMAR SHARMA',
  dateOfBirth: '2003-05-15',
  password: 'TestPassword123'
};

console.log('🔍 DEBUGGING AUTHENTICATION FLOW\n');
console.log('=' .repeat(70));

async function step1_checkBackend() {
  console.log('\n📍 STEP 1: Check if backend is running');
  console.log('-'.repeat(70));
  
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Backend is running');
    console.log('   Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Backend is NOT running!');
    console.log('   Error:', error.message);
    console.log('\n💡 Fix: cd backend && npm start\n');
    return false;
  }
}

async function step2_checkDatabase() {
  console.log('\n📍 STEP 2: Check database connection');
  console.log('-'.repeat(70));
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('   Database:', mongoose.connection.name);
    return true;
  } catch (error) {
    console.log('❌ MongoDB connection failed!');
    console.log('   Error:', error.message);
    console.log('\n💡 Fix: net start MongoDB\n');
    return false;
  }
}

async function step3_deleteExistingStudent() {
  console.log('\n📍 STEP 3: Clean up existing test student');
  console.log('-'.repeat(70));
  
  try {
    const Student = mongoose.model('Student', new mongoose.Schema({
      rollNumber: String,
      password: String
    }));
    
    const deleted = await Student.deleteOne({ rollNumber: testStudent.rollNumber });
    
    if (deleted.deletedCount > 0) {
      console.log('✅ Deleted existing student:', testStudent.rollNumber);
    } else {
      console.log('ℹ️  No existing student found (this is fine)');
    }
    return true;
  } catch (error) {
    console.log('⚠️  Could not delete existing student:', error.message);
    return true; // Continue anyway
  }
}

async function step4_testRegistration() {
  console.log('\n📍 STEP 4: Test registration API');
  console.log('-'.repeat(70));
  console.log('Registering:', testStudent.rollNumber);
  
  try {
    const response = await axios.post(`${API_URL}/auth/student/register`, testStudent);
    
    console.log('✅ Registration API call successful');
    console.log('\n📦 Response structure:');
    console.log('   success:', response.data.success);
    console.log('   message:', response.data.message);
    console.log('   token:', response.data.token ? '✓ Present' : '✗ Missing');
    
    // THIS IS THE CRITICAL CHECK
    console.log('\n🔍 CRITICAL: Check response field names:');
    console.log('   response.data.user:', response.data.user ? '✓ Present' : '✗ Missing');
    console.log('   response.data.student:', response.data.student ? '✓ Present' : '✗ Missing');
    
    if (response.data.user) {
      console.log('\n   ✅ Backend returns: response.data.user');
      console.log('   User data:', JSON.stringify(response.data.user, null, 2));
    }
    
    if (response.data.student) {
      console.log('\n   ✅ Backend returns: response.data.student');
      console.log('   Student data:', JSON.stringify(response.data.student, null, 2));
    }
    
    if (!response.data.user && !response.data.student) {
      console.log('\n   ❌ Neither user nor student field present!');
    }
    
    return response.data;
  } catch (error) {
    console.log('❌ Registration failed!');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data.message);
    } else {
      console.log('   Error:', error.message);
    }
    return null;
  }
}

async function step5_checkDatabaseWrite() {
  console.log('\n📍 STEP 5: Verify student was saved in database');
  console.log('-'.repeat(70));
  
  try {
    const Student = mongoose.model('Student', new mongoose.Schema({
      rollNumber: String,
      fullName: String,
      password: String,
      email: String,
      department: String
    }));
    
    const student = await Student.findOne({ rollNumber: testStudent.rollNumber });
    
    if (!student) {
      console.log('❌ Student NOT found in database!');
      return null;
    }
    
    console.log('✅ Student found in database');
    console.log('   Roll Number:', student.rollNumber);
    console.log('   Full Name:', student.fullName);
    console.log('   Email:', student.email);
    console.log('   Department:', student.department);
    
    // Check if password is hashed
    console.log('\n🔐 Password check:');
    console.log('   Stored password:', student.password);
    console.log('   Original password:', testStudent.password);
    
    if (student.password === testStudent.password) {
      console.log('   ❌ PASSWORD IS PLAIN TEXT! (Security issue)');
    } else if (student.password.startsWith('$2a$') || student.password.startsWith('$2b$')) {
      console.log('   ✅ Password is hashed (bcrypt)');
    } else {
      console.log('   ⚠️  Password format unknown');
    }
    
    return student;
  } catch (error) {
    console.log('❌ Error checking database:', error.message);
    return null;
  }
}

async function step6_testLogin() {
  console.log('\n📍 STEP 6: Test login API');
  console.log('-'.repeat(70));
  console.log('Logging in with:', testStudent.rollNumber);
  
  try {
    const response = await axios.post(`${API_URL}/auth/student/login`, {
      rollNumber: testStudent.rollNumber,
      password: testStudent.password
    });
    
    console.log('✅ Login successful!');
    console.log('\n📦 Response structure:');
    console.log('   success:', response.data.success);
    console.log('   message:', response.data.message);
    console.log('   token:', response.data.token ? '✓ Present' : '✗ Missing');
    
    // THIS IS THE CRITICAL CHECK
    console.log('\n🔍 CRITICAL: Check response field names:');
    console.log('   response.data.user:', response.data.user ? '✓ Present' : '✗ Missing');
    console.log('   response.data.student:', response.data.student ? '✓ Present' : '✗ Missing');
    
    if (response.data.user) {
      console.log('\n   ✅ Backend returns: response.data.user');
      console.log('   User data:', JSON.stringify(response.data.user, null, 2));
    }
    
    if (response.data.student) {
      console.log('\n   ✅ Backend returns: response.data.student');
      console.log('   Student data:', JSON.stringify(response.data.student, null, 2));
    }
    
    return response.data;
  } catch (error) {
    console.log('❌ Login failed!');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data.message);
      
      if (error.response.status === 404) {
        console.log('\n   💡 Student not found in database');
      } else if (error.response.status === 401) {
        console.log('\n   💡 Password mismatch - bcrypt.compare failed');
      }
    } else {
      console.log('   Error:', error.message);
    }
    return null;
  }
}

async function step7_testPasswordComparison() {
  console.log('\n📍 STEP 7: Manual password comparison test');
  console.log('-'.repeat(70));
  
  try {
    const bcrypt = require('bcryptjs');
    const Student = mongoose.model('Student', new mongoose.Schema({
      rollNumber: String,
      password: String,
      comparePassword: async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
      }
    }));
    
    const student = await Student.findOne({ rollNumber: testStudent.rollNumber });
    
    if (!student) {
      console.log('❌ Student not found');
      return false;
    }
    
    console.log('Testing password comparison:');
    console.log('   Input password:', testStudent.password);
    console.log('   Stored hash:', student.password);
    
    // Test with bcrypt directly
    const isMatch = await bcrypt.compare(testStudent.password, student.password);
    console.log('   bcrypt.compare result:', isMatch);
    
    if (isMatch) {
      console.log('   ✅ Password comparison works!');
    } else {
      console.log('   ❌ Password comparison failed!');
      console.log('\n   Possible causes:');
      console.log('   - Password was not hashed during registration');
      console.log('   - Different password was used');
      console.log('   - Hash algorithm mismatch');
    }
    
    return isMatch;
  } catch (error) {
    console.log('❌ Error testing password:', error.message);
    return false;
  }
}

async function runDebug() {
  try {
    // Step 1: Check backend
    const backendOk = await step1_checkBackend();
    if (!backendOk) {
      process.exit(1);
    }
    
    // Step 2: Check database
    const dbOk = await step2_checkDatabase();
    if (!dbOk) {
      process.exit(1);
    }
    
    // Step 3: Clean up
    await step3_deleteExistingStudent();
    
    // Step 4: Test registration
    const regResponse = await step4_testRegistration();
    if (!regResponse) {
      console.log('\n❌ Registration failed - cannot continue');
      process.exit(1);
    }
    
    // Step 5: Check database write
    const dbStudent = await step5_checkDatabaseWrite();
    if (!dbStudent) {
      console.log('\n❌ Student not in database - cannot continue');
      process.exit(1);
    }
    
    // Step 6: Test login
    const loginResponse = await step6_testLogin();
    
    // Step 7: Manual password test
    await step7_testPasswordComparison();
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 DEBUGGING SUMMARY');
    console.log('='.repeat(70));
    
    console.log('\n🔍 FIELD NAME MISMATCH CHECK:');
    console.log('   Registration response has "user":', regResponse.user ? '✓' : '✗');
    console.log('   Registration response has "student":', regResponse.student ? '✓' : '✗');
    console.log('   Login response has "user":', loginResponse?.user ? '✓' : '✗');
    console.log('   Login response has "student":', loginResponse?.student ? '✓' : '✗');
    
    console.log('\n🎯 DIAGNOSIS:');
    if (regResponse.user && !regResponse.student) {
      console.log('   ❌ BUG FOUND: Backend returns "user" but frontend expects "student"');
      console.log('   📝 Fix: Change backend to return "student" field');
    } else if (regResponse.student && !regResponse.user) {
      console.log('   ✅ Backend correctly returns "student" field');
    }
    
    if (loginResponse) {
      console.log('   ✅ Login works after registration');
    } else {
      console.log('   ❌ Login fails after registration');
    }
    
    console.log('\n');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Debug script error:', error);
    process.exit(1);
  }
}

runDebug();
