const jwt = require('jsonwebtoken');

// JWT_SECRET is guaranteed to exist — server.js exits if it's missing
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Shared token extractor and verifier.
 * Returns decoded payload or sends 401 and returns null.
 */
function extractAndVerify(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return null;
  }

  try {
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, JWT_SECRET);
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return null;
  }
}

// Verify JWT Token (role-agnostic)
function verifyToken(req, res, next) {
  const decoded = extractAndVerify(req, res);
  if (!decoded) return;
  req.userId = decoded.userId;
  req.role   = decoded.role;
  next();
}

// Verify Student Role
function verifyStudent(req, res, next) {
  const decoded = extractAndVerify(req, res);
  if (!decoded) return;
  req.userId = decoded.userId;
  req.role   = decoded.role;
  if (req.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Access denied. Student role required.' });
  }
  next();
}

// Verify Admin Role
function verifyAdmin(req, res, next) {
  const decoded = extractAndVerify(req, res);
  if (!decoded) return;
  req.userId = decoded.userId;
  req.role   = decoded.role;
  if (req.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
  next();
}

// Verify Staff Role
function verifyStaff(req, res, next) {
  const decoded = extractAndVerify(req, res);
  if (!decoded) return;
  req.userId = decoded.userId;
  req.role   = decoded.role;
  if (req.role !== 'staff') {
    return res.status(403).json({ success: false, message: 'Access denied. Staff role required.' });
  }
  next();
}

// Authenticate — alias for verifyToken (role-agnostic)
function authenticate(req, res, next) {
  return verifyToken(req, res, next);
}

// Authorize helpers (used after authenticate/verifyToken)
function authorizeStudent(req, res, next) {
  if (req.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Access denied. Student role required.' });
  }
  next();
}

function authorizeAdmin(req, res, next) {
  if (req.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
  next();
}

function authorizeStaff(req, res, next) {
  if (req.role !== 'staff') {
    return res.status(403).json({ success: false, message: 'Access denied. Staff role required.' });
  }
  next();
}

function authorizeAdminOrStaff(req, res, next) {
  if (req.role !== 'admin' && req.role !== 'staff') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin or Staff role required.' });
  }
  next();
}

module.exports = {
  verifyToken,
  verifyStudent,
  verifyAdmin,
  verifyStaff,
  authenticate,
  authorizeStudent,
  authorizeAdmin,
  authorizeStaff,
  authorizeAdminOrStaff
};
