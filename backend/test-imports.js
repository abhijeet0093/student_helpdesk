/**
 * Test imports to find undefined values
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

console.log('Testing middleware imports...');
const middleware = require('./middleware/authMiddleware');
console.log('middleware:', Object.keys(middleware));
console.log('verifyStudent:', typeof middleware.verifyStudent);
console.log('verifyAdmin:', typeof middleware.verifyAdmin);

const { verifyStudent, verifyAdmin } = middleware;
console.log('\nAfter destructuring:');
console.log('verifyStudent:', typeof verifyStudent);
console.log('verifyAdmin:', typeof verifyAdmin);

console.log('\nTesting controller imports...');
const controller = require('./controllers/complaintController');
console.log('controller:', Object.keys(controller));
console.log('createComplaint:', typeof controller.createComplaint);
console.log('getMyComplaints:', typeof controller.getMyComplaints);
console.log('getComplaintById:', typeof controller.getComplaintById);
console.log('getAllComplaints:', typeof controller.getAllComplaints);
console.log('updateComplaintStatus:', typeof controller.updateComplaintStatus);

const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus
} = controller;

console.log('\nAfter destructuring:');
console.log('createComplaint:', typeof createComplaint);
console.log('getMyComplaints:', typeof getMyComplaints);
console.log('getComplaintById:', typeof getComplaintById);
console.log('getAllComplaints:', typeof getAllComplaints);
console.log('updateComplaintStatus:', typeof updateComplaintStatus);

console.log('\nAll values:');
console.log('verifyStudent:', verifyStudent);
console.log('verifyAdmin:', verifyAdmin);
console.log('createComplaint:', createComplaint);
console.log('getMyComplaints:', getMyComplaints);
console.log('getComplaintById:', getComplaintById);
console.log('getAllComplaints:', getAllComplaints);
console.log('updateComplaintStatus:', updateComplaintStatus);
