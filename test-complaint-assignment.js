/**
 * Test Complaint Assignment
 * This script tests the complaint assignment functionality
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// Import models
const Complaint = require('./backend/models/Complaint');
const Staff = require('./backend/models/Staff');
const Admin = require('./backend/models/Admin');

async function testAssignment() {
  try {
    console.log('=== TESTING COMPLAINT ASSIGNMENT ===\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_campus_db');
    console.log('✅ Connected to MongoDB\n');

    // 1. Find a complaint
    const complaint = await Complaint.findOne({ status: 'Pending' });
    if (!complaint) {
      console.log('❌ No pending complaints found');
      console.log('Create a complaint first through the UI');
      process.exit(0);
    }
    console.log('✅ Found complaint:');
    console.log('   ID:', complaint._id);
    console.log('   Complaint ID:', complaint.complaintId);
    console.log('   Student:', complaint.studentName);
    console.log('   Status:', complaint.status);
    console.log('');

    // 2. Find a staff member
    const staff = await Staff.findOne();
    if (!staff) {
      console.log('❌ No staff found');
      console.log('Run: node backend/scripts/seedStaff.js');
      process.exit(0);
    }
    console.log('✅ Found staff:');
    console.log('   ID:', staff._id);
    console.log('   Name:', staff.name);
    console.log('   Email:', staff.email);
    console.log('   Department:', staff.department);
    console.log('');

    // 3. Find admin
    const admin = await Admin.findOne();
    if (!admin) {
      console.log('❌ No admin found');
      console.log('Run: node backend/scripts/seedAdmin.js');
      process.exit(0);
    }
    console.log('✅ Found admin:');
    console.log('   ID:', admin._id);
    console.log('   Username:', admin.username);
    console.log('');

    // 4. Test assignment
    console.log('🔄 Assigning complaint to staff...\n');

    complaint.assignedTo = staff._id;
    complaint.assignedToModel = 'Staff';
    complaint.assignedToName = staff.name;
    complaint.status = 'In Progress';
    complaint.lastUpdatedBy = {
      userId: admin._id,
      userModel: 'Admin',
      userName: admin.username,
      timestamp: new Date()
    };

    complaint.statusHistory.push({
      status: 'In Progress',
      changedBy: admin._id,
      changedByModel: 'Admin',
      changedByName: admin.username,
      timestamp: new Date(),
      note: `Assigned to ${staff.name}`
    });

    await complaint.save();

    console.log('✅ Assignment successful!\n');

    // 5. Verify assignment
    const updatedComplaint = await Complaint.findById(complaint._id);
    console.log('📋 Updated Complaint:');
    console.log('   Complaint ID:', updatedComplaint.complaintId);
    console.log('   Status:', updatedComplaint.status);
    console.log('   Assigned To:', updatedComplaint.assignedToName);
    console.log('   Assigned To ID:', updatedComplaint.assignedTo);
    console.log('');

    console.log('✅ TEST PASSED - Assignment works correctly!\n');

    // Test data for frontend
    console.log('=== FRONTEND TEST DATA ===');
    console.log('Use these values in the UI:');
    console.log('Complaint ID:', updatedComplaint.complaintId);
    console.log('Staff ID:', staff._id.toString());
    console.log('');

  } catch (error) {
    console.error('❌ TEST FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

testAssignment();
