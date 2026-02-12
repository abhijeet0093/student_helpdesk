/**
 * Complete Backend Test Suite
 * Tests all components without starting the server
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🔍 COMPLETE BACKEND TEST SUITE\n');
console.log('='.repeat(60));

const errors = [];
const warnings = [];

// Test 1: Environment Variables
console.log('\n1️⃣ ENVIRONMENT VARIABLES');
console.log('-'.repeat(60));
if (process.env.MONGODB_URI) {
  console.log('✅ MONGODB_URI:', process.env.MONGODB_URI);
} else {
  errors.push('MONGODB_URI not set');
  console.log('❌ MONGODB_URI not set');
}

if (process.env.JWT_SECRET) {
  console.log('✅ JWT_SECRET: [HIDDEN]');
} else {
  errors.push('JWT_SECRET not set');
  console.log('❌ JWT_SECRET not set');
}

if (process.env.PORT) {
  console.log('✅ PORT:', process.env.PORT);
} else {
  warnings.push('PORT not set (will default to 5000)');
  console.log('⚠️  PORT not set (will default to 5000)');
}

// Test 2: Models
console.log('\n2️⃣ MODELS');
console.log('-'.repeat(60));
const models = ['Student', 'Admin', 'Staff', 'Complaint', 'Post', 'ChatSession', 'ChatMessage', 'UTResult', 'Subject', 'StudentMaster'];
models.forEach(modelName => {
  try {
    const model = require(`./models/${modelName}`);
    if (model.schema) {
      console.log(`✅ ${modelName} model loaded`);
    } else {
      warnings.push(`${modelName} model has no schema`);
      console.log(`⚠️  ${modelName} model has no schema`);
    }
  } catch (error) {
    errors.push(`${modelName} model error: ${error.message}`);
    console.log(`❌ ${modelName} model error:`, error.message);
  }
});

// Test 3: Utilities
console.log('\n3️⃣ UTILITIES');
console.log('-'.repeat(60));
try {
  const jwt = require('./utils/jwt');
  if (typeof jwt.generateToken === 'function' && typeof jwt.verifyToken === 'function') {
    console.log('✅ JWT utility loaded (generateToken, verifyToken)');
  } else {
    errors.push('JWT utility missing required functions');
    console.log('❌ JWT utility missing required functions');
  }
} catch (error) {
  errors.push(`JWT utility error: ${error.message}`);
  console.log('❌ JWT utility error:', error.message);
}

try {
  const nameNormalizer = require('./utils/nameNormalizer');
  console.log('✅ Name normalizer loaded');
} catch (error) {
  warnings.push(`Name normalizer not found: ${error.message}`);
  console.log('⚠️  Name normalizer not found');
}

try {
  const performanceAnalyzer = require('./utils/performanceAnalyzer');
  console.log('✅ Performance analyzer loaded');
} catch (error) {
  warnings.push(`Performance analyzer not found: ${error.message}`);
  console.log('⚠️  Performance analyzer not found');
}

// Test 4: Middleware
console.log('\n4️⃣ MIDDLEWARE');
console.log('-'.repeat(60));
try {
  const authMiddleware = require('./middleware/authMiddleware');
  const requiredFunctions = ['authenticate', 'authorizeStudent', 'authorizeAdmin', 'authorizeStaff', 'authorizeAdminOrStaff'];
  let allPresent = true;
  requiredFunctions.forEach(fn => {
    if (typeof authMiddleware[fn] === 'function') {
      console.log(`✅ ${fn}`);
    } else {
      errors.push(`authMiddleware.${fn} is not a function`);
      console.log(`❌ ${fn} missing`);
      allPresent = false;
    }
  });
  if (allPresent) {
    console.log('✅ All auth middleware functions present');
  }
} catch (error) {
  errors.push(`Auth middleware error: ${error.message}`);
  console.log('❌ Auth middleware error:', error.message);
}

// Test 5: Controllers
console.log('\n5️⃣ CONTROLLERS');
console.log('-'.repeat(60));

const controllers = {
  authController: ['registerStudent', 'loginStudent', 'loginAdmin', 'loginStaff'],
  complaintController: ['createComplaint', 'getMyComplaints', 'getComplaintById', 'getAllComplaints', 'updateComplaintStatus'],
  postController: ['createPost', 'getFeed', 'toggleLike', 'addComment', 'reportPost', 'deletePost'],
  aiController: ['sendMessage', 'getChatHistory', 'clearChatHistory'],
  resultController: ['enterResult', 'getMyResults', 'getStudentResults'],
  dashboardController: ['getStudentDashboard'],
  adminController: ['getAllComplaints', 'updateComplaintStatus', 'assignComplaint', 'getStaffList'],
  staffController: ['getAssignedComplaints', 'updateComplaintStatus']
};

Object.keys(controllers).forEach(controllerName => {
  try {
    const controller = require(`./controllers/${controllerName}`);
    const requiredFunctions = controllers[controllerName];
    let allPresent = true;
    requiredFunctions.forEach(fn => {
      if (typeof controller[fn] !== 'function') {
        errors.push(`${controllerName}.${fn} is not a function`);
        allPresent = false;
      }
    });
    if (allPresent) {
      console.log(`✅ ${controllerName} (${requiredFunctions.length} functions)`);
    } else {
      console.log(`❌ ${controllerName} missing functions`);
    }
  } catch (error) {
    errors.push(`${controllerName} error: ${error.message}`);
    console.log(`❌ ${controllerName} error:`, error.message);
  }
});

// Test 6: Routes
console.log('\n6️⃣ ROUTES');
console.log('-'.repeat(60));

const routes = ['authRoutes', 'complaintRoutes', 'postRoutes', 'aiRoutes', 'resultRoutes', 'dashboardRoutes', 'adminRoutes', 'staffRoutes'];

routes.forEach(routeName => {
  try {
    const route = require(`./routes/${routeName}`);
    if (route && typeof route === 'function') {
      console.log(`✅ ${routeName}`);
    } else {
      errors.push(`${routeName} is not a valid router`);
      console.log(`❌ ${routeName} is not a valid router`);
    }
  } catch (error) {
    errors.push(`${routeName} error: ${error.message}`);
    console.log(`❌ ${routeName} error:`, error.message);
  }
});

// Test 7: Config Files
console.log('\n7️⃣ CONFIG FILES');
console.log('-'.repeat(60));

try {
  const db = require('./config/db');
  console.log('✅ Database config loaded');
} catch (error) {
  warnings.push(`Database config not found: ${error.message}`);
  console.log('⚠️  Database config not found (using inline connection)');
}

try {
  const multerConfig = require('./config/multerConfig');
  console.log('✅ Multer config loaded');
} catch (error) {
  errors.push(`Multer config error: ${error.message}`);
  console.log('❌ Multer config error:', error.message);
}

try {
  const postUploadConfig = require('./config/postUploadConfig');
  console.log('✅ Post upload config loaded');
} catch (error) {
  errors.push(`Post upload config error: ${error.message}`);
  console.log('❌ Post upload config error:', error.message);
}

// Test 8: Services
console.log('\n8️⃣ SERVICES');
console.log('-'.repeat(60));

try {
  const aiService = require('./services/aiService');
  if (typeof aiService.generateAIResponse === 'function') {
    console.log('✅ AI service loaded');
  } else {
    errors.push('AI service missing generateAIResponse function');
    console.log('❌ AI service missing generateAIResponse function');
  }
} catch (error) {
  errors.push(`AI service error: ${error.message}`);
  console.log('❌ AI service error:', error.message);
}

// Test 9: Server File
console.log('\n9️⃣ SERVER FILE');
console.log('-'.repeat(60));

try {
  const fs = require('fs');
  const serverContent = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  
  if (serverContent.includes('app.listen')) {
    console.log('✅ Server file exists and has app.listen');
  } else {
    errors.push('Server file missing app.listen');
    console.log('❌ Server file missing app.listen');
  }
  
  if (serverContent.includes('mongoose.connect')) {
    console.log('✅ Server has MongoDB connection');
  } else {
    errors.push('Server missing MongoDB connection');
    console.log('❌ Server missing MongoDB connection');
  }
  
  if (serverContent.includes('/api/auth')) {
    console.log('✅ Auth routes registered');
  } else {
    warnings.push('Auth routes may not be registered');
    console.log('⚠️  Auth routes may not be registered');
  }
} catch (error) {
  errors.push(`Server file error: ${error.message}`);
  console.log('❌ Server file error:', error.message);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ ALL TESTS PASSED! No errors or warnings.');
  console.log('\n🚀 Backend is ready to run!');
  console.log('   Run: npm run dev');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log(`\n❌ ERRORS (${errors.length}):`);
    errors.forEach((err, index) => {
      console.log(`   ${index + 1}. ${err}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach((warn, index) => {
      console.log(`   ${index + 1}. ${warn}`);
    });
  }
  
  if (errors.length === 0) {
    console.log('\n✅ No critical errors found. Warnings can be ignored.');
    console.log('🚀 Backend should run successfully!');
    console.log('   Run: npm run dev');
    process.exit(0);
  } else {
    console.log('\n❌ Fix the errors above before running the server.');
    process.exit(1);
  }
}
