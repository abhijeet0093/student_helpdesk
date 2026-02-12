const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

/**
 * Seed Admin Account
 * Creates default admin for testing
 */

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }
    
    // Create admin
    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@college.edu',
      password: 'admin123'  // Will be hashed by pre-save hook
    });
    
    console.log('✅ Admin created successfully!');
    console.log('Username:', admin.username);
    console.log('Password: admin123');
    console.log('\n📝 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
