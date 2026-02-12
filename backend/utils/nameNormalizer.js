/**
 * Normalize name for comparison
 * Removes extra spaces, converts to uppercase
 * @param {String} name - Name to normalize
 * @returns {String} Normalized name
 */
const normalizeName = (name) => {
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
};

/**
 * Normalize roll number
 * Removes spaces, converts to uppercase
 * @param {String} rollNumber - Roll number to normalize
 * @returns {String} Normalized roll number
 */
const normalizeRollNumber = (rollNumber) => {
  return rollNumber.trim().toUpperCase();
};

module.exports = { normalizeName, normalizeRollNumber };
