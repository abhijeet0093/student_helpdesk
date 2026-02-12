/**
 * Check StudentMaster Data
 * Shows all students available for registration
 */

const mongoose = require('mongoose');
require('dotenv').config();

const studentMasterSchema = new mongoose.Schema({
  rollNumber: String,
  enrollmentNumber: String,
  fullName: String,
  department: String,
  semester: Number,
  batch: String,
  email: String,
  phoneNumber: String,
  dateOfBirth: Date,
  isActive: Boolean
});

const StudentMaster = mongoose.model('StudentMaster', studentMasterSchema);

async function checkStudentMaster() {
  try {
    console.log('🔍 Checking StudentMaster data...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Count students
    const count = await StudentMaster.countDocuments();
    
    if (count === 0) {
      console.log('❌ No students found in StudentMaster!');
      console.log('\n💡 Fix: Run this command:');
      console.log('   node scripts/seedStudentMaster.js\n');
      process.exit(1);
    }
    
    console.log(`✅ Found ${count} student(s) in StudentMaster:\n`);
    
    // Get all students
    const students = await StudentMaster.find().sort({ rollNumber: 1 });
    
    console.log('=' .repeat(100));
    console.log('STUDENTS AVAILABLE FOR REGISTRATION');
    console.log('=' .repeat(100));
    
    students.forEach((student, index) => {
      const dob = student.dateOfBirth.toISOString().split('T')[0];
      
      console.log(`\n${index + 1}. ${student.fullName}`);
      console.log('   Roll Number:       ', student.rollNumber);
      console.log('   Enrollment Number: ', student.enrollmentNumber);
      console.log('   Date of Birth:     ', dob);
      console.log('   Department:        ', student.department);
      console.log('   Semester:          ', student.semester);
      console.log('   Batch:             ', student.batch);
      console.log('   Email:             ', student.email);
      console.log('   Phone:             ', student.phoneNumber);
      console.log('   Active:            ', student.isActive ? '✅ Yes' : '❌ No');
      
      if (student.isActive) {
        console.log('\n   📝 Registration Details (copy these exactly):');
        console.log('   ─────────────────────────────────────────────');
        console.log(`   Roll Number:       ${student.rollNumber}`);
        console.log(`   Enrollment Number: ${student.enrollmentNumber}`);
        console.log(`   Full Name:         ${student.fullName}`);
        console.log(`   Date of Birth:     ${dob}`);
        console.log(`   Password:          Test@123 (or your choice)`);
      } else {
        console.log('\n   ⚠️  This student is INACTIVE - cannot register');
      }
    });
    
    console.log('\n' + '=' .repeat(100));
    console.log('\n✅ StudentMaster check complete!');
    console.log('\n📝 To register:');
    console.log('   1. Go to: http://localhost:3000/register');
    console.log('   2. Use EXACT details from above (copy-paste recommended)');
    console.log('   3. Create a password (minimum 8 characters)');
    console.log('   4. After registration, login with Roll Number and password\n');
    
    // Check if any students already registered
    const Student = mongoose.model('Student', new mongoose.Schema({
      rollNumber: String,
      fullName: String
    }));
    
    const registeredCount = await Student.countDocuments();
    
    if (registeredCount > 0) {
      console.log(`ℹ️  Note: ${registeredCount} student(s) already registered`);
      const registered = await Student.find().select('rollNumber fullName');
      console.log('   Already registered:');
      registered.forEach(s => {
        console.log(`   - ${s.rollNumber} (${s.fullName})`);
      });
      console.log('');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 MongoDB is not running!');
      console.log('   Fix: net start MongoDB\n');
    }
    
    process.exit(1);
  }
}

checkStudentMaster();
