/**
 * Test Result Submission - Debug Script
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const Student = require('./backend/models/Student');
const Subject = require('./backend/models/Subject');

async function testResultSubmission() {
  try {
    console.log('=== TESTING RESULT SUBMISSION ===\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_campus_db');
    console.log('✅ Connected to MongoDB\n');

    // 1. Check if students exist
    const studentCount = await Student.countDocuments();
    console.log(`Total Students in Database: ${studentCount}\n`);

    if (studentCount === 0) {
      console.log('❌ No students found in database!');
      console.log('\nCreating test student...\n');

      // Create a test student
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('student123', 10);

      const testStudent = await Student.create({
        rollNumber: 'CS2021001',
        enrollmentNumber: 'EN2021CS001',
        fullName: 'Test Student',
        email: 'cs2021001@student.college.edu',
        password: hashedPassword,
        department: 'Computer',
        semester: 3,
        role: 'student',
        isActive: true
      });

      console.log('✅ Test student created:');
      console.log('   Roll Number:', testStudent.rollNumber);
      console.log('   Name:', testStudent.fullName);
      console.log('   Department:', testStudent.department);
      console.log('');
    } else {
      // Show first 5 students
      const students = await Student.find().limit(5).select('rollNumber fullName department');
      console.log('Sample Students:');
      students.forEach(s => {
        console.log(`   ${s.rollNumber} - ${s.fullName} (${s.department})`);
      });
      console.log('');
    }

    // 2. Check if subjects exist
    const subjectCount = await Subject.countDocuments();
    console.log(`Total Subjects in Database: ${subjectCount}\n`);

    if (subjectCount === 0) {
      console.log('❌ No subjects found in database!');
      console.log('\nCreating test subjects...\n');

      const testSubjects = [
        {
          subjectCode: 'CS301',
          subjectName: 'Data Structures',
          department: 'Computer',
          semester: 3,
          credits: 4
        },
        {
          subjectCode: 'CS302',
          subjectName: 'Database Management',
          department: 'Computer',
          semester: 3,
          credits: 4
        }
      ];

      for (const subj of testSubjects) {
        await Subject.create(subj);
        console.log(`✅ Created subject: ${subj.subjectCode} - ${subj.subjectName}`);
      }
      console.log('');
    } else {
      // Show first 5 subjects
      const subjects = await Subject.find().limit(5).select('subjectCode subjectName department');
      console.log('Sample Subjects:');
      subjects.forEach(s => {
        console.log(`   ${s.subjectCode} - ${s.subjectName} (${s.department})`);
      });
      console.log('');
    }

    // 3. Test student lookup
    console.log('Testing student lookup...');
    const testRollNo = 'CS2021001';
    const student = await Student.findOne({ rollNumber: testRollNo.toUpperCase() });
    
    if (student) {
      console.log(`✅ Student found: ${student.rollNumber} - ${student.fullName}`);
    } else {
      console.log(`❌ Student NOT found with roll number: ${testRollNo}`);
    }
    console.log('');

    // 4. Show test data for form
    console.log('=== TEST DATA FOR RESULT FORM ===');
    const firstStudent = await Student.findOne();
    const firstSubject = await Subject.findOne();

    if (firstStudent && firstSubject) {
      console.log('Use these values in the form:');
      console.log('');
      console.log('Roll Number:', firstStudent.rollNumber);
      console.log('Subject Code:', firstSubject.subjectCode);
      console.log('Subject Name:', firstSubject.subjectName);
      console.log('Department:', firstStudent.department);
      console.log('Year: 2');
      console.log('Semester:', firstStudent.semester);
      console.log('UT Type: UT1');
      console.log('Marks Obtained: 20');
      console.log('Max Marks: 25');
      console.log('');
    }

    console.log('✅ TEST COMPLETE\n');

  } catch (error) {
    console.error('❌ TEST FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

testResultSubmission();
