const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Seed Subjects
 * Creates sample subjects for testing
 */

const subjectSchema = new mongoose.Schema({
  subjectCode: String,
  subjectName: String,
  department: String,
  year: Number,
  createdAt: Date
});

const Subject = mongoose.model('Subject', subjectSchema);

const sampleSubjects = [
  // Computer Science - Year 3
  {
    subjectCode: 'CS301',
    subjectName: 'Data Structures',
    department: 'Computer Science',
    year: 3,
    createdAt: new Date()
  },
  {
    subjectCode: 'CS302',
    subjectName: 'Database Management Systems',
    department: 'Computer Science',
    year: 3,
    createdAt: new Date()
  },
  {
    subjectCode: 'CS303',
    subjectName: 'Computer Networks',
    department: 'Computer Science',
    year: 3,
    createdAt: new Date()
  },
  {
    subjectCode: 'CS304',
    subjectName: 'Operating Systems',
    department: 'Computer Science',
    year: 3,
    createdAt: new Date()
  },
  {
    subjectCode: 'CS305',
    subjectName: 'Software Engineering',
    department: 'Computer Science',
    year: 3,
    createdAt: new Date()
  },
  // Mechanical Engineering - Year 2
  {
    subjectCode: 'ME201',
    subjectName: 'Thermodynamics',
    department: 'Mechanical Engineering',
    year: 2,
    createdAt: new Date()
  },
  {
    subjectCode: 'ME202',
    subjectName: 'Fluid Mechanics',
    department: 'Mechanical Engineering',
    year: 2,
    createdAt: new Date()
  },
  {
    subjectCode: 'ME203',
    subjectName: 'Manufacturing Processes',
    department: 'Mechanical Engineering',
    year: 2,
    createdAt: new Date()
  }
];

async function seedSubjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing subjects
    await Subject.deleteMany({});
    console.log('Cleared existing subjects');

    // Insert sample subjects
    await Subject.insertMany(sampleSubjects);

    console.log('✅ Subjects seeded successfully!');
    console.log(`\n${sampleSubjects.length} subjects added:`);
    sampleSubjects.forEach(subject => {
      console.log(`- ${subject.subjectCode} | ${subject.subjectName} | ${subject.department} | Year ${subject.year}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding subjects:', error);
    process.exit(1);
  }
}

seedSubjects();
