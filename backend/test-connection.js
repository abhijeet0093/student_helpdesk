/**
 * Quick Diagnostic Script
 * Run this to check if everything is configured correctly
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('🔍 Running diagnostics...\n');

// Test 1: Check environment variables
console.log('1️⃣ Checking environment variables:');
console.log('   PORT:', process.env.PORT || '❌ Not set');
console.log('   MONGODB_URI:', process.env.MONGODB_URI || '❌ Not set');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || '❌ Not set');
console.log('');

// Test 2: Try to connect to MongoDB
console.log('2️⃣ Testing MongoDB connection...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('   ✅ MongoDB connected successfully!');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    console.log('');
    
    // Test 3: Check if collections exist
    console.log('3️⃣ Checking database collections:');
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.log('   ❌ Error listing collections:', err.message);
      } else {
        if (collections.length === 0) {
          console.log('   ⚠️  No collections found. Database is empty!');
          console.log('   Run seed scripts to populate data.');
        } else {
          console.log('   Found collections:');
          collections.forEach(col => {
            console.log('   -', col.name);
          });
        }
      }
      console.log('');
      
      // Test 4: Check if admin exists
      console.log('4️⃣ Checking if admin user exists:');
      const Admin = require('./models/Admin');
      Admin.findOne({ username: 'admin' })
        .then(admin => {
          if (admin) {
            console.log('   ✅ Admin user found:', admin.username);
          } else {
            console.log('   ❌ Admin user not found!');
            console.log('   Run: node scripts/seedAdmin.js');
          }
          console.log('');
          
          // Test 5: Check if students exist
          console.log('5️⃣ Checking if students exist:');
          const Student = require('./models/Student');
          Student.countDocuments()
            .then(count => {
              if (count > 0) {
                console.log('   ✅ Found', count, 'student(s)');
                
                // Show first student
                Student.findOne().then(student => {
                  if (student) {
                    console.log('   Sample student:');
                    console.log('   - Roll Number:', student.rollNumber);
                    console.log('   - Name:', student.fullName);
                  }
                  
                  console.log('');
                  console.log('✅ All checks complete!');
                  console.log('');
                  console.log('📝 Summary:');
                  console.log('   - MongoDB: Connected');
                  console.log('   - Database: Has data');
                  console.log('   - Ready to start server!');
                  console.log('');
                  console.log('🚀 Run: npm start');
                  
                  process.exit(0);
                });
              } else {
                console.log('   ⚠️  No students found!');
                console.log('   Register a new student or seed test data.');
                console.log('');
                console.log('⚠️  Database needs data!');
                console.log('');
                console.log('Run these commands:');
                console.log('   node scripts/seedAdmin.js');
                console.log('   node scripts/seedStaff.js');
                
                process.exit(0);
              }
            })
            .catch(err => {
              console.log('   ❌ Error checking students:', err.message);
              process.exit(1);
            });
        })
        .catch(err => {
          console.log('   ❌ Error checking admin:', err.message);
          process.exit(1);
        });
    });
  })
  .catch((err) => {
    console.log('   ❌ MongoDB connection failed!');
    console.log('   Error:', err.message);
    console.log('');
    console.log('💡 Solutions:');
    console.log('   1. Make sure MongoDB is running:');
    console.log('      Windows: net start MongoDB');
    console.log('      Mac: brew services start mongodb-community');
    console.log('      Linux: sudo systemctl start mongod');
    console.log('');
    console.log('   2. Or use MongoDB Atlas (cloud):');
    console.log('      - Sign up at https://www.mongodb.com/cloud/atlas');
    console.log('      - Create a cluster');
    console.log('      - Update MONGODB_URI in .env file');
    console.log('');
    process.exit(1);
  });
