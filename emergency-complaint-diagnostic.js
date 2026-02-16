/**
 * EMERGENCY DIAGNOSTIC: Student Complaint Visibility
 * 
 * This will test the COMPLETE flow and identify the exact issue
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const API_BASE = 'http://localhost:3001/api';

async function emergencyDiagnostic() {
  console.log('='.repeat(80));
  console.log('EMERGENCY DIAGNOSTIC: STUDENT COMPLAINT VISIBILITY');
  console.log('='.repeat(80));
  console.log('');
  
  let studentToken, adminToken, complaintId, studentId;
  
  try {
    // STEP 1: Test Backend Connection
    console.log('1️⃣ Testing Backend Connection...');
    try {
      const health = await axios.get(`${API_BASE}/health`);
      console.log('   ✅ Backend is running');
      console.log(`   Database: ${health.data.database}`);
    } catch (err) {
      console.log('   ❌ Backend is NOT running!');
      console.log('   Please start backend: cd backend && npm start');
      return;
    }
    console.log('');
    
    // STEP 2: Student Login
    console.log('2️⃣ Student Login...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        userType: 'student',
        rollNumber: 'CS2021001',
        password: 'password123'
      });
      
      studentToken = loginResponse.data.token;
      studentId = loginResponse.data.student.id;
      
      console.log('   ✅ Login successful');
      console.log(`   Student ID: ${studentId}`);
      console.log(`   Student Name: ${loginResponse.data.student.fullName}`);
      console.log(`   Token: ${studentToken.substring(0, 30)}...`);
      
      // Decode token
      const payload = JSON.parse(Buffer.from(studentToken.split('.')[1], 'base64').toString());
      console.log(`   Token Payload: userId=${payload.userId}, role=${payload.role}`);
    } catch (err) {
      console.log('   ❌ Login failed:', err.response?.data?.message || err.message);
      return;
    }
    console.log('');
    
    // STEP 3: Create Complaint
    console.log('3️⃣ Creating Test Complaint...');
    try {
      const createResponse = await axios.post(
        `${API_BASE}/complaints`,
        {
          title: 'EMERGENCY TEST - Complaint Visibility',
          description: 'Testing if complaints show up in student dashboard',
          category: 'Infrastructure',
          priority: 'high'
        },
        {
          headers: { Authorization: `Bearer ${studentToken}` }
        }
      );
      
      complaintId = createResponse.data.data._id;
      
      console.log('   ✅ Complaint created successfully');
      console.log(`   Complaint ID: ${createResponse.data.data.complaintId}`);
      console.log(`   MongoDB _id: ${complaintId}`);
      console.log(`   Status: ${createResponse.data.data.status}`);
      console.log(`   Student field: ${createResponse.data.data.student}`);
    } catch (err) {
      console.log('   ❌ Create failed:', err.response?.data?.message || err.message);
      console.log('   Full error:', err.response?.data);
      return;
    }
    console.log('');
    
    // STEP 4: Direct Database Check
    console.log('4️⃣ Checking Database Directly...');
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_campus_db');
      const Complaint = require('./backend/models/Complaint');
      
      const dbComplaint = await Complaint.findById(complaintId);
      
      if (dbComplaint) {
        console.log('   ✅ Complaint exists in database');
        console.log(`   Student field: ${dbComplaint.student}`);
        console.log(`   Student field type: ${typeof dbComplaint.student}`);
        console.log(`   Expected student ID: ${studentId}`);
        console.log(`   Match: ${dbComplaint.student.toString() === studentId ? '✅' : '❌'}`);
      } else {
        console.log('   ❌ Complaint NOT found in database!');
      }
      
      // Check all complaints for this student
      const allStudentComplaints = await Complaint.find({ student: studentId });
      console.log(`   Total complaints for student: ${allStudentComplaints.length}`);
      
    } catch (err) {
      console.log('   ❌ Database check failed:', err.message);
    }
    console.log('');
    
    // STEP 5: Test GET /api/complaints
    console.log('5️⃣ Testing GET /api/complaints...');
    try {
      const getResponse = await axios.get(`${API_BASE}/complaints`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      
      console.log('   ✅ Request successful');
      console.log(`   Status: ${getResponse.status}`);
      console.log(`   Response structure:`, Object.keys(getResponse.data));
      console.log(`   Success: ${getResponse.data.success}`);
      console.log(`   Count: ${getResponse.data.count}`);
      console.log(`   Data length: ${getResponse.data.data?.length || 0}`);
      
      if (getResponse.data.data && getResponse.data.data.length > 0) {
        console.log('   ✅ Complaints found!');
        getResponse.data.data.forEach((c, i) => {
          console.log(`   ${i + 1}. ${c.complaintId} - ${c.title} (${c.status})`);
        });
      } else {
        console.log('   ❌ NO COMPLAINTS RETURNED!');
        console.log('   This is the problem - API returns empty array');
      }
    } catch (err) {
      console.log('   ❌ Request failed');
      console.log(`   Status: ${err.response?.status}`);
      console.log(`   Message: ${err.response?.data?.message}`);
      console.log(`   Full response:`, err.response?.data);
    }
    console.log('');
    
    // STEP 6: Test GET /api/complaints/my
    console.log('6️⃣ Testing GET /api/complaints/my...');
    try {
      const getMyResponse = await axios.get(`${API_BASE}/complaints/my`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      
      console.log('   ✅ Request successful');
      console.log(`   Count: ${getMyResponse.data.count}`);
      console.log(`   Data length: ${getMyResponse.data.data?.length || 0}`);
      
      if (getMyResponse.data.data && getMyResponse.data.data.length > 0) {
        console.log('   ✅ Complaints found via /my endpoint!');
      } else {
        console.log('   ❌ NO COMPLAINTS via /my endpoint either!');
      }
    } catch (err) {
      console.log('   ❌ Request failed:', err.response?.data?.message);
    }
    console.log('');
    
    // STEP 7: Admin Login and Update Status
    console.log('7️⃣ Admin Login and Status Update...');
    try {
      const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
        userType: 'admin',
        email: 'admin@college.edu',
        password: 'admin123'
      });
      
      adminToken = adminLogin.data.token;
      console.log('   ✅ Admin logged in');
      
      // Update complaint status
      await axios.patch(
        `${API_BASE}/complaints/${complaintId}`,
        {
          status: 'Resolved',
          adminRemarks: 'Test resolved by emergency diagnostic'
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      
      console.log('   ✅ Status updated to Resolved');
    } catch (err) {
      console.log('   ❌ Admin operation failed:', err.response?.data?.message);
    }
    console.log('');
    
    // STEP 8: Check if student can see updated status
    console.log('8️⃣ Checking if Student Sees Updated Status...');
    try {
      const finalCheck = await axios.get(`${API_BASE}/complaints`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      
      const updatedComplaint = finalCheck.data.data?.find(c => c._id === complaintId);
      
      if (updatedComplaint) {
        console.log('   ✅ Complaint found!');
        console.log(`   Status: ${updatedComplaint.status}`);
        console.log(`   Admin Remarks: ${updatedComplaint.adminRemarks}`);
      } else {
        console.log('   ❌ Complaint still not visible to student!');
      }
    } catch (err) {
      console.log('   ❌ Check failed:', err.response?.data?.message);
    }
    console.log('');
    
    // STEP 9: Analyze Controller Code
    console.log('9️⃣ Analyzing Backend Controller...');
    const fs = require('fs');
    const controllerCode = fs.readFileSync('./backend/controllers/complaintController.js', 'utf8');
    
    // Check getMyComplaints function
    if (controllerCode.includes('req.user?.userId || req.userId')) {
      console.log('   ✅ Controller has fallback for userId');
    } else {
      console.log('   ⚠️ Controller might not handle userId correctly');
    }
    
    if (controllerCode.includes('find({ student: studentId })')) {
      console.log('   ✅ Controller queries by student field');
    } else {
      console.log('   ⚠️ Controller query might be wrong');
    }
    console.log('');
    
    // FINAL DIAGNOSIS
    console.log('='.repeat(80));
    console.log('DIAGNOSIS SUMMARY');
    console.log('='.repeat(80));
    console.log('');
    
    if (mongoose.connection.readyState === 1) {
      const Complaint = require('./backend/models/Complaint');
      const dbCount = await Complaint.countDocuments({ student: studentId });
      
      console.log(`Database has ${dbCount} complaints for student ${studentId}`);
      console.log(`API returns ${0} complaints (if this is the issue)`);
      console.log('');
      
      if (dbCount > 0) {
        console.log('❌ PROBLEM IDENTIFIED:');
        console.log('   Complaints exist in database but API returns empty array');
        console.log('');
        console.log('POSSIBLE CAUSES:');
        console.log('   1. Middleware not setting req.userId correctly');
        console.log('   2. Controller reading wrong field');
        console.log('   3. Query filter not matching');
        console.log('   4. Population failing silently');
      }
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

// Run diagnostic
emergencyDiagnostic();
