const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * SEED STUDENTS
 * 
 * CRITICAL RULES:
 * 1. NEVER call API routes - use Model directly
 * 2. Field names MUST match schema EXACTLY
 * 3. Hash passwords manually (bypass pre-save hook for bulk insert)
 * 4. Use valid enum values only
 * 5. Wrap in try-catch with clear error messages
 * 
 * WHY DIRECT MODEL ACCESS:
 * - Seed runs before server starts
 * - No API available yet
 * - Direct database access is faster
 * - Bypasses API validation (we validate here)
 * 
 * WHY MANUAL HASHING:
 * - insertMany() bypasses pre-save hooks
 * - Must hash passwords before insert
 * - Ensures security even in seed data
 */

// Import Student model
// NOTE: Using require() not import for Node.js compatibility
const Student = require('../models/StudentNew');

/**
 * Hash Password Helper
 * 
 * WHY: Manually hash passwords for seed data
 * USAGE: Called before insertMany()
 * SECURITY: Uses same bcrypt settings as schema (10 rounds)
 */
async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
}

/**
 * Seed Students Function
 * 
 * FLOW:
 * 1. Connect to MongoDB
 * 2. Clear existing students (optional)
 * 3. Hash all passwords
 * 4. Insert students with exact field names
 * 5. Log success
 * 6. Close connection
 */
async function seedStudents() {
  try {
    console.log('🌱 Starting student seed...\n');

    // STEP 1: Connect to MongoDB
    // WHY: Need database connection before operations
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_campus_db';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // STEP 2: Clear existing students (OPTIONAL - comment out to keep existing)
    // WHY: Ensures clean slate for testing
    // WARNING: This deletes all students!
    await Student.deleteMany({});
    console.log('🗑️  Cleared existing students');

    // STEP 3: Define student data
    // CRITICAL: Field names MUST match schema EXACTLY
    // - name (not fullName, not studentName)
    // - rollNo (not rollNumber, not roll_no)
    // - enrollmentNo (not enrollmentNumber, not enrollment_no)
    // - department (must be: Computer, IT, or ENTC)
    // - year (number 1-4)
    // - email (will be lowercase)
    // - password (will be hashed)
    const studentsData = [
      {
        name: 'Rahul Sharma',
        rollNo: 'CS2021001',
        enrollmentNo: 'EN2021001',
        department: 'Computer',
        year: 3,
        email: 'rahul.sharma@college.edu',
        password: 'student123' // Will be hashed
      },
      {
        name: 'Priya Patel',
        rollNo: 'IT2021002',
        enrollmentNo: 'EN2021002',
        department: 'IT',
        year: 3,
        email: 'priya.patel@college.edu',
        password: 'student123'
      },
      {
        name: 'Amit Kumar',
        rollNo: 'ENTC2021003',
        enrollmentNo: 'EN2021003',
        department: 'ENTC',
        year: 2,
        email: 'amit.kumar@college.edu',
        password: 'student123'
      },
      {
        name: 'Sneha Desai',
        rollNo: 'CS2022004',
        enrollmentNo: 'EN2022004',
        department: 'Computer',
        year: 2,
        email: 'sneha.desai@college.edu',
        password: 'student123'
      },
      {
        name: 'Vikram Singh',
        rollNo: 'IT2022005',
        enrollmentNo: 'EN2022005',
        department: 'IT',
        year: 1,
        email: 'vikram.singh@college.edu',
        password: 'student123'
      }
    ];

    // STEP 4: Hash all passwords
    // WHY: insertMany() bypasses pre-save hooks
    // SECURITY: Must hash manually before insert
    console.log('🔐 Hashing passwords...');
    
    const studentsWithHashedPasswords = await Promise.all(
      studentsData.map(async (student) => ({
        ...student,
        email: student.email.toLowerCase(), // Ensure lowercase
        rollNo: student.rollNo.toUpperCase(), // Ensure uppercase
        enrollmentNo: student.enrollmentNo.toUpperCase(), // Ensure uppercase
        password: await hashPassword(student.password)
      }))
    );

    // STEP 5: Insert students
    // WHY: Bulk insert is faster than individual saves
    // NOTE: This bypasses pre-save hooks, so we hashed passwords manually
    const insertedStudents = await Student.insertMany(studentsWithHashedPasswords);
    
    console.log(`✅ Successfully inserted ${insertedStudents.length} students\n`);

    // STEP 6: Display created students
    console.log('📋 Created Students:');
    console.log('='.repeat(60));
    
    insertedStudents.forEach((student, index) => {
      console.log(`\n${index + 1}. ${student.name}`);
      console.log(`   Roll No: ${student.rollNo}`);
      console.log(`   Enrollment No: ${student.enrollmentNo}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Department: ${student.department}`);
      console.log(`   Year: ${student.year}`);
      console.log(`   Password: student123 (hashed in DB)`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Seed completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Email: rahul.sharma@college.edu');
    console.log('   Password: student123');
    console.log('\n🌐 Login URL: http://localhost:3000/login\n');

    // STEP 7: Close connection
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Seed failed!');
    console.error('Error:', error.message);

    // Provide specific error guidance
    if (error.code === 11000) {
      console.error('\n💡 Duplicate key error:');
      console.error('   - A student with this rollNo, enrollmentNo, or email already exists');
      console.error('   - Clear the collection first or use different values');
    } else if (error.name === 'ValidationError') {
      console.error('\n💡 Validation error:');
      Object.values(error.errors).forEach(err => {
        console.error(`   - ${err.message}`);
      });
    } else if (error.name === 'MongooseError') {
      console.error('\n💡 Database connection error:');
      console.error('   - Ensure MongoDB is running');
      console.error('   - Check MONGODB_URI in .env file');
    }

    console.error('\n');
    process.exit(1);
  }
}

// Run seed function
seedStudents();
