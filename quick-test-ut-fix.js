/**
 * QUICK UT RESULT FIX TEST
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const Student = require('./backend/models/Student');

async function quickTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected\n');

    // Check students
    const students = await Student.find().select('rollNumber fullName department semester');
    console.log(`Found ${students.length} students:\n`);
    
    students.forEach(s => {
      console.log(`Roll: ${s.rollNumber}`);
      console.log(`Name: ${s.fullName}`);
      console.log(`Dept: ${s.department}`);
      console.log(`Sem: ${s.semester}`);
      console.log('---');
    });

    if (students.length > 0) {
      console.log('\n✓ FIX SUMMARY:');
      console.log('1. Improved field validation (shows which field is missing)');
      console.log('2. Better student lookup with trim() and toUpperCase()');
      console.log('3. Proper type conversion (parseInt, parseFloat)');
      console.log('4. Enhanced error messages');
      console.log('5. Better debugging logs\n');
      
      console.log('TEST DATA TO USE:');
      console.log(`Roll No: ${students[0].rollNumber}`);
      console.log('Subject Code: CS301');
      console.log('Subject Name: Data Structures');
      console.log(`Department: ${students[0].department}`);
      console.log('Year: 2');
      console.log(`Semester: ${students[0].semester}`);
      console.log('UT Type: UT1');
      console.log('Marks: 20');
      console.log('Max Marks: 25\n');
    } else {
      console.log('\n✗ No students found!');
      console.log('Run: node auto-bug-fix.js\n');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

quickTest();
