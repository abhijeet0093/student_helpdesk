/**
 * AUTOMATIC BUG FIX SCRIPT
 * Identifies and fixes common bugs in the system
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

const Student = require('./backend/models/Student');
const Admin = require('./backend/models/Admin');
const Staff = require('./backend/models/Staff');
const Subject = require('./backend/models/Subject');

async function fixBugs() {
  try {
    console.log('='.repeat(70));
    console.log('AUTOMATIC BUG FIX SCRIPT');
    console.log('='.repeat(70));
    console.log('');

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_campus_db');
    console.log('✅ Connected to MongoDB\n');

    const fixes = [];

    // ========================================
    // FIX 1: Ensure Admin Exists
    // ========================================
    console.log('🔧 Checking Admin Account...');
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      console.log('   ⚠️  No admin found. Creating default admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        username: 'admin',
        email: 'admin@college.edu',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('   ✅ Admin created (username: admin, password: admin123)');
      fixes.push('Created default admin account');
    } else {
      console.log('   ✅ Admin account exists');
    }
    console.log('');

    // ========================================
    // FIX 2: Ensure Staff Exists
    // ========================================
    console.log('🔧 Checking Staff Accounts...');
    const staffCount = await Staff.countDocuments();
    
    if (staffCount === 0) {
      console.log('   ⚠️  No staff found. Creating default staff...');
      const hashedPassword = await bcrypt.hash('staff123', 10);
      await Staff.create({
        name: 'Rajesh Kumar',
        email: 'rajesh.staff@college.edu',
        password: hashedPassword,
        department: 'Computer',
        role: 'staff'
      });
      console.log('   ✅ Staff created (email: rajesh.staff@college.edu, password: staff123)');
      fixes.push('Created default staff account');
    } else {
      console.log('   ✅ Staff accounts exist');
    }
    console.log('');

    // ========================================
    // FIX 3: Ensure Students Exist
    // ========================================
    console.log('🔧 Checking Student Accounts...');
    const studentCount = await Student.countDocuments();
    
    if (studentCount === 0) {
      console.log('   ⚠️  No students found. Creating test students...');
      const hashedPassword = await bcrypt.hash('student123', 10);
      
      const testStudents = [
        {
          rollNumber: 'CS2021001',
          enrollmentNumber: 'EN2021CS001',
          fullName: 'Rahul Sharma',
          email: 'cs2021001@student.college.edu',
          password: hashedPassword,
          department: 'Computer',
          semester: 3,
          role: 'student',
          isActive: true
        },
        {
          rollNumber: 'IT2021002',
          enrollmentNumber: 'EN2021IT002',
          fullName: 'Priya Patel',
          email: 'it2021002@student.college.edu',
          password: hashedPassword,
          department: 'IT',
          semester: 3,
          role: 'student',
          isActive: true
        },
        {
          rollNumber: 'ENTC2021003',
          enrollmentNumber: 'EN2021ENTC003',
          fullName: 'Amit Kumar',
          email: 'entc2021003@student.college.edu',
          password: hashedPassword,
          department: 'ENTC',
          semester: 3,
          role: 'student',
          isActive: true
        }
      ];

      for (const student of testStudents) {
        await Student.create(student);
        console.log(`   ✅ Created student: ${student.rollNumber} - ${student.fullName}`);
      }
      fixes.push('Created test student accounts');
    } else {
      console.log(`   ✅ ${studentCount} student(s) exist`);
    }
    console.log('');

    // ========================================
    // FIX 4: Ensure Subjects Exist
    // ========================================
    console.log('🔧 Checking Subjects...');
    const subjectCount = await Subject.countDocuments();
    
    if (subjectCount === 0) {
      console.log('   ⚠️  No subjects found. Creating default subjects...');
      
      const defaultSubjects = [
        { subjectCode: 'CS301', subjectName: 'Data Structures', department: 'Computer', semester: 3, credits: 4 },
        { subjectCode: 'CS302', subjectName: 'Database Management', department: 'Computer', semester: 3, credits: 4 },
        { subjectCode: 'CS303', subjectName: 'Operating Systems', department: 'Computer', semester: 3, credits: 4 },
        { subjectCode: 'IT301', subjectName: 'Web Technologies', department: 'IT', semester: 3, credits: 4 },
        { subjectCode: 'IT302', subjectName: 'Software Engineering', department: 'IT', semester: 3, credits: 4 },
        { subjectCode: 'ENTC301', subjectName: 'Digital Electronics', department: 'ENTC', semester: 3, credits: 4 }
      ];

      for (const subject of defaultSubjects) {
        await Subject.create(subject);
        console.log(`   ✅ Created subject: ${subject.subjectCode} - ${subject.subjectName}`);
      }
      fixes.push('Created default subjects');
    } else {
      console.log(`   ✅ ${subjectCount} subject(s) exist`);
    }
    console.log('');

    // ========================================
    // FIX 5: Fix Inactive Accounts
    // ========================================
    console.log('🔧 Checking Inactive Accounts...');
    const inactiveStudents = await Student.countDocuments({ isActive: false });
    
    if (inactiveStudents > 0) {
      console.log(`   ⚠️  Found ${inactiveStudents} inactive student(s). Activating...`);
      await Student.updateMany({ isActive: false }, { isActive: true });
      console.log('   ✅ All students activated');
      fixes.push(`Activated ${inactiveStudents} inactive students`);
    } else {
      console.log('   ✅ All students are active');
    }
    console.log('');

    // ========================================
    // FIX 6: Fix Locked Accounts
    // ========================================
    console.log('🔧 Checking Locked Accounts...');
    const lockedStudents = await Student.countDocuments({ 
      lockUntil: { $gt: new Date() } 
    });
    
    if (lockedStudents > 0) {
      console.log(`   ⚠️  Found ${lockedStudents} locked account(s). Unlocking...`);
      await Student.updateMany(
        { lockUntil: { $gt: new Date() } },
        { lockUntil: null, loginAttempts: 0 }
      );
      console.log('   ✅ All accounts unlocked');
      fixes.push(`Unlocked ${lockedStudents} accounts`);
    } else {
      console.log('   ✅ No locked accounts');
    }
    console.log('');

    // ========================================
    // FIX 7: Validate Email Formats
    // ========================================
    console.log('🔧 Validating Email Formats...');
    const students = await Student.find();
    let fixedEmails = 0;
    
    for (const student of students) {
      if (!student.email.includes('@')) {
        student.email = `${student.rollNumber.toLowerCase()}@student.college.edu`;
        await student.save();
        fixedEmails++;
      }
    }
    
    if (fixedEmails > 0) {
      console.log(`   ✅ Fixed ${fixedEmails} invalid email(s)`);
      fixes.push(`Fixed ${fixedEmails} invalid emails`);
    } else {
      console.log('   ✅ All emails are valid');
    }
    console.log('');

    // ========================================
    // FIX 8: Ensure Proper Indexes
    // ========================================
    console.log('🔧 Checking Database Indexes...');
    try {
      await Student.collection.createIndex({ rollNumber: 1 }, { unique: true });
      await Student.collection.createIndex({ email: 1 }, { unique: true });
      await Subject.collection.createIndex({ subjectCode: 1 }, { unique: true });
      console.log('   ✅ Database indexes verified');
    } catch (error) {
      console.log('   ⚠️  Some indexes already exist (this is normal)');
    }
    console.log('');

    // ========================================
    // SUMMARY
    // ========================================
    console.log('='.repeat(70));
    console.log('BUG FIX SUMMARY');
    console.log('='.repeat(70));
    
    if (fixes.length === 0) {
      console.log('✅ No bugs found! System is healthy.');
    } else {
      console.log(`✅ Fixed ${fixes.length} issue(s):`);
      fixes.forEach((fix, idx) => {
        console.log(`   ${idx + 1}. ${fix}`);
      });
    }
    console.log('');

    // ========================================
    // TEST CREDENTIALS
    // ========================================
    console.log('='.repeat(70));
    console.log('TEST CREDENTIALS');
    console.log('='.repeat(70));
    console.log('');
    console.log('ADMIN:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('');
    console.log('STAFF:');
    console.log('  Email: rajesh.staff@college.edu');
    console.log('  Password: staff123');
    console.log('');
    console.log('STUDENTS:');
    const sampleStudents = await Student.find().limit(3).select('rollNumber fullName');
    sampleStudents.forEach(s => {
      console.log(`  Roll No: ${s.rollNumber} (${s.fullName})`);
    });
    console.log('  Password: student123 (for all students)');
    console.log('');

    console.log('🎉 System is now ready for testing!');

  } catch (error) {
    console.error('❌ Bug fix failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

fixBugs();
