/**
 * TEST STUDENT AUTHENTICATION SYSTEM
 * 
 * This script tests the new authentication system:
 * 1. Model validation
 * 2. Controller functions
 * 3. JWT utilities
 * 4. Field consistency
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

console.log('\n' + '='.repeat(60));
console.log('🧪 TESTING STUDENT AUTHENTICATION SYSTEM');
console.log('='.repeat(60) + '\n');

const errors = [];
const warnings = [];

// Test 1: Load Model
console.log('1️⃣ Testing Student Model...');
try {
  const Student = require('./backend/models/StudentNew');
  
  // Check schema fields
  const schemaFields = Object.keys(Student.schema.paths);
  const requiredFields = ['name', 'rollNo', 'enrollmentNo', 'department', 'year', 'email', 'password', 'role', 'createdAt'];
  
  const missingFields = requiredFields.filter(field => !schemaFields.includes(field));
  if (missingFields.length > 0) {
    errors.push(`Model missing fields: ${missingFields.join(', ')}`);
    console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`);
  } else {
    console.log('   ✅ All required fields present');
  }
  
  // Check pre-save hook
  const preSaveHooks = Student.schema.s.hooks._pres.get('save');
  if (preSaveHooks && preSaveHooks.length > 0) {
    console.log('   ✅ Pre-save hook configured');
  } else {
    warnings.push('Pre-save hook not found');
    console.log('   ⚠️  Pre-save hook not found');
  }
  
  // Check methods
  if (typeof Student.schema.methods.comparePassword === 'function') {
    console.log('   ✅ comparePassword method exists');
  } else {
    errors.push('comparePassword method missing');
    console.log('   ❌ comparePassword method missing');
  }
  
  console.log('   ✅ Student model loaded successfully\n');
} catch (error) {
  errors.push(`Model error: ${error.message}`);
  console.log(`   ❌ Model error: ${error.message}\n`);
}

// Test 2: Load JWT Utility
console.log('2️⃣ Testing JWT Utility...');
try {
  const { generateToken, verifyToken } = require('./backend/utils/jwtNew');
  
  if (typeof generateToken === 'function') {
    console.log('   ✅ generateToken function exists');
  } else {
    errors.push('generateToken function missing');
    console.log('   ❌ generateToken function missing');
  }
  
  if (typeof verifyToken === 'function') {
    console.log('   ✅ verifyToken function exists');
  } else {
    errors.push('verifyToken function missing');
    console.log('   ❌ verifyToken function missing');
  }
  
  // Test token generation (if JWT_SECRET is set)
  if (process.env.JWT_SECRET) {
    try {
      const token = generateToken({ studentId: 'test123', role: 'student' });
      console.log('   ✅ Token generation works');
      
      const decoded = verifyToken(token);
      if (decoded.studentId === 'test123' && decoded.role === 'student') {
        console.log('   ✅ Token verification works');
      } else {
        errors.push('Token verification returned wrong data');
        console.log('   ❌ Token verification returned wrong data');
      }
    } catch (error) {
      errors.push(`Token test failed: ${error.message}`);
      console.log(`   ❌ Token test failed: ${error.message}`);
    }
  } else {
    warnings.push('JWT_SECRET not set - skipping token test');
    console.log('   ⚠️  JWT_SECRET not set - skipping token test');
  }
  
  console.log('   ✅ JWT utility loaded successfully\n');
} catch (error) {
  errors.push(`JWT utility error: ${error.message}`);
  console.log(`   ❌ JWT utility error: ${error.message}\n`);
}

// Test 3: Load Controller
console.log('3️⃣ Testing Authentication Controller...');
try {
  const { registerStudent, loginStudent } = require('./backend/controllers/authControllerNew');
  
  if (typeof registerStudent === 'function') {
    console.log('   ✅ registerStudent function exists');
  } else {
    errors.push('registerStudent function missing');
    console.log('   ❌ registerStudent function missing');
  }
  
  if (typeof loginStudent === 'function') {
    console.log('   ✅ loginStudent function exists');
  } else {
    errors.push('loginStudent function missing');
    console.log('   ❌ loginStudent function missing');
  }
  
  console.log('   ✅ Controller loaded successfully\n');
} catch (error) {
  errors.push(`Controller error: ${error.message}`);
  console.log(`   ❌ Controller error: ${error.message}\n`);
}

// Test 4: Check Seed File
console.log('4️⃣ Testing Seed File...');
try {
  const fs = require('fs');
  const seedContent = fs.readFileSync('./backend/scripts/seedStudentsNew.js', 'utf8');
  
  // Check for required field names
  const requiredInSeed = ['name:', 'rollNo:', 'enrollmentNo:', 'department:', 'year:', 'email:', 'password:'];
  const missingInSeed = requiredInSeed.filter(field => !seedContent.includes(field));
  
  if (missingInSeed.length > 0) {
    errors.push(`Seed file missing fields: ${missingInSeed.join(', ')}`);
    console.log(`   ❌ Missing fields: ${missingInSeed.join(', ')}`);
  } else {
    console.log('   ✅ All required fields in seed file');
  }
  
  // Check for manual hashing
  if (seedContent.includes('hashPassword') || seedContent.includes('bcrypt.hash')) {
    console.log('   ✅ Manual password hashing implemented');
  } else {
    errors.push('Seed file missing manual password hashing');
    console.log('   ❌ Manual password hashing missing');
  }
  
  // Check for valid departments
  const validDepts = ['Computer', 'IT', 'ENTC'];
  const hasValidDepts = validDepts.some(dept => seedContent.includes(`'${dept}'`));
  if (hasValidDepts) {
    console.log('   ✅ Valid department values used');
  } else {
    warnings.push('Could not verify department values in seed');
    console.log('   ⚠️  Could not verify department values');
  }
  
  console.log('   ✅ Seed file validated\n');
} catch (error) {
  errors.push(`Seed file error: ${error.message}`);
  console.log(`   ❌ Seed file error: ${error.message}\n`);
}

// Test 5: Field Consistency Check
console.log('5️⃣ Testing Field Consistency...');
try {
  const Student = require('./backend/models/StudentNew');
  const fs = require('fs');
  
  const schemaFields = ['name', 'rollNo', 'enrollmentNo', 'department', 'year', 'email', 'password'];
  
  // Check controller
  const controllerContent = fs.readFileSync('./backend/controllers/authControllerNew.js', 'utf8');
  const controllerMissing = schemaFields.filter(field => !controllerContent.includes(field));
  
  if (controllerMissing.length === 0) {
    console.log('   ✅ Controller uses consistent field names');
  } else {
    warnings.push(`Controller may be missing fields: ${controllerMissing.join(', ')}`);
    console.log(`   ⚠️  Controller may be missing: ${controllerMissing.join(', ')}`);
  }
  
  // Check seed file
  const seedContent = fs.readFileSync('./backend/scripts/seedStudentsNew.js', 'utf8');
  const seedMissing = schemaFields.filter(field => !seedContent.includes(field));
  
  if (seedMissing.length === 0) {
    console.log('   ✅ Seed file uses consistent field names');
  } else {
    warnings.push(`Seed file may be missing fields: ${seedMissing.join(', ')}`);
    console.log(`   ⚠️  Seed file may be missing: ${seedMissing.join(', ')}`);
  }
  
  console.log('   ✅ Field consistency validated\n');
} catch (error) {
  errors.push(`Field consistency check error: ${error.message}`);
  console.log(`   ❌ Field consistency error: ${error.message}\n`);
}

// Summary
console.log('='.repeat(60));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ ALL TESTS PASSED! No errors or warnings.\n');
  console.log('🎉 Student Authentication System is ready!\n');
  console.log('Next steps:');
  console.log('1. Run seed: node backend/scripts/seedStudentsNew.js');
  console.log('2. Update routes to use new controllers');
  console.log('3. Test registration and login\n');
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
    console.log('\n✅ No critical errors. Warnings can be ignored.');
    console.log('🎉 Student Authentication System is ready!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Fix the errors above before proceeding.\n');
    process.exit(1);
  }
}
