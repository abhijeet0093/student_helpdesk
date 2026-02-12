const jwt = require('jsonwebtoken');

/**
 * JWT UTILITY
 * 
 * WHY: Centralized JWT token generation and verification
 * SECURITY: Uses secret from environment variables
 * EXPIRATION: Tokens expire after 1 day
 */

/**
 * Generate JWT Token
 * 
 * @param {Object} payload - Data to encode in token
 * @param {String} payload.studentId - Student's MongoDB _id
 * @param {String} payload.role - User role (student)
 * @returns {String} JWT token
 * 
 * WHY: Creates secure token for authentication
 * USAGE: Called after successful login
 */
function generateToken(payload) {
  // Validate required fields
  if (!payload.studentId) {
    throw new Error('studentId is required for token generation');
  }

  if (!payload.role) {
    throw new Error('role is required for token generation');
  }

  // Get JWT secret from environment
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET not configured in environment');
  }

  // Generate token with 1 day expiration
  const token = jwt.sign(
    {
      studentId: payload.studentId,
      role: payload.role
    },
    secret,
    {
      expiresIn: '1d' // Token expires in 1 day
    }
  );

  return token;
}

/**
 * Verify JWT Token
 * 
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 * 
 * WHY: Validates token authenticity and expiration
 * USAGE: Called by authentication middleware
 */
function verifyToken(token) {
  // Validate token exists
  if (!token) {
    throw new Error('Token is required for verification');
  }

  // Get JWT secret from environment
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET not configured in environment');
  }

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

module.exports = {
  generateToken,
  verifyToken
};
