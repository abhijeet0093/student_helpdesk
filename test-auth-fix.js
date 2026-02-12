/**
 * TEST AUTHENTICATION FIX
 * Quick test to verify the bug is fixed
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

const testStudent = {
  rollNumber: 'CS2024001',
  enrollmentNumber: 'EN2024CS001',
  fullName: 'RAHUL KUMAR SHARMA',
  dateOfBirth: '2003-05-15',
  password: 'TestPassword123'
};

console.log('🧪 TESTING AUTHENTICATION FIX\n');

async function testFix() {
  try {
    // Test 1: Check backend
    console.log('1️⃣ Checking backend...');
    try {
      await axios.get(`${API_URL}/health`);
      console.log('   ✅ Backend is running\n');
    } catch (error) {
      console.log('   ❌ Backend is NOT running!');
      console.log('   Fix: cd backend && npm start\n');
      return;
    }

    // Test 2: Test registration response structure
    console.log('2️⃣ Testing registration response...');
    try {
      const regResponse = await axios.post(`${API_URL}/auth/student/register`, testStudent);
      
      console.log('   Response structure:');
      console.log('   - success:', regResponse.data.success);
      console.log('   - token:', regResponse.data.token ? '✓' : '✗');
      console.log('   - student:', regResponse.data.student ? '✓' : '✗');
      console.log('   - user:', regResponse.data.user ? '✓' : '✗');
      
      if (regResponse.data.student) {
        console.log('   ✅ FIXED: Backend returns "student" field');
        console.log('   Student data:', regResponse.data.student.rollNumber, '-', regResponse.data.student.fullName);
      } else if (regResponse.data.user) {
        console.log('   ❌ BUG STILL EXISTS: Backend returns "user" instead of "student"');
        console.log('   Action: Make sure you restarted the backend after fixing the code');
      } else {
        console.log('   ❌ ERROR: No user data in response');
      }
      console.log('');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('   ℹ️  Student already registered (this is fine)');
        console.log('   Skipping to login test...\n');
      } else {
        console.log('   ❌ Registration failed:', error.response?.data?.message || error.message);
        console.log('');
      }
    }

    // Test 3: Test login response structure
    console.log('3️⃣ Testing login response...');
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/student/login`, {
        rollNumber: testStudent.rollNumber,
        password: testStudent.password
      });
      
      console.log('   Response structure:');
      console.log('   - success:', loginResponse.data.success);
      console.log('   - token:', loginResponse.data.token ? '✓' : '✗');
      console.log('   - student:', loginResponse.data.student ? '✓' : '✗');
      console.log('   - user:', loginResponse.data.user ? '✓' : '✗');
      
      if (loginResponse.data.student) {
        console.log('   ✅ FIXED: Backend returns "student" field');
        console.log('   Student data:', loginResponse.data.student.rollNumber, '-', loginResponse.data.student.fullName);
      } else if (loginResponse.data.user) {
        console.log('   ❌ BUG STILL EXISTS: Backend returns "user" instead of "student"');
        console.log('   Action: Make sure you restarted the backend after fixing the code');
      } else {
        console.log('   ❌ ERROR: No user data in response');
      }
      console.log('');
    } catch (error) {
      console.log('   ❌ Login failed:', error.response?.data?.message || error.message);
      console.log('');
    }

    // Summary
    console.log('=' .repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(70));
    console.log('\n✅ If you see "student" field in both responses above, the bug is FIXED!');
    console.log('❌ If you see "user" field, you need to:');
    console.log('   1. Make sure the code changes were saved');
    console.log('   2. Restart the backend (Ctrl+C then npm start)');
    console.log('   3. Run this test again\n');
    
    console.log('📝 Next steps:');
    console.log('   1. Test in browser: http://localhost:3000/register');
    console.log('   2. Register a student');
    console.log('   3. Login with the same credentials');
    console.log('   4. Should redirect to dashboard successfully!\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testFix();
