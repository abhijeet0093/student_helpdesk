/**
 * Performance Analysis Helper
 * Analyzes UT-1 vs UT-2 performance and generates feedback
 */

/**
 * Analyze student performance
 * @param {Array} ut1Results - UT-1 results
 * @param {Array} ut2Results - UT-2 results
 * @returns {Object} Analysis summary
 */
const analyzePerformance = (ut1Results, ut2Results) => {
  const analysis = {
    improved: [],
    declined: [],
    consistent: [],
    weakSubjects: [],
    strongSubjects: [],
    overallTrend: '',
    feedback: []
  };

  // Create maps for easy comparison
  const ut1Map = new Map();
  ut1Results.forEach(result => {
    ut1Map.set(result.subjectCode, result);
  });

  const ut2Map = new Map();
  ut2Results.forEach(result => {
    ut2Map.set(result.subjectCode, result);
  });

  // Compare subjects present in both UTs
  ut1Map.forEach((ut1Result, subjectCode) => {
    const ut2Result = ut2Map.get(subjectCode);

    if (ut2Result) {
      const ut1Percentage = ut1Result.percentage;
      const ut2Percentage = ut2Result.percentage;
      const difference = ut2Percentage - ut1Percentage;

      const subjectInfo = {
        subjectName: ut1Result.subjectName,
        subjectCode: subjectCode,
        ut1Marks: ut1Result.marksObtained,
        ut1MaxMarks: ut1Result.maxMarks,
        ut1Percentage: ut1Percentage.toFixed(2),
        ut2Marks: ut2Result.marksObtained,
        ut2MaxMarks: ut2Result.maxMarks,
        ut2Percentage: ut2Percentage.toFixed(2),
        difference: difference.toFixed(2)
      };

      // Categorize based on difference
      if (difference > 5) {
        analysis.improved.push(subjectInfo);
        analysis.feedback.push(`Good improvement in ${ut1Result.subjectName}! Keep up the good work.`);
      } else if (difference < -5) {
        analysis.declined.push(subjectInfo);
        analysis.feedback.push(`${ut1Result.subjectName} needs more attention. Focus on understanding core concepts.`);
      } else {
        analysis.consistent.push(subjectInfo);
      }

      // Identify weak subjects (below 50% in UT-2)
      if (ut2Percentage < 50) {
        analysis.weakSubjects.push({
          subjectName: ut1Result.subjectName,
          percentage: ut2Percentage.toFixed(2)
        });
        analysis.feedback.push(`${ut1Result.subjectName} requires more practice. Consider seeking help from teachers or peers.`);
      }

      // Identify strong subjects (above 75% in UT-2)
      if (ut2Percentage >= 75) {
        analysis.strongSubjects.push({
          subjectName: ut1Result.subjectName,
          percentage: ut2Percentage.toFixed(2)
        });
      }
    }
  });

  // Calculate overall trend
  const totalImproved = analysis.improved.length;
  const totalDeclined = analysis.declined.length;

  if (totalImproved > totalDeclined) {
    analysis.overallTrend = 'improving';
    analysis.feedback.unshift('Overall, you are showing good improvement! Keep maintaining this momentum.');
  } else if (totalDeclined > totalImproved) {
    analysis.overallTrend = 'declining';
    analysis.feedback.unshift('You need to focus more on your studies. Identify weak areas and work on them systematically.');
  } else {
    analysis.overallTrend = 'stable';
    analysis.feedback.unshift('Your performance is consistent. Try to improve in subjects where you scored less.');
  }

  // Add general exam preparation tips
  if (analysis.weakSubjects.length > 0) {
    analysis.feedback.push('For final exams, prioritize weak subjects and allocate more study time to them.');
  }

  return analysis;
};

/**
 * Generate simple text summary
 * @param {Object} analysis - Analysis object
 * @returns {String} Text summary
 */
const generateSummary = (analysis) => {
  let summary = '';

  if (analysis.improved.length > 0) {
    summary += `You improved in ${analysis.improved.length} subject(s). `;
  }

  if (analysis.declined.length > 0) {
    summary += `You need more practice in ${analysis.declined.length} subject(s). `;
  }

  if (analysis.weakSubjects.length > 0) {
    summary += `Focus on: ${analysis.weakSubjects.map(s => s.subjectName).join(', ')}. `;
  }

  return summary.trim();
};

module.exports = {
  analyzePerformance,
  generateSummary
};
