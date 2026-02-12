/**
 * Detailed Route Testing
 */

console.log('🔍 Testing Routes in Detail...\n');

// Load environment
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// Test middleware first
console.log('1️⃣ Testing Middleware...');
const { verifyStudent, verifyAdmin } = require('./middleware/authMiddleware');
console.log('   verifyStudent:', typeof verifyStudent);
console.log('   verifyAdmin:', typeof verifyAdmin);

// Test controller
console.log('\n2️⃣ Testing Controller...');
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus
} = require('./controllers/complaintController');

console.log('   createComplaint:', typeof createComplaint);
console.log('   getMyComplaints:', typeof getMyComplaints);
console.log('   getComplaintById:', typeof getComplaintById);
console.log('   getAllComplaints:', typeof getAllComplaints);
console.log('   updateComplaintStatus:', typeof updateComplaintStatus);

// Test routes
console.log('\n3️⃣ Testing Routes...');
try {
  const express = require('express');
  const router = express.Router();
  
  console.log('   Creating routes...');
  
  // Student Routes
  console.log('   - POST / with verifyStudent and createComplaint');
  router.post('/', verifyStudent, createComplaint);
  
  console.log('   - GET /my with verifyStudent and getMyComplaints');
  router.get('/my', verifyStudent, getMyComplaints);
  
  // Admin Routes
  console.log('   - GET /all with verifyAdmin and getAllComplaints');
  router.get('/all', verifyAdmin, getAllComplaints);
  
  console.log('   - PATCH /:id with verifyAdmin and updateComplaintStatus');
  router.patch('/:id', verifyAdmin, updateComplaintStatus);
  
  // Shared Route
  console.log('   - GET /:id with verifyStudent and getComplaintById');
  router.get('/:id', verifyStudent, getComplaintById);
  
  console.log('\n✅ All routes created successfully!');
} catch (error) {
  console.log('\n❌ Route creation failed:', error.message);
  console.log('Stack:', error.stack);
}
