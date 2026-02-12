const mongoose = require('mongoose');
const Staff = require('../models/Staff');
require('dotenv').config();

/**
 * Seed Staff Accounts
 * Creates default staff for testing
 */

const seedStaff = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing staff
    await Staff.deleteMany({});
    console.log('Cleared existing staff');
    
    // Create staff members
    const staffMembers = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.staff@college.edu',
        department: 'Computer Science',
        password: 'staff123'  // Will be hashed by pre-save hook
      },
      {
        name: 'Priya Sharma',
        email: 'priya.staff@college.edu',
        department: 'Mechanical Engineering',
        password: 'staff123'
      }
    ];
    
    await Staff.insertMany(staffMembers);
    
    console.log('✅ Staff created successfully!');
    console.log(`\n${staffMembers.length} staff members added:`);
    staffMembers.forEach(staff => {
      console.log(`- ${staff.name} (${staff.email}) - ${staff.department}`);
    });
    
    console.log('\n📝 Login credentials:');
    console.log('   Email: rajesh.staff@college.edu');
    console.log('   Password: staff123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding staff:', error);
    process.exit(1);
  }
};

seedStaff();
