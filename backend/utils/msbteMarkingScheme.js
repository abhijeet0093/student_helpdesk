/**
 * MSBTE MARKING SCHEME — Computer Engineering (CO)
 * Official theory + practical max marks per subject.
 *
 * theoryMax  — max marks for theory component (null = no theory)
 * practicalMax — max marks for practical component (null = no practical)
 * totalMax   — theoryMax + practicalMax (auto-computed below)
 *
 * Standard patterns used by MSBTE:
 *   Full subject   : Theory 100 + Practical 50  = 150
 *   Theory only    : Theory 100                 = 100
 *   Practical only : Practical 50               = 50
 *   Equal split    : Theory 100 + Practical 100 = 200
 */

const MARKING_SCHEME = {
  // ── Semester 1 ──────────────────────────────────────────────────────────
  '311302': { name: 'Basic Mathematics',               theoryMax: 100, practicalMax: null },
  '311303': { name: 'Communication Skills (English)',  theoryMax: 100, practicalMax: 50   },
  '311305': { name: 'Basic Science',                   theoryMax: 100, practicalMax: 50   },
  '311001': { name: 'Fundamentals of ICT',             theoryMax: null, practicalMax: 50  },
  '311002': { name: 'Engineering Workshop Practice',   theoryMax: null, practicalMax: 50  },
  '311003': { name: 'Yoga and Meditation',             theoryMax: null, practicalMax: 50  },
  '311008': { name: 'Engineering Graphics',            theoryMax: 100, practicalMax: 50   },

  // ── Semester 2 ──────────────────────────────────────────────────────────
  '312301': { name: 'Applied Mathematics',                          theoryMax: 100, practicalMax: null },
  '312302': { name: 'Basic Electrical and Electronics Engineering', theoryMax: 100, practicalMax: 50   },
  '312303': { name: 'Programming in C',                             theoryMax: 100, practicalMax: 50   },
  '312001': { name: 'Linux Basics',                                 theoryMax: null, practicalMax: 50  },
  '312002': { name: 'Professional Communication',                   theoryMax: null, practicalMax: 50  },
  '312003': { name: 'Social and Life Skills',                       theoryMax: null, practicalMax: 50  },
  '312004': { name: 'Web Page Designing',                           theoryMax: null, practicalMax: 50  },

  // ── Semester 3 ──────────────────────────────────────────────────────────
  '313301': { name: 'Data Structure Using C',                    theoryMax: 100, practicalMax: 50  },
  '313302': { name: 'Database Management System',                theoryMax: 100, practicalMax: 50  },
  '313303': { name: 'Digital Techniques',                        theoryMax: 100, practicalMax: 50  },
  '313304': { name: 'Object Oriented Programming Using C++',     theoryMax: 100, practicalMax: 50  },
  '313001': { name: 'Computer Graphics',                         theoryMax: null, practicalMax: 50 },
  '313002': { name: 'Essence of Indian Constitution',            theoryMax: 100, practicalMax: null },

  // ── Semester 4 ──────────────────────────────────────────────────────────
  '314317': { name: 'Java Programming',                              theoryMax: 100, practicalMax: 50  },
  '314318': { name: 'Data Communication and Computer Network',       theoryMax: 100, practicalMax: 50  },
  '314321': { name: 'Microprocessor Programming',                    theoryMax: 100, practicalMax: 50  },
  '314301': { name: 'Environmental Education and Sustainability',    theoryMax: 100, practicalMax: null },
  '314004': { name: 'Python Programming',                            theoryMax: null, practicalMax: 50 },
  '314005': { name: 'UI/UX Design',                                  theoryMax: null, practicalMax: 50 },

  // ── Semester 5 — Compulsory ──────────────────────────────────────────────
  '315319': { name: 'Operating System',                              theoryMax: 100, practicalMax: 50  },
  '315323': { name: 'Software Engineering',                          theoryMax: 100, practicalMax: 50  },
  '315002': { name: 'Entrepreneurship Development and Startups',     theoryMax: 100, practicalMax: null },
  '315003': { name: 'Seminar and Project Initiation',                theoryMax: null, practicalMax: 50 },
  '315004': { name: 'Internship',                                    theoryMax: null, practicalMax: 50 },

  // ── Semester 5 — Elective I ──────────────────────────────────────────────
  '315321': { name: 'Advance Computer Network',  theoryMax: 100, practicalMax: 50 },
  '315325': { name: 'Cloud Computing',           theoryMax: 100, practicalMax: 50 },
  '315326': { name: 'Data Analytics',            theoryMax: 100, practicalMax: 50 },

  // ── Semester 6 — Compulsory ──────────────────────────────────────────────
  '315301': { name: 'Management',                                        theoryMax: 100, practicalMax: null },
  '316314': { name: 'Software Testing',                                  theoryMax: 100, practicalMax: 50  },
  '316313': { name: 'Emerging Trends in Computer Engineering & IT',      theoryMax: 100, practicalMax: null },
  '316005': { name: 'Client Side Scripting',                             theoryMax: null, practicalMax: 50 },
  '316006': { name: 'Mobile Application Development',                    theoryMax: null, practicalMax: 50 },
  '316004': { name: 'Capstone Project',                                  theoryMax: null, practicalMax: 50 },

  // ── Semester 6 — Elective II ─────────────────────────────────────────────
  '316315': { name: 'Digital Forensic and Hacking Techniques', theoryMax: 100, practicalMax: 50 },
  '316316': { name: 'Machine Learning',                        theoryMax: 100, practicalMax: 50 },
  '316317': { name: 'Network and Information Security',        theoryMax: 100, practicalMax: 50 },
};

// Auto-compute totalMax for each entry
Object.keys(MARKING_SCHEME).forEach(code => {
  const s = MARKING_SCHEME[code];
  s.totalMax = (s.theoryMax || 0) + (s.practicalMax || 0);
});

/**
 * Get marking scheme for a single subject code.
 * Returns { theoryMax, practicalMax, totalMax } or null if not found.
 */
function getScheme(code) {
  return MARKING_SCHEME[code] || null;
}

/**
 * Validate theory + practical marks for a subject.
 * Returns null if valid, or an error string.
 */
function validateSubjectMarks(code, theoryMarks, practicalMarks) {
  const scheme = getScheme(code);
  if (!scheme) return `Unknown subject code: ${code}`;

  if (scheme.theoryMax !== null) {
    if (theoryMarks == null || theoryMarks === '') return `Theory marks required for ${scheme.name}`;
    const t = parseFloat(theoryMarks);
    if (isNaN(t) || t < 0)              return `Theory marks for "${scheme.name}" cannot be negative`;
    if (t > scheme.theoryMax)           return `Theory marks for "${scheme.name}" exceed max (${scheme.theoryMax})`;
  }

  if (scheme.practicalMax !== null) {
    if (practicalMarks == null || practicalMarks === '') return `Practical marks required for ${scheme.name}`;
    const p = parseFloat(practicalMarks);
    if (isNaN(p) || p < 0)              return `Practical marks for "${scheme.name}" cannot be negative`;
    if (p > scheme.practicalMax)        return `Practical marks for "${scheme.name}" exceed max (${scheme.practicalMax})`;
  }

  return null;
}

module.exports = { MARKING_SCHEME, getScheme, validateSubjectMarks };
