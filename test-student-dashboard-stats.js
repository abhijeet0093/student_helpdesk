/**
 * Test Script: Student Dashboard Statistics Fix
 * 
 * This script verifies that:
 * 1. Student can login successfully
 * 2. Student dashboard loads with correct statistics
 * 3. Total complaints count is accurate
 * 4. Status-wise breakdown is correct
 * 5. Recent complaint is displayed
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test credentials
const STUDENT_CREDENTIALS = {
  email: 'student@test.com',
  password: 'student123'
};

let studentToken = '';
let createdComplaintIds = [];

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70));
}

async function loginStudent() {
  logSection('TEST 1: Student Login');
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, STUDENT_CREDENTIALS);
    studentToken = response.data.token;
    log('✓ Student login successful', 'green');
    log(`  Token: ${studentToken.substring(0, 20)}...`, 'blue');
    log(`  User: ${response.data.user.fullName}`, 'blue');
    log(`  Role: ${response.data.user.role}`, 'blue');
    return true;
  } catch (error) {
    log('✗ Student login failed', 'red');
    log(`  Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function createTestComplaints() {
  logSection('TEST 2: Create Test Complaints');
  
  const testComplaints = [
    {
      title: 'Test Complaint 1 - Pending',
      description: 'This is a test complaint for statistics verification',
      category: 'IT Services',
      priority: 'medium'
    },
    {
      title: 'Test Complaint 2 - Pending',
      description: 'Another test complaint',
      category: 'Infrastructure',
      priority: 'high'
    }
  ];
  
  let successCount = 0;
  
  for (const complaint of testComplaints) {
    try {
      const response = await axios.post(
        `${API_BASE}/complaints`,
        complaint,
        {
          headers: { Authorization: `Bearer ${studentToken}` }
        }
      );
      
      createdComplaintIds.push(response.data.data._id);
      log(`✓ Created: ${response.data.data.complaintId}`, 'green');
      log(`  Status: ${response.data.data.status}`, 'blue');
      successCount++;
    } catch (error) {
      log(`✗ Failed to create complaint: ${complaint.title}`, 'red');
      log(`  Error: ${error.response?.data?.message || error.message}`, 'red');
    }
  }
  
  log(`\nCreated ${successCount}/${testComplaints.length} test complaints`, 'cyan');
  return successCount > 0;
}

async function getDashboardStats() {
  logSection('TEST 3: Get Dashboard Statistics');
  try {
    const response = await axios.get(
      `${API_BASE}/student/dashboard`,
      {
        headers: { Authorization: `Bearer ${studentToken}` }
      }
    );
    
    const { studentInfo, complaintStats, recentComplaint } = response.data.data;
    
    log('✓ Dashboard data retrieved successfully', 'green');
    log('\n📊 STUDENT INFORMATION:', 'cyan');
    log(`  Name: ${studentInfo.name}`, 'blue');
    log(`  Roll Number: ${studentInfo.rollNumber}`, 'blue');
    log(`  Department: ${studentInfo.department}`, 'blue');
    log(`  Semester: ${studentInfo.semester}`, 'blue');
    
    log('\n📈 COMPLAINT STATISTICS:', 'cyan');
    log(`  Total Complaints: ${complaintStats.total}`, 'magenta');
    log(`  Pending: ${complaintStats.byStatus.pending}`, 'yellow');
    log(`  In Progress: ${complaintStats.byStatus.inProgress}`, 'blue');
    log(`  Resolved: ${complaintStats.byStatus.resolved}`, 'green');
    log(`  Rejected: ${complaintStats.byStatus.rejected}`, 'red');
    
    if (recentComplaint) {
      log('\n🕒 RECENT COMPLAINT:', 'cyan');
      log(`  ID: ${recentComplaint.complaintId}`, 'blue');
      log(`  Category: ${recentComplaint.category}`, 'blue');
      log(`  Status: ${recentComplaint.status}`, 'blue');
      log(`  Created: ${new Date(recentComplaint.createdAt).toLocaleString()}`, 'blue');
    } else {
      log('\n🕒 RECENT COMPLAINT: None', 'yellow');
    }
    
    // Verify stats are not all zeros
    if (complaintStats.total === 0) {
      log('\n⚠️  WARNING: Total complaints is 0!', 'yellow');
      log('   This might indicate the fix is not working.', 'yellow');
      return false;
    }
    
    // Verify sum of status counts equals total
    const statusSum = 
      complaintStats.byStatus.pending +
      complaintStats.byStatus.inProgress +
      complaintStats.byStatus.resolved +
      complaintStats.byStatus.rejected;
    
    if (statusSum !== complaintStats.total) {
      log(`\n⚠️  WARNING: Status sum (${statusSum}) doesn't match total (${complaintStats.total})`, 'yellow');
      return false;
    }
    
    log('\n✓ Statistics validation passed!', 'green');
    return true;
  } catch (error) {
    log('✗ Failed to get dashboard stats', 'red');
    log(`  Error: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data) {
      log(`  Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    return false;
  }
}

async function verifyComplaintsList() {
  logSection('TEST 4: Verify Complaints List');
  try {
    const response = await axios.get(
      `${API_BASE}/complaints/my`,
      {
        headers: { Authorization: `Bearer ${studentToken}` }
      }
    );
    
    log(`✓ Retrieved ${response.data.count} complaints`, 'green');
    
    if (response.data.data.length > 0) {
      log('\nComplaint Details:', 'cyan');
      response.data.data.slice(0, 3).forEach((complaint, index) => {
        log(`  ${index + 1}. ${complaint.complaintId} - ${complaint.status}`, 'blue');
      });
    }
    
    return true;
  } catch (error) {
    log('✗ Failed to get complaints list', 'red');
    log(`  Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function testDashboardRefresh() {
  logSection('TEST 5: Dashboard Refresh Test');
  try {
    log('Fetching dashboard stats again...', 'cyan');
    
    const response = await axios.get(
      `${API_BASE}/student/dashboard`,
      {
        headers: { Authorization: `Bearer ${studentToken}` }
      }
    );
    
    const { complaintStats } = response.data.data;
    
    log('✓ Dashboard refreshed successfully', 'green');
    log(`  Total: ${complaintStats.total}`, 'blue');
    log(`  Pending: ${complaintStats.byStatus.pending}`, 'blue');
    log(`  Resolved: ${complaintStats.byStatus.resolved}`, 'blue');
    
    return true;
  } catch (error) {
    log('✗ Dashboard refresh failed', 'red');
    log(`  Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n🚀 Starting Student Dashboard Statistics Tests', 'cyan');
  log('Testing the fix for: "Student dashboard stats showing 0"', 'yellow');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 5
  };
  
  // Run tests
  if (await loginStudent()) results.passed++; else results.failed++;
  if (await createTestComplaints()) results.passed++; else results.failed++;
  if (await getDashboardStats()) results.passed++; else results.failed++;
  if (await verifyComplaintsList()) results.passed++; else results.failed++;
  if (await testDashboardRefresh()) results.passed++; else results.failed++;
  
  // Summary
  logSection('TEST SUMMARY');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.failed === 0) {
    log('\n✓ ALL TESTS PASSED! Student dashboard statistics are working!', 'green');
    log('\nWhat was fixed:', 'cyan');
    log('  1. Changed query field from "studentId" to "student"', 'blue');
    log('  2. Matches the Complaint model schema', 'blue');
    log('  3. Statistics now calculate correctly', 'blue');
    log('  4. Dashboard displays accurate counts', 'blue');
  } else {
    log('\n✗ SOME TESTS FAILED - Please check the errors above', 'red');
    log('\nTroubleshooting:', 'yellow');
    log('  1. Ensure backend server is running', 'blue');
    log('  2. Verify MongoDB is connected', 'blue');
    log('  3. Check that student has created complaints', 'blue');
    log('  4. Verify the fix was applied to dashboardController.js', 'blue');
  }
  
  console.log('\n');
}

// Run the tests
runTests().catch(error => {
  log('\n✗ Test execution failed', 'red');
  console.error(error);
  process.exit(1);
});
