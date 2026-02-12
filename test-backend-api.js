/**
 * Backend API Test Script
 * Tests if login endpoints are working
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

console.log('🧪 Testing Backend API...\n');

// Test 1: Health Check
async function testHealth() {
  console.log('1️⃣ Testing health endpoint...');
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('   ✅ Health check passed');
    console.log('   Response:', response.data.message);
    return true;
  } catch (error) {
    console.log('   ❌ Health check failed');
    console.log('   Error:', error.message);
    console.log('   Make sure backend is running: cd backend && npm start');
    return false;
  }
}

// Test 2: Student Login
async function testStudentLogin() {
  console.log('\n2️⃣ Testing student login...');
  try {
    const response = await axios.post(`${API_URL}/auth/student/login`, {
      rollNumber: 'CS2024001',
      password: 'Test@123'
    });
    console.log('   ✅ Student login successful');
    console.log('   Student:', response.data.user?.fullName || response.data.student?.fullName);
    console.log('   Token received:', response.data.token ? 'Yes' : 'No');
    return true;
  } catch (error) {
    console.log('   ❌ Student login failed');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data.message);
      
      if (error.response.status === 404) {
        console.log('\n   💡 Fix: Student not found in database');
        console.log('   Run: cd backend && node scripts/seedAdmin.js');
        console.log('   Or register a new student first');
      }
    } else {
      console.log('   Error:', error.message);
    }
    return false;
  }
}

// Test 3: Admin Login
async function testAdminLogin() {
  console.log('\n3️⃣ Testing admin login...');
  try {
    const response = await axios.post(`${API_URL}/auth/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });
    console.log('   ✅ Admin login successful');
    console.log('   Admin:', response.data.user?.username || response.data.admin?.username);
    console.log('   Token received:', response.data.token ? 'Yes' : 'No');
    return true;
  } catch (error) {
    console.log('   ❌ Admin login failed');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data.message);
      
      if (error.response.status === 404) {
        console.log('\n   💡 Fix: Admin not found in database');
        console.log('   Run: cd backend && node scripts/seedAdmin.js');
      }
    } else {
      console.log('   Error:', error.message);
    }
    return false;
  }
}

// Test 4: Staff Login
async function testStaffLogin() {
  console.log('\n4️⃣ Testing staff login...');
  try {
    const response = await axios.post(`${API_URL}/auth/staff/login`, {
      email: 'rajesh.staff@college.edu',
      password: 'staff123'
    });
    console.log('   ✅ Staff login successful');
    console.log('   Staff:', response.data.user?.name || response.data.staff?.name);
    console.log('   Token received:', response.data.token ? 'Yes' : 'No');
    return true;
  } catch (error) {
    console.log('   ❌ Staff login failed');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data.message);
      
      if (error.response.status === 404) {
        console.log('\n   💡 Fix: Staff not found in database');
        console.log('   Run: cd backend && node scripts/seedStaff.js');
      }
    } else {
      console.log('   Error:', error.message);
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  const healthOk = await testHealth();
  
  if (!healthOk) {
    console.log('\n❌ Backend is not running. Start it first!');
    console.log('   cd backend');
    console.log('   npm start');
    process.exit(1);
  }

  const studentOk = await testStudentLogin();
  const adminOk = await testAdminLogin();
  const staffOk = await testStaffLogin();

  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log('Health Check:', healthOk ? '✅' : '❌');
  console.log('Student Login:', studentOk ? '✅' : '❌');
  console.log('Admin Login:', adminOk ? '✅' : '❌');
  console.log('Staff Login:', staffOk ? '✅' : '❌');
  console.log('='.repeat(50));

  if (studentOk && adminOk && staffOk) {
    console.log('\n🎉 All tests passed! Backend is working correctly.');
    console.log('\nIf frontend login still fails, check:');
    console.log('1. Browser console (F12) for errors');
    console.log('2. Network tab (F12) to see API calls');
    console.log('3. Make sure frontend is on http://localhost:3000');
  } else {
    console.log('\n⚠️  Some tests failed. Follow the fixes above.');
  }
}

runTests();
