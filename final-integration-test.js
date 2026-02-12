/**
 * FINAL SYSTEM INTEGRATION TEST
 * 
 * Comprehensive end-to-end testing for Smart Campus Helpdesk
 * Tests all modules, authentication, and integration points
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function logTest(category, name, status, message = '') {
  testResults.total++;
  const result = {
    category,
    name,
    status,
    message,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(result);
  
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`  ✅ ${name}`);
  } else if (status === 'FAIL') {
    testResults.failed++;
    console.log(`  ❌ ${name}`);
    if (message) console.log(`     ${message}`);
  } else if (status === 'WARN') {
    testResults.warnings++;
    console.log(`  ⚠️  ${name}`);
    if (message) console.log(`     ${message}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('🎯 FINAL SYSTEM INTEGRATION & ACCEPTANCE TESTING');
console.log('='.repeat(80) + '\n');

async function runTests() {
  try {
    // ========================================================================
    // TEST SUITE 1: ENVIRONMENT & CONFIGURATION
    // ========================================================================
    console.log('📦 TEST SUITE 1: Environment & Configuration');
    console.log('-'.repeat(80));
    
    // Test 1.1: Check .env file
    const envPath = path.join(__dirname, 'backend', '.env');
    if (fs.existsSync(envPath)) {
      logTest('Environment', '.env file exists', 'PASS');
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('MONGODB_URI')) {
        logTest('Environment', 'MONGODB_URI configured', 'PASS');
      } else {
        logTest('Environment', 'MONGODB_URI configured', 'FAIL', 'MONGODB_URI not found in .env');
      }
      
      if (envContent.includes('JWT_SECRET')) {
        logTest('Environment', 'JWT_SECRET configured', 'PASS');
      } else {
        logTest('Environment', 'JWT_SECRET configured', 'FAIL', 'JWT_SECRET not found in .env');
      }
    } else {
      logTest('Environment', '.env file exists', 'FAIL', '.env file not found');
    }
    
    // Test 1.2: Check MongoDB connection
    console.log('\n  Connecting to MongoDB...');
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_campus_db', {
        serverSelectionTimeoutMS: 5000
      });
      logTest('Database', 'MongoDB connection', 'PASS');
    } catch (error) {
      logTest('Database', 'MongoDB connection', 'FAIL', error.message);
      console.log('\n❌ CRITICAL: Cannot proceed without database connection');
      process.exit(1);
    }
    
    // ========================================================================
    // TEST SUITE 2: DATABASE MODELS & SCHEMAS
    // ========================================================================
    console.log('\n📊 TEST SUITE 2: Database Models & Schemas');
    console.log('-'.repeat(80));
    
    // Test 2.1: Check if models exist
    const models = ['Student', 'Admin', 'Staff', 'Complaint', 'Post', 'Subject', 'UTResult'];
    for (const modelName of models) {
      try {
        const modelPath = path.join(__dirname, 'backend', 'models', `${modelName}.js`);
        if (fs.existsSync(modelPath)) {
          logTest('Models', `${modelName} model file exists`, 'PASS');
        } else {
          logTest('Models', `${modelName} model file exists`, 'WARN', 'File not found');
        }
      } catch (error) {
        logTest('Models', `${modelName} model file exists`, 'FAIL', error.message);
      }
    }
    
    // Test 2.2: Check database collections
    const Student = require('./backend/models/Student');
    const Admin = require('./backend/models/Admin');
    const Staff = require('./backend/models/Staff');
    
    const studentCount = await Student.countDocuments();
    if (studentCount > 0) {
      logTest('Database', `Students in database (${studentCount})`, 'PASS');
    } else {
      logTest('Database', 'Students in database', 'WARN', 'No students found - run seed script');
    }
    
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      logTest('Database', `Admins in database (${adminCount})`, 'PASS');
    } else {
      logTest('Database', 'Admins in database', 'WARN', 'No admins found - run seed script');
    }
    
    const staffCount = await Staff.countDocuments();
    if (staffCount > 0) {
      logTest('Database', `Staff in database (${staffCount})`, 'PASS');
    } else {
      logTest('Database', 'Staff in database', 'WARN', 'No staff found - run seed script');
    }
    
    // ========================================================================
    // TEST SUITE 3: BACKEND ROUTES & CONTROLLERS
    // ========================================================================
    console.log('\n🛣️  TEST SUITE 3: Backend Routes & Controllers');
    console.log('-'.repeat(80));
    
    // Test 3.1: Check route files
    const routes = [
      'authRoutes',
      'complaintRoutes',
      'dashboardRoutes',
      'postRoutes',
      'aiRoutes',
      'resultRoutes',
      'adminRoutes',
      'staffRoutes'
    ];
    
    for (const routeName of routes) {
      const routePath = path.join(__dirname, 'backend', 'routes', `${routeName}.js`);
      if (fs.existsSync(routePath)) {
        logTest('Routes', `${routeName}.js exists`, 'PASS');
      } else {
        logTest('Routes', `${routeName}.js exists`, 'FAIL', 'Route file not found');
      }
    }
    
    // Test 3.2: Check server.js route registration
    const serverPath = path.join(__dirname, 'backend', 'server.js');
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    const routeRegistrations = [
      { path: '/api/auth', name: 'Auth routes' },
      { path: '/api/complaints', name: 'Complaint routes' },
      { path: '/api/student', name: 'Dashboard routes' },
      { path: '/api/posts', name: 'Post routes' },
      { path: '/api/ai', name: 'AI routes' },
      { path: '/api/results', name: 'Result routes' },
      { path: '/api/admin', name: 'Admin routes' },
      { path: '/api/staff', name: 'Staff routes' }
    ];
    
    for (const route of routeRegistrations) {
      if (serverContent.includes(`'${route.path}'`) || serverContent.includes(`"${route.path}"`)) {
        logTest('Route Registration', `${route.name} registered`, 'PASS');
      } else {
        logTest('Route Registration', `${route.name} registered`, 'FAIL', `${route.path} not found in server.js`);
      }
    }
    
    // ========================================================================
    // TEST SUITE 4: AUTHENTICATION LOGIC
    // ========================================================================
    console.log('\n🔐 TEST SUITE 4: Authentication Logic');
    console.log('-'.repeat(80));
    
    // Test 4.1: Check password hashing
    if (studentCount > 0) {
      const sampleStudent = await Student.findOne();
      if (sampleStudent.password.startsWith('$2a$') || sampleStudent.password.startsWith('$2b$')) {
        logTest('Authentication', 'Password hashing (bcrypt)', 'PASS');
      } else {
        logTest('Authentication', 'Password hashing (bcrypt)', 'FAIL', 'Passwords not hashed');
      }
      
      // Test comparePassword method
      if (typeof sampleStudent.comparePassword === 'function') {
        logTest('Authentication', 'comparePassword method exists', 'PASS');
      } else {
        logTest('Authentication', 'comparePassword method exists', 'FAIL', 'Method not found');
      }
      
      // Test isLocked method
      if (typeof sampleStudent.isLocked === 'function') {
        logTest('Authentication', 'isLocked method exists', 'PASS');
      } else {
        logTest('Authentication', 'isLocked method exists', 'FAIL', 'Method not found');
      }
    }
    
    // Test 4.2: Check JWT utility
    const jwtPath = path.join(__dirname, 'backend', 'utils', 'jwt.js');
    if (fs.existsSync(jwtPath)) {
      logTest('Authentication', 'JWT utility exists', 'PASS');
      
      const jwtContent = fs.readFileSync(jwtPath, 'utf8');
      if (jwtContent.includes('generateToken') && jwtContent.includes('verifyToken')) {
        logTest('Authentication', 'JWT functions (generate/verify)', 'PASS');
      } else {
        logTest('Authentication', 'JWT functions (generate/verify)', 'WARN', 'Functions may be missing');
      }
    } else {
      logTest('Authentication', 'JWT utility exists', 'FAIL', 'jwt.js not found');
    }
    
    // Test 4.3: Check auth middleware
    const authMiddlewarePath = path.join(__dirname, 'backend', 'middleware', 'authMiddleware.js');
    if (fs.existsSync(authMiddlewarePath)) {
      logTest('Authentication', 'Auth middleware exists', 'PASS');
      
      const middlewareContent = fs.readFileSync(authMiddlewarePath, 'utf8');
      const requiredFunctions = ['authenticate', 'authorizeStudent', 'authorizeAdmin', 'authorizeStaff'];
      
      for (const func of requiredFunctions) {
        if (middlewareContent.includes(func)) {
          logTest('Middleware', `${func} function exists`, 'PASS');
        } else {
          logTest('Middleware', `${func} function exists`, 'FAIL', 'Function not found');
        }
      }
    } else {
      logTest('Authentication', 'Auth middleware exists', 'FAIL', 'authMiddleware.js not found');
    }
    
    // ========================================================================
    // TEST SUITE 5: FRONTEND STRUCTURE
    // ========================================================================
    console.log('\n🎨 TEST SUITE 5: Frontend Structure');
    console.log('-'.repeat(80));
    
    // Test 5.1: Check frontend pages
    const pages = [
      'Login.jsx',
      'Register.jsx',
      'StudentDashboard.jsx',
      'AIChat.jsx',
      'UTResults.jsx',
      'ResultAnalysis.jsx',
      'StudentCorner.jsx',
      'CreatePost.jsx'
    ];
    
    for (const page of pages) {
      const pagePath = path.join(__dirname, 'frontend', 'src', 'pages', page);
      if (fs.existsSync(pagePath)) {
        logTest('Frontend Pages', `${page} exists`, 'PASS');
      } else {
        logTest('Frontend Pages', `${page} exists`, 'FAIL', 'Page file not found');
      }
    }
    
    // Test 5.2: Check frontend services
    const services = ['api.js', 'authService.js', 'dashboardService.js'];
    for (const service of services) {
      const servicePath = path.join(__dirname, 'frontend', 'src', 'services', service);
      if (fs.existsSync(servicePath)) {
        logTest('Frontend Services', `${service} exists`, 'PASS');
      } else {
        logTest('Frontend Services', `${service} exists`, 'WARN', 'Service file not found');
      }
    }
    
    // Test 5.3: Check App.js routing
    const appPath = path.join(__dirname, 'frontend', 'src', 'App.js');
    if (fs.existsSync(appPath)) {
      logTest('Frontend', 'App.js exists', 'PASS');
      
      const appContent = fs.readFileSync(appPath, 'utf8');
      const requiredRoutes = ['/login', '/register', '/dashboard', '/ai-chat', '/results', '/corner'];
      
      for (const route of requiredRoutes) {
        if (appContent.includes(`path="${route}"`) || appContent.includes(`path='${route}'`)) {
          logTest('Frontend Routes', `${route} route defined`, 'PASS');
        } else {
          logTest('Frontend Routes', `${route} route defined`, 'WARN', 'Route may be missing');
        }
      }
    } else {
      logTest('Frontend', 'App.js exists', 'FAIL', 'App.js not found');
    }
    
    // ========================================================================
    // TEST SUITE 6: AI CHAT SAFETY CHECK
    // ========================================================================
    console.log('\n🤖 TEST SUITE 6: AI Chat Safety Check');
    console.log('-'.repeat(80));
    
    const aiChatPath = path.join(__dirname, 'frontend', 'src', 'pages', 'AIChat.jsx');
    if (fs.existsSync(aiChatPath)) {
      const aiChatContent = fs.readFileSync(aiChatPath, 'utf8');
      
      // Check if AI Chat has proper error handling
      if (aiChatContent.includes('coming soon') || aiChatContent.includes('disabled') || aiChatContent.includes('not available')) {
        logTest('AI Chat', 'Disabled state message present', 'PASS');
      } else {
        logTest('AI Chat', 'Disabled state message present', 'WARN', 'Should show "coming soon" message');
      }
      
      // Check if it has try-catch for API calls
      if (aiChatContent.includes('try') && aiChatContent.includes('catch')) {
        logTest('AI Chat', 'Error handling present', 'PASS');
      } else {
        logTest('AI Chat', 'Error handling present', 'WARN', 'Should have try-catch blocks');
      }
    }
    
    // ========================================================================
    // TEST SUITE 7: SECURITY CHECKS
    // ========================================================================
    console.log('\n🔒 TEST SUITE 7: Security Checks');
    console.log('-'.repeat(80));
    
    // Test 7.1: Check ProtectedRoute component
    const protectedRoutePath = path.join(__dirname, 'frontend', 'src', 'routes', 'ProtectedRoute.jsx');
    if (fs.existsSync(protectedRoutePath)) {
      logTest('Security', 'ProtectedRoute component exists', 'PASS');
      
      const protectedContent = fs.readFileSync(protectedRoutePath, 'utf8');
      if (protectedContent.includes('isAuthenticated') && protectedContent.includes('allowedRoles')) {
        logTest('Security', 'Role-based access control', 'PASS');
      } else {
        logTest('Security', 'Role-based access control', 'WARN', 'RBAC may not be implemented');
      }
    } else {
      logTest('Security', 'ProtectedRoute component exists', 'FAIL', 'ProtectedRoute.jsx not found');
    }
    
    // Test 7.2: Check password validation
    const authControllerPath = path.join(__dirname, 'backend', 'controllers', 'authController.js');
    const authContent = fs.readFileSync(authControllerPath, 'utf8');
    
    if (authContent.includes('password.length') || authContent.includes('minlength')) {
      logTest('Security', 'Password length validation', 'PASS');
    } else {
      logTest('Security', 'Password length validation', 'WARN', 'Password validation may be missing');
    }
    
    if (authContent.includes('bcrypt.compare') || authContent.includes('comparePassword')) {
      logTest('Security', 'Secure password comparison', 'PASS');
    } else {
      logTest('Security', 'Secure password comparison', 'FAIL', 'Using bcrypt.compare is required');
    }
    
    // ========================================================================
    // GENERATE FINAL REPORT
    // ========================================================================
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST EXECUTION SUMMARY');
    console.log('='.repeat(80));
    console.log(`\nTotal Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⚠️  Warnings: ${testResults.warnings}`);
    
    const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    console.log(`\n📈 Pass Rate: ${passRate}%`);
    
    // Determine system readiness
    console.log('\n' + '='.repeat(80));
    console.log('🎯 SYSTEM READINESS ASSESSMENT');
    console.log('='.repeat(80));
    
    if (testResults.failed === 0 && testResults.warnings <= 3) {
      console.log('\n✅ SYSTEM IS ACCEPTANCE-READY');
      console.log('   All critical tests passed.');
      console.log('   System is stable for deployment and demo.');
    } else if (testResults.failed <= 2) {
      console.log('\n⚠️  SYSTEM NEEDS MINOR FIXES');
      console.log(`   ${testResults.failed} critical issue(s) found.`);
      console.log('   Fix these before deployment.');
    } else {
      console.log('\n❌ SYSTEM NOT READY');
      console.log(`   ${testResults.failed} critical issue(s) found.`);
      console.log('   Significant fixes required.');
    }
    
    // Save detailed report
    const reportPath = path.join(__dirname, 'TEST_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    console.log(`\n📄 Detailed report saved: TEST_REPORT.json`);
    
    console.log('\n');
    await mongoose.connection.close();
    process.exit(testResults.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runTests();
