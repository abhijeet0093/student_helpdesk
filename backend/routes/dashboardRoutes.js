const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');
const { authenticate, authorizeStudent } = require('../middleware/authMiddleware');

/**
 * STUDENT DASHBOARD ROUTES
 * All routes require student authentication
 */

// Get dashboard data
// GET /api/student/dashboard
router.get('/dashboard', authenticate, authorizeStudent, getDashboardData);

module.exports = router;
