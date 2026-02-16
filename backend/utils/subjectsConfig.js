/**
 * SUBJECT CONFIGURATION
 * Maps subjects to Year and Semester
 * Structure: { year: { semester: [subjects] } }
 */

const subjectsConfig = {
  "1": {
    "1": [
      { code: "311302", name: "Basic Mathematics" },
      { code: "311303", name: "Communication Skills in English" },
      { code: "311305", name: "Basic Science (Physics & Chemistry)" }
    ],
    "2": [
      { code: "312301", name: "Applied Mathematics" },
      { code: "312302", name: "Basic Electrical and Electronics Engineering" },
      { code: "312303", name: "Programming in C" }
    ]
  },
  "2": {
    "3": [
      { code: "313301", name: "Data Structures using C" },
      { code: "313302", name: "Database Management System" },
      { code: "313303", name: "Digital Techniques" },
      { code: "313304", name: "Object Oriented Programming using C++" }
    ],
    "4": [
      { code: "314317", name: "Java Programming" },
      { code: "314318", name: "Data Communication and Computer Network" },
      { code: "314321", name: "Microprocessor Programming" },
      { code: "314301", name: "Environmental Education and Sustainability" }
    ]
  },
  "3": {
    "5": [
      { code: "315301", name: "Operating System" },
      { code: "315302", name: "Software Engineering" },
      { code: "315321", name: "Advanced Computer Network" },
      { code: "315325", name: "Cloud Computing" },
      { code: "315326", name: "Data Analytics" }
    ],
    "6": [
      { code: "316301", name: "Management" },
      { code: "316302", name: "Mobile Application Development" },
      { code: "316303", name: "Emerging Trends in Computer & IT" },
      { code: "316315", name: "Digital Forensic and Hacking Techniques" },
      { code: "316316", name: "Machine Learning" },
      { code: "316314", name: "Software Testing" }
    ]
  }
};

/**
 * Get subjects for a specific year and semester
 * @param {number|string} year - Academic year (1, 2, or 3)
 * @param {number|string} semester - Semester (1-6)
 * @returns {Array} Array of subject objects or empty array
 */
function getSubjectsForSemester(year, semester) {
  const yearStr = String(year);
  const semesterStr = String(semester);
  
  if (subjectsConfig[yearStr] && subjectsConfig[yearStr][semesterStr]) {
    return subjectsConfig[yearStr][semesterStr];
  }
  
  return [];
}

/**
 * Validate if a subject code belongs to a specific year and semester
 * @param {string} subjectCode - Subject code to validate
 * @param {number|string} year - Academic year
 * @param {number|string} semester - Semester
 * @returns {boolean} True if valid, false otherwise
 */
function isValidSubjectForSemester(subjectCode, year, semester) {
  const subjects = getSubjectsForSemester(year, semester);
  return subjects.some(subject => subject.code === subjectCode);
}

/**
 * Get subject name by code
 * @param {string} subjectCode - Subject code
 * @param {number|string} year - Academic year
 * @param {number|string} semester - Semester
 * @returns {string|null} Subject name or null if not found
 */
function getSubjectName(subjectCode, year, semester) {
  const subjects = getSubjectsForSemester(year, semester);
  const subject = subjects.find(s => s.code === subjectCode);
  return subject ? subject.name : null;
}

module.exports = {
  subjectsConfig,
  getSubjectsForSemester,
  isValidSubjectForSemester,
  getSubjectName
};
