/**
 * Test Script: Student Complaint Visibility Fix
 * 
 * This script verifies that:
 * 1. Student can create complaints
 * 2. Student can view their own complaints via /complaints/my
 * 3. Student CANNOT access admin route /complaints
 * 4. Admin can still access all complaints
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test credentials
const STUDENT_CREDENTIALS = {
  email: 'student@test.com',
  password: 'student123'
};

const ADMIN_CREDENTIALS = {
  email: 'admin@test.com',
  password: 'admin123'
};

let studentToken = '';
let adminToken = '';
let testComplaintId = '';

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function loginStudent() {
  logSection('TEST 1: Student Login');
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, STUDENT_CREDENTIALS);
    studentToken = response.data.token;
    log('✓ Student login successful', 'green');
    log(`  Token: ${studentToken.substring(0, 20)}...`, 'blue');
    log(`  Role: ${response.data.user.role}`, 'blue');
    return true;
  } catch (error) {
    log('✗ Student login failed', 'red');
    log(`  Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function loginAdmin() {
  logSection('TEST 2: Admin Login');
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, ADMIN_CREDENTIALS);
    adminToken = response.data.token;
    log('✓ Admin login successful', 'green');
    log(`  Token: ${adminToken.substring(0, 20)}...`, 'blue');
    log(`  Role: ${response.data.user.role}`, 'blue');
    return true;
  } catch (error) {
    log('✗ Admin login failed', 'red');
    log(`  Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function createComplaint() {
  logSection('TEST 3: Student Creates Complaint');
  try {
    const complaintData = {
      title: 'Test Complaint - Visibility Fix',
      description: 'Testing student complaint visibility after fix',
      category: 'IT Services',
      priority: 'medium'
    };
    
    const response = await axios.post(
      `${API_BASE}/complaints`,
      complaintData,
      {
        headers: { Authorization: `Bearer ${studentToken}` }
      }
    );
    
    testComplaintId = response.data.data._id;
    log('✓ Complaint created successfully', 'green');
    log(`  Complaint ID: ${response.data.data.complaintId}`, 'blue');
    log(`  MongoDB ID: ${testComplaintId}`, 'blue');
    log(`  Status: ${response.data.data.status}`, 'blue');
    return true;
  } catch (error) {
    log('✗ Complaint creation failed', 'red');
    log(`  Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function studentAccessMyComplaints() {
  logSection('TEST 4: Student Access /complaints/my (SHOULD WORK)');
  try {
    const response = await axios.get(
      `${API_BASE}/complaints/my`,
      {
        headers: { Authorization: `Bearer ${studentToken}` }
      }
    );
    
    log('✓ Student can access their complaints', 'green');
    log(`  Total complaints: ${response.data.count}`, 'blue');
    
    if (response.data.data.length > 0) {
      log(`  Latest complaint:`, 'blue');
      log(`    - ID: ${response.data.data[0].complaintId}`, 'blue');
      log(`    - Title: ${response.data.data[0].title}`, 'blue');
      log(`    - Status: ${response.data.data[0].status}`, 'blue');
    }
    
    return true;
  } catch (error) {
    log('✗ Student cannot access their complaints', 'red');
    log(`  Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function studentAccessAllComplaints() {
  logSection('TEST 5: Student Access /complaints (SHOULD FAIL)');
  try {
    await axios.get(
      `${API_BASE}/complaints`,
      {
        headers: { Authorization: `Bearer ${studentToken}` }
      }
    );
    
    log('✗ SECURITY ISSUE: Student can access admin route!', 'red');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      log('✓ Student correctly blocked from admin route', 'green');
      log(`  Error message: ${error.response.data.message}`, 'blue');
      return true;
    } else {
      log('✗ Unexpected error', 'yellow');
      log(`  Error: ${error.response?.data?.message || error.message}`, 'yellow');
      return false;
    }
  }
}

async function adminAccessAllComplaints() {
  logSection('TEST 6: Admin Access /complaints (SHOULD WORK)');
  try {
    const response = await axios.get(
      `${API_BASE}/complaints`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    log('✓ Admin can access all complaints', 'green');
    log(`  Total complaints: ${response.data.count}`, 'blue');
    
    // Find our test complaint
    const testComplaint = response.data.data.find(c => c._id === testComplaintId);
    if (testComplaint) {
      log(`  Test complaint found in admin view:`, 'blue');
      log(`    - ID: ${testComplaint.complaintId}`, 'blue');
      log(`    - Student: ${testComplaint.studentName}`, 'blue');
      log(`    - Status: ${testComplaint.status}`, 'blue');
    }
    
    return true;
  } catch (error) {
    log('✗ Admin cannot access complaints', 'red');
    log(`  Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n🚀 Starting Student Complaint Visibility Tests', 'cyan');
  log('Testing the fix for: "Student cannot see their own complaints"', 'yellow');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 6
  };
  
  // Run tests
  if (await loginStudent()) results.passed++; else results.failed++;
  if (await loginAdmin()) results.passed++; else results.failed++;
  if (await createComplaint()) results.passed++; else results.failed++;
  if (await studentAccessMyComplaints()) results.passed++; else results.failed++;
  if (await studentAccessAllComplaints()) results.passed++; else results.failed++;
  if (await adminAccessAllComplaints()) results.passed++; else results.failed++;
  
  // Summary
  logSection('TEST SUMMARY');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.failed === 0) {
    log('\n✓ ALL TESTS PASSED! Student complaint visibility is fixed!', 'green');
    log('\nWhat was fixed:', 'cyan');
    log('  1. Frontend now calls /complaints/my instead of /complaints', 'blue');
    log('  2. Student route uses authorizeStudent middleware', 'blue');
    log('  3. Admin route uses authorizeAdmin middleware', 'blue');
    log('  4. No security weakened - role protection intact', 'blue');
  } else {
    log('\n✗ SOME TESTS FAILED - Please check the errors above', 'red');
  }
  
  console.log('\n');
}

// Run the tests
runTests().catch(error => {
  log('\n✗ Test execution failed', 'red');
  console.error(error);
  process.exit(1);
});
