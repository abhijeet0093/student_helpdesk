/**
 * Backend Startup Test
 * Tests if all files load without errors
 */

console.log('🔍 Testing Backend Startup...\n');

const errors = [];

// Test 1: Load environment variables
console.log('1️⃣ Testing environment variables...');
try {
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '.env') });
  if (!process.env.MONGODB_URI) {
    errors.push('MONGODB_URI not set in .env');
  }
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET not set in .env');
  }
  console.log('   ✅ Environment variables loaded\n');
} catch (error) {
  errors.push(`Environment error: ${error.message}`);
  console.log('   ❌ Environment error:', error.message, '\n');
}

// Test 2: Load models
console.log('2️⃣ Testing models...');
try {
  const Student = require('./models/Student');
  console.log('   ✅ Student model loaded');
} catch (error) {
  errors.push(`Student model error: ${error.message}`);
  console.log('   ❌ Student model error:', error.message);
}

try {
  const Admin = require('./models/Admin');
  console.log('   ✅ Admin model loaded');
} catch (error) {
  errors.push(`Admin model error: ${error.message}`);
  console.log('   ❌ Admin model error:', error.message);
}

try {
  const Staff = require('./models/Staff');
  console.log('   ✅ Staff model loaded');
} catch (error) {
  errors.push(`Staff model error: ${error.message}`);
  console.log('   ❌ Staff model error:', error.message);
}

try {
  const Complaint = require('./models/Complaint');
  console.log('   ✅ Complaint model loaded\n');
} catch (error) {
  errors.push(`Complaint model error: ${error.message}`);
  console.log('   ❌ Complaint model error:', error.message, '\n');
}

// Test 3: Load utilities
console.log('3️⃣ Testing utilities...');
try {
  const jwt = require('./utils/jwt');
  if (typeof jwt.generateToken !== 'function') {
    errors.push('generateToken is not a function');
  }
  if (typeof jwt.verifyToken !== 'function') {
    errors.push('verifyToken is not a function');
  }
  console.log('   ✅ JWT utility loaded\n');
} catch (error) {
  errors.push(`JWT utility error: ${error.message}`);
  console.log('   ❌ JWT utility error:', error.message, '\n');
}

// Test 4: Load middleware
console.log('4️⃣ Testing middleware...');
try {
  const authMiddleware = require('./middleware/authMiddleware');
  if (typeof authMiddleware.verifyStudent !== 'function') {
    errors.push('verifyStudent is not a function');
  }
  if (typeof authMiddleware.verifyAdmin !== 'function') {
    errors.push('verifyAdmin is not a function');
  }
  console.log('   ✅ Auth middleware loaded\n');
} catch (error) {
  errors.push(`Auth middleware error: ${error.message}`);
  console.log('   ❌ Auth middleware error:', error.message, '\n');
}

// Test 5: Load controllers
console.log('5️⃣ Testing controllers...');
try {
  const authController = require('./controllers/authController');
  const requiredFunctions = ['registerStudent', 'loginStudent', 'loginAdmin', 'loginStaff'];
  requiredFunctions.forEach(fn => {
    if (typeof authController[fn] !== 'function') {
      errors.push(`authController.${fn} is not a function`);
    }
  });
  console.log('   ✅ Auth controller loaded');
} catch (error) {
  errors.push(`Auth controller error: ${error.message}`);
  console.log('   ❌ Auth controller error:', error.message);
}

try {
  const complaintController = require('./controllers/complaintController');
  const requiredFunctions = ['createComplaint', 'getMyComplaints', 'getComplaintById', 'getAllComplaints', 'updateComplaintStatus'];
  requiredFunctions.forEach(fn => {
    if (typeof complaintController[fn] !== 'function') {
      errors.push(`complaintController.${fn} is not a function`);
    }
  });
  console.log('   ✅ Complaint controller loaded\n');
} catch (error) {
  errors.push(`Complaint controller error: ${error.message}`);
  console.log('   ❌ Complaint controller error:', error.message, '\n');
}

// Test 6: Load routes
console.log('6️⃣ Testing routes...');

// Clear require cache to get fresh imports
const clearCache = (modulePath) => {
  try {
    const resolvedPath = require.resolve(modulePath);
    delete require.cache[resolvedPath];
  } catch (e) {
    // Module not in cache
  }
};

clearCache('./routes/authRoutes');
clearCache('./routes/complaintRoutes');
clearCache('./controllers/authController');
clearCache('./controllers/complaintController');
clearCache('./middleware/authMiddleware');

try {
  const authRoutes = require('./routes/authRoutes');
  console.log('   ✅ Auth routes loaded');
} catch (error) {
  errors.push(`Auth routes error: ${error.message}`);
  console.log('   ❌ Auth routes error:', error.message);
}

try {
  const complaintRoutes = require('./routes/complaintRoutes');
  console.log('   ✅ Complaint routes loaded\n');
} catch (error) {
  errors.push(`Complaint routes error: ${error.message}`);
  console.log('   ❌ Complaint routes error:', error.message, '\n');
}

// Test 7: Check for circular dependencies
console.log('7️⃣ Testing for circular dependencies...');
try {
  delete require.cache[require.resolve('./controllers/authController')];
  delete require.cache[require.resolve('./routes/authRoutes')];
  require('./controllers/authController');
  require('./routes/authRoutes');
  console.log('   ✅ No circular dependencies\n');
} catch (error) {
  errors.push(`Circular dependency: ${error.message}`);
  console.log('   ❌ Circular dependency:', error.message, '\n');
}

// Summary
console.log('='.repeat(60));
if (errors.length === 0) {
  console.log('✅ ALL TESTS PASSED!');
  console.log('='.repeat(60));
  console.log('\nThe backend is ready to start.');
  console.log('Run: npm run dev\n');
  process.exit(0);
} else {
  console.log('❌ TESTS FAILED!');
  console.log('='.repeat(60));
  console.log('\nErrors found:');
  errors.forEach((err, index) => {
    console.log(`${index + 1}. ${err}`);
  });
  console.log('\nFix these errors before starting the server.\n');
  process.exit(1);
}
