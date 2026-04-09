/**
 * MSBTE SUBJECT CONFIGURATION — Computer Engineering (CO)
 * Exact semester-wise mapping with compulsory + elective groups.
 * Semesters 1–4: all subjects are compulsory (no electives).
 * Semester 5: Elective I (choose ONE from 3 options).
 * Semester 6: Elective II (choose ONE from 3 options).
 */

const MSBTE_SUBJECTS = {
  1: {
    compulsory: [
      { code: '311302', name: 'Basic Mathematics' },
      { code: '311303', name: 'Communication Skills (English)' },
      { code: '311305', name: 'Basic Science' },
      { code: '311001', name: 'Fundamentals of ICT' },
      { code: '311002', name: 'Engineering Workshop Practice' },
      { code: '311003', name: 'Yoga and Meditation' },
      { code: '311008', name: 'Engineering Graphics' },
    ],
    electives: [],
  },
  2: {
    compulsory: [
      { code: '312301', name: 'Applied Mathematics' },
      { code: '312302', name: 'Basic Electrical and Electronics Engineering' },
      { code: '312303', name: 'Programming in C' },
      { code: '312001', name: 'Linux Basics' },
      { code: '312002', name: 'Professional Communication' },
      { code: '312003', name: 'Social and Life Skills' },
      { code: '312004', name: 'Web Page Designing' },
    ],
    electives: [],
  },
  3: {
    compulsory: [
      { code: '313301', name: 'Data Structure Using C' },
      { code: '313302', name: 'Database Management System' },
      { code: '313303', name: 'Digital Techniques' },
      { code: '313304', name: 'Object Oriented Programming Using C++' },
      { code: '313001', name: 'Computer Graphics' },
      { code: '313002', name: 'Essence of Indian Constitution' },
    ],
    electives: [],
  },
  4: {
    compulsory: [
      { code: '314317', name: 'Java Programming' },
      { code: '314318', name: 'Data Communication and Computer Network' },
      { code: '314321', name: 'Microprocessor Programming' },
      { code: '314301', name: 'Environmental Education and Sustainability' },
      { code: '314004', name: 'Python Programming' },
      { code: '314005', name: 'UI/UX Design' },
    ],
    electives: [],
  },
  5: {
    compulsory: [
      { code: '315319', name: 'Operating System' },
      { code: '315323', name: 'Software Engineering' },
      { code: '315002', name: 'Entrepreneurship Development and Startups' },
      { code: '315003', name: 'Seminar and Project Initiation' },
      { code: '315004', name: 'Internship' },
    ],
    electives: [
      { code: '315321', name: 'Advance Computer Network' },
      { code: '315325', name: 'Cloud Computing' },
      { code: '315326', name: 'Data Analytics' },
    ],
    electiveLabel: 'Elective I',
  },
  6: {
    compulsory: [
      { code: '315301', name: 'Management' },
      { code: '316314', name: 'Software Testing' },
      { code: '316313', name: 'Emerging Trends in Computer Engineering & IT' },
      { code: '316005', name: 'Client Side Scripting' },
      { code: '316006', name: 'Mobile Application Development' },
      { code: '316004', name: 'Capstone Project' },
    ],
    electives: [
      { code: '316315', name: 'Digital Forensic and Hacking Techniques' },
      { code: '316316', name: 'Machine Learning' },
      { code: '316317', name: 'Network and Information Security' },
    ],
    electiveLabel: 'Elective II',
  },
};

/**
 * Returns { compulsory, electives, electiveLabel } for a semester.
 * @param {number|string} semester
 */
function getMSBTESubjectsForSemester(semester) {
  const sem = MSBTE_SUBJECTS[parseInt(semester)];
  if (!sem) return { compulsory: [], electives: [], electiveLabel: null };
  return {
    compulsory:    sem.compulsory,
    electives:     sem.electives,
    electiveLabel: sem.electiveLabel || null,
  };
}

/**
 * Flat list of all subjects (compulsory + electives) for a semester.
 * Used by the API endpoint.
 */
function getAllSubjectsForSemester(semester) {
  const { compulsory, electives } = getMSBTESubjectsForSemester(semester);
  return [...compulsory, ...electives];
}

module.exports = { MSBTE_SUBJECTS, getMSBTESubjectsForSemester, getAllSubjectsForSemester };
