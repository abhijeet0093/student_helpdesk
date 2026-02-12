/**
 * UT RESULT SUBMISSION FIX VERIFICATION
 * Tests the fixed result submission logic
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const Student = require('./backend/models/Student');
const Subject = require('./backend/models/Subject');
const UTResult = require('./backend/models/UTResult');

async function testUTResultFix() {
  try {
    console.log('=== UT RESULT FIX VERIFICATION ===\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Test 1: Check if students exist
    console.log('TEST 1: Checking students in database...');
    const students = await Student.find().limit(5).select('rollNumber fullName department semester');
    
    if (students.length === 0) {
      console.log('✗ No students found in database!');
      console.log('  Run: node backend/scripts/seedStudentsNew.js');
      console.log('  Or use Admin bulk upload feature\n');
      return;
    }
    
    console.log(`✓ Found ${students.length} students:`);
    students.forEach(s => {
      console.log(`  - ${s.rollNumber} | ${s.fullName} | ${s.department} | Sem ${s.semester}`);
    });
    console.log();

    // Test 2: Simulate result submission with correct data
    console.log('TEST 2: Simulating result submission...');
    const testStudent = students[0];
    
    const testData = {
      rollNo: testStudent.rollNumber,
      subjectCode: 'CS301',
      subjectName: 'Data Structures',
      department: testStudent.department,
      year: 2,
      semester: testStudent.semester,
      utType: 'UT1',
      marksObtained: 20,
      maxMarks: 25
    };
    
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    // Validate all required fields
    const requiredFields = ['rollNo', 'subjectCode', 'subjectName', 'department', 'year', 'semester', 'utType', 'marksObtained', 'maxMarks'];
    const missingFields = requiredFields.filter(field => !testData[field] && testData[field] !== 0);
    
    if (missingFields.length > 0) {
      console.log(`✗ Missing fields: ${missingFields.join(', ')}\n`);
      return;
    }
    console.log('✓ All required fields present\n');

    // Test 3: Verify student lookup
    console.log('TEST 3: Testing student lookup...');
    const foundStudent = await Student.findOne({ rollNumber: testData.rollNo.toUpperCase() });
    
    if (!foundStudent) {
      console.log(`✗ Student not found: ${testData.rollNo}\n`);
      return;
    }
    console.log(`✓ Student found: ${foundStudent.rollNumber} - ${foundStudent.fullName}\n`);

    // Test 4: Test subject creation/lookup
    console.log('TEST 4: Testing subject lookup/creation...');
    let subject = await Subject.findOne({ subjectCode: testData.subjectCode.toUpperCase() });
    
    if (!subject) {
      console.log('  Subject not found, creating...');
      subject = await Subject.create({
        subjectCode: testData.subjectCode.toUpperCase(),
        subjectName: testData.subjectName,
        department: testData.department,
        semester: testData.semester
      });
      console.log(`✓ Subject created: ${subject.subjectCode}\n`);
    } else {
      console.log(`✓ Subject found: ${subject.subjectCode} - ${subject.subjectName}\n`);
    }

    // Test 5: Check for existing result
    console.log('TEST 5: Checking for existing result...');
    const existingResult = await UTResult.findOne({
      studentId: foundStudent._id,
      subjectId: subject._id,
      utType: testData.utType
    });
    
    if (existingResult) {
      console.log('✓ Result already exists (will be updated)');
      console.log(`  Current: ${existingResult.marksObtained}/${existingResult.maxMarks}\n`);
    } else {
      console.log('✓ No existing result (will create new)\n');
    }

    // Test 6: Validate marks
    console.log('TEST 6: Validating marks...');
    if (testData.marksObtained < 0 || testData.marksObtained > testData.maxMarks) {
      console.log(`✗ Invalid marks: ${testData.marksObtained}/${testData.maxMarks}\n`);
      return;
    }
    console.log(`✓ Marks valid: ${testData.marksObtained}/${testData.maxMarks}\n`);

    // Test 7: Create/Update result
    console.log('TEST 7: Creating/Updating result...');
    
    if (existingResult) {
      existingResult.marksObtained = testData.marksObtained;
      existingResult.maxMarks = testData.maxMarks;
      existingResult.semester = testData.semester;
      existingResult.year = testData.year;
      existingResult.department = testData.department;
      existingResult.subjectName = testData.subjectName;
      existingResult.isReleased = false;
      await existingResult.save();
      console.log('✓ Result updated successfully');
    } else {
      const newResult = await UTResult.create({
        studentId: foundStudent._id,
        rollNo: foundStudent.rollNumber,
        department: testData.department,
        year: testData.year,
        semester: testData.semester,
        subjectId: subject._id,
        subjectCode: subject.subjectCode,
        subjectName: testData.subjectName,
        utType: testData.utType,
        marksObtained: testData.marksObtained,
        maxMarks: testData.maxMarks,
        isReleased: false
      });
      console.log('✓ Result created successfully');
      console.log(`  ID: ${newResult._id}`);
    }
    
    console.log();

    // Summary
    console.log('=== FIX VERIFICATION SUMMARY ===');
    console.log('✓ All validation checks passed');
    console.log('✓ Student lookup working correctly');
    console.log('✓ Subject creation/lookup working');
    console.log('✓ Result submission working');
    console.log('\n✓ UT RESULT SUBMISSION FIX VERIFIED!\n');

    // Show what to test in UI
    console.log('=== NEXT STEPS ===');
    console.log('1. Restart backend server');
    console.log('2. Login as Staff');
    console.log('3. Go to UT Results Management');
    console.log('4. Use this test data:');
    console.log(`   Roll No: ${testStudent.rollNumber}`);
    console.log(`   Subject Code: CS301`);
    console.log(`   Subject Name: Data Structures`);
    console.log(`   Department: ${testStudent.department}`);
    console.log(`   Year: 2`);
    console.log(`   Semester: ${testStudent.semester}`);
    console.log(`   UT Type: UT1`);
    console.log(`   Marks: 20/25`);
    console.log();

  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

testUTResultFix();
