/**
 * Check Assignment Data
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const Complaint = require('./backend/models/Complaint');
const Staff = require('./backend/models/Staff');
const Admin = require('./backend/models/Admin');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_campus_db');
    console.log('Connected to MongoDB\n');

    // Check complaints
    const complaintCount = await Complaint.countDocuments();
    console.log(`Total Complaints: ${complaintCount}`);
    
    if (complaintCount > 0) {
      const sampleComplaint = await Complaint.findOne();
      console.log('\nSample Complaint:');
      console.log('  _id:', sampleComplaint._id);
      console.log('  complaintId:', sampleComplaint.complaintId);
      console.log('  studentName:', sampleComplaint.studentName);
      console.log('  status:', sampleComplaint.status);
    }

    // Check staff
    const staffCount = await Staff.countDocuments();
    console.log(`\nTotal Staff: ${staffCount}`);
    
    if (staffCount > 0) {
      const sampleStaff = await Staff.findOne();
      console.log('\nSample Staff:');
      console.log('  _id:', sampleStaff._id);
      console.log('  name:', sampleStaff.name);
      console.log('  email:', sampleStaff.email);
    }

    // Check admin
    const adminCount = await Admin.countDocuments();
    console.log(`\nTotal Admins: ${adminCount}`);
    
    if (adminCount > 0) {
      const sampleAdmin = await Admin.findOne();
      console.log('\nSample Admin:');
      console.log('  _id:', sampleAdmin._id);
      console.log('  username:', sampleAdmin.username);
    }

    console.log('\n✅ Data check complete');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkData();
