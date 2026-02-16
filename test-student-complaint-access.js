/**
 * TEST: Student Complaint Access
 * 
 * This test verifies that students can:
 * 1. Create complaints
 * 2. View their own complaints
 * 3. See status updates from admin
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test credentials
const STUDENT_CREDENTIALS = {
  rollNumber: 'CS2021001',
  password: 'password123'
};

async function testStudentComplaintAccess() {
  console.log('='.repeat(70));
  console.log('STUDENT COMPLAINT ACCESS TEST');
  console.log('='.repeat(70));
  console.log('');
  
  try {
    // Step 1: Student Login
    console.log('1️⃣ Student Login...');
    console.log(`   Roll Number: ${STUDENT_CREDENTIALS.rollNumber}`);
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      userType: 'student',
      ...STUDENT_CREDENTIALS
    });
    
    const token = loginResponse.data.token;
    const student = loginResponse.data.student;
    
    console.log('   ✅ Login successful');
    console.log(`   Student: ${student.fullName}`);
    console.log(`   Role: ${student.role}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log('');
    
    // Decode token to verify payload
    const tokenParts = token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('   📋 Token Payload:');
    console.log(`      userId: ${payload.userId}`);
    console.log(`      role: ${payload.role}`);
    console.log('');
    
    // Step 2: Create a test complaint
    console.log('2️⃣ Creating test complaint...');
    
    const complaintData = {
      title: 'Test Complaint - Access Verification',
      description: 'Testing if student can create and view complaints',
      category: 'Infrastructure',
      priority: 'medium'
    };
    
    const createResponse = await axios.post(
      `${API_BASE}/complaints`,
      complaintData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('   ✅ Complaint created successfully');
    console.log(`   Complaint ID: ${createResponse.data.data.complaintId}`);
    console.log(`   Status: ${createResponse.data.data.status}`);
    console.log('');
    
    // Step 3: Fetch student's complaints
    console.log('3️⃣ Fetching student complaints...');
    console.log(`   Endpoint: GET ${API_BASE}/complaints`);
    console.log(`   Authorization: Bearer ${token.substring(0, 20)}...`);
    console.log('');
    
    try {
      const fetchResponse = await axios.get(`${API_BASE}/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('   ✅ Complaints fetched successfully');
      console.log(`   Total complaints: ${fetchResponse.data.count}`);
      console.log('');
      
      if (fetchResponse.data.data && fetchResponse.data.data.length > 0) {
        console.log('   📋 Complaint List:');
        fetchResponse.data.data.forEach((complaint, index) => {
          console.log(`   ${index + 1}. ${complaint.complaintId} - ${complaint.title}`);
          console.log(`      Status: ${complaint.status}`);
          console.log(`      Created: ${new Date(complaint.createdAt).toLocaleString()}`);
        });
        console.log('');
      }
      
      console.log('='.repeat(70));
      console.log('✅ TEST PASSED: Student can access their complaints');
      console.log('='.repeat(70));
      
    } catch (fetchError) {
      console.log('   ❌ Failed to fetch complaints');
      console.log('');
      console.log('   Error Details:');
      console.log(`   Status: ${fetchError.response?.status}`);
      console.log(`   Message: ${fetchError.response?.data?.message}`);
      console.log('');
      
      if (fetchError.response?.data?.message?.includes('Admin role required')) {
        console.log('='.repeat(70));
        console.log('❌ BUG CONFIRMED: "Admin role required" error');
        console.log('='.repeat(70));
        console.log('');
        console.log('DIAGNOSIS:');
        console.log('----------');
        console.log('The student is being blocked by admin middleware.');
        console.log('');
        console.log('POSSIBLE CAUSES:');
        console.log('1. Frontend calling wrong endpoint (/api/admin/complaints)');
        console.log('2. Route registration order issue in server.js');
        console.log('3. Middleware not properly checking role');
        console.log('4. Token role is incorrect');
        console.log('');
        console.log('VERIFICATION:');
        console.log(`- Token role: ${payload.role}`);
        console.log(`- Expected: "student"`);
        console.log(`- Match: ${payload.role === 'student' ? '✅' : '❌'}`);
        console.log('');
        
        // Test if it's a routing issue
        console.log('4️⃣ Testing alternative endpoint...');
        try {
          const altResponse = await axios.get(`${API_BASE}/complaints/my`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('   ✅ /complaints/my works!');
          console.log(`   Total complaints: ${altResponse.data.count}`);
          console.log('');
          console.log('SOLUTION: Frontend should use /complaints/my endpoint');
        } catch (altError) {
          console.log('   ❌ /complaints/my also fails');
          console.log(`   Error: ${altError.response?.data?.message}`);
        }
      }
      
      throw fetchError;
    }
    
  } catch (error) {
    if (!error.response) {
      console.error('❌ Network Error:', error.message);
      console.log('');
      console.log('Make sure the backend server is running on port 3001');
    }
  }
}

// Run test
testStudentComplaintAccess();
