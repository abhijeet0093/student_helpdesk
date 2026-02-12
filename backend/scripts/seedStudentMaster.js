const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Seed Student Master Data
 * Creates sample student records for testing
 */

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
  isActive: Boolean,
  uploadedAt: Date
});

const StudentMaster = mongoose.model('StudentMaster', studentMasterSchema);

const sampleStudents = [
  {
    rollNumber: 'CS2024001',
    enrollmentNumber: 'EN2024CS001',
    fullName: 'RAHUL KUMAR SHARMA',
    department: 'Computer Science',
    semester: 6,
    batch: '2021-2025',
    email: 'rahul.cs2024001@college.edu',
    phoneNumber: '9876543210',
    dateOfBirth: new Date('2003-05-15'),
    isActive: true,
    uploadedAt: new Date()
  },
  {
    rollNumber: 'CS2024002',
    enrollmentNumber: 'EN2024CS002',
    fullName: 'PRIYA SINGH',
    department: 'Computer Science',
    semester: 6,
    batch: '2021-2025',
    email: 'priya.cs2024002@college.edu',
    phoneNumber: '9876543211',
    dateOfBirth: new Date('2003-08-20'),
    isActive: true,
    uploadedAt: new Date()
  },
  {
    rollNumber: 'ME2024001',
    enrollmentNumber: 'EN2024ME001',
    fullName: 'AMIT PATEL',
    department: 'Mechanical Engineering',
    semester: 4,
    batch: '2022-2026',
    email: 'amit.me2024001@college.edu',
    phoneNumber: '9876543212',
    dateOfBirth: new Date('2004-03-10'),
    isActive: true,
    uploadedAt: new Date()
  }
];

async function seedStudentMaster() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await StudentMaster.deleteMany({});
    console.log('Cleared existing student master data');

    // Insert sample students
    await StudentMaster.insertMany(sampleStudents);

    console.log('✅ Student master data seeded successfully!');
    console.log(`\n${sampleStudents.length} students added:`);
    sampleStudents.forEach(student => {
      console.log(`- ${student.rollNumber} | ${student.fullName} | ${student.department}`);
    });

    console.log('\n📝 You can now register these students:');
    console.log('Roll Number: CS2024001, Enrollment: EN2024CS001, Name: RAHUL KUMAR SHARMA, DOB: 2003-05-15');
    console.log('Roll Number: CS2024002, Enrollment: EN2024CS002, Name: PRIYA SINGH, DOB: 2003-08-20');
    console.log('Roll Number: ME2024001, Enrollment: EN2024ME001, Name: AMIT PATEL, DOB: 2004-03-10');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding student master:', error);
    process.exit(1);
  }
}

seedStudentMaster();
