const jwt = require('jsonwebtoken');

// Verify JWT Token
function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    req.userId = decoded.userId;
    req.role = decoded.role;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

// Verify Student Role
function verifyStudent(req, res, next) {
  verifyToken(req, res, (err) => {
    if (err) return;
    
    if (req.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student role required.'
      });
    }
    
    next();
  });
}

// Verify Admin Role
function verifyAdmin(req, res, next) {
  verifyToken(req, res, (err) => {
    if (err) return;
    
    if (req.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    next();
  });
}

// Authenticate - verify JWT token
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    req.userId = decoded.userId;
    req.role = decoded.role;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

// Authorize Student
function authorizeStudent(req, res, next) {
  if (req.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student role required.'
    });
  }
  next();
}

// Authorize Admin
function authorizeAdmin(req, res, next) {
  if (req.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
}

// Authorize Staff
function authorizeStaff(req, res, next) {
  if (req.role !== 'staff') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Staff role required.'
    });
  }
  next();
}

// Authorize Admin or Staff
function authorizeAdminOrStaff(req, res, next) {
  if (req.role !== 'admin' && req.role !== 'staff') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Staff role required.'
    });
  }
  next();
}

module.exports = {
  verifyToken,
  verifyStudent,
  verifyAdmin,
  authenticate,
  authorizeStudent,
  authorizeAdmin,
  authorizeStaff,
  authorizeAdminOrStaff
};
