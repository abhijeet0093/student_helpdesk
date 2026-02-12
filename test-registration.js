/**
 * Test Registration Script
 * Tests if registration API is working
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

console.log('🧪 Testing Student Registration...\n');

// Test data from StudentMaster
const testStudents = [
  {
    rollNumber: 'CS2024001',
    enrollmentNumber: 'EN2024CS001',
    fullName: 'RAHUL KUMAR SHARMA',
    dateOfBirth: '2003-05-15',
    password: 'Test@123'
  },
  {
    rollNumber: 'CS2024002',
    enrollmentNumber: 'EN2024CS002',
    fullName: 'PRIYA SINGH',
    dateOfBirth: '2003-08-20',
    password: 'Test@123'
  }
];

async function testRegistration(studentData, index) {
  console.log(`${index + 1}️⃣ Testing registration for: ${studentData.fullName}`);
  console.log(`   Roll Number: ${studentData.rollNumber}`);
  
  try {
    const response = await axios.post(`${API_URL}/auth/student/register`, studentData);
    
    console.log('   ✅ Registration successful!');
    console.log('   Student:', response.data.user?.fullName || response.data.student?.fullName);
    console.log('   Token received:', response.data.token ? 'Yes' : 'No');
    console.log('');
    return true;
  } catch (error) {
    console.log('   ❌ Registration failed!');
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data.message);
      
      // Provide specific fixes
      if (error.response.status === 404) {
        console.log('\n   💡 Fix: Student not found in StudentMaster');
        console.log('   Run: cd backend && node scripts/seedStudentMaster.js\n');
      } else if (error.response.status === 400) {
        const msg = error.response.data.message;
        if (msg.includes('already exists')) {
          console.log('\n   💡 This student already registered - try logging in instead\n');
        } else if (msg.includes('Name does not match')) {
          console.log('\n   💡 Name must match exactly with StudentMaster');
          console.log('   Check: cd backend && node check-studentmaster.js\n');
        } else if (msg.includes('Date of birth')) {
          console.log('\n   💡 Date of birth must match exactly with StudentMaster');
          console.log('   Check: cd backend && node check-studentmaster.js\n');
        } else {
          console.log('\n   💡 Check the error message above for details\n');
        }
      }
    } else {
      console.log('   Error:', error.message);
      
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n   💡 Backend is not running!');
        console.log('   Fix: cd backend && npm start\n');
      }
    }
    
    return false;
  }
}

async function runTests() {
  console.log('=' .repeat(60));
  console.log('REGISTRATION TEST');
  console.log('=' .repeat(60));
  console.log('');
  
  // Test backend health first
  console.log('0️⃣ Testing backend connection...');
  try {
    await axios.get(`${API_URL}/health`);
    console.log('   ✅ Backend is running\n');
  } catch (error) {
    console.log('   ❌ Backend is NOT running!');
    console.log('\n💡 Fix: cd backend && npm start\n');
    process.exit(1);
  }
  
  // Test registrations
  let successCount = 0;
  for (let i = 0; i < testStudents.length; i++) {
    const success = await testRegistration(testStudents[i], i);
    if (success) successCount++;
  }
  
  console.log('=' .repeat(60));
  console.log('TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Total tests: ${testStudents.length}`);
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${testStudents.length - successCount}`);
  console.log('=' .repeat(60));
  
  if (successCount === testStudents.length) {
    console.log('\n🎉 All registrations successful!');
    console.log('\n📝 You can now login with:');
    testStudents.forEach(s => {
      console.log(`   - Roll Number: ${s.rollNumber}, Password: ${s.password}`);
    });
  } else if (successCount === 0) {
    console.log('\n❌ All registrations failed!');
    console.log('\n🔍 Common issues:');
    console.log('   1. StudentMaster not seeded');
    console.log('      Fix: cd backend && node scripts/seedStudentMaster.js');
    console.log('');
    console.log('   2. MongoDB not connected');
    console.log('      Fix: net start MongoDB');
    console.log('');
    console.log('   3. Students already registered');
    console.log('      Fix: Try logging in instead of registering');
  } else {
    console.log('\n⚠️  Some registrations failed - check errors above');
  }
  
  console.log('');
}

runTests();
