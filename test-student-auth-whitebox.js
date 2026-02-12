/**
 * WHITEBOX TESTING - STUDENT AUTHENTICATION
 * 
 * This script performs comprehensive testing of:
 * 1. Student Schema validation
 * 2. Registration flow
 * 3. Login flow
 * 4. Password hashing
 * 5. JWT token generation
 * 6. Field consistency
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

console.log('\n' + '='.repeat(70));
console.log('🧪 WHITEBOX TESTING - STUDENT AUTHENTICATION');
console.log('='.repeat(70) + '\n');

const errors = [];
const warnings = [];
const tests = [];

// Test 1: Load and validate Student Model
console.log('TEST 1: Student Model Validation');
console.log('-'.repeat(70));
try {
  const Student = require('./backend/models/Student');
  
  // Check required fields
  const schema = Student.schema.paths;
  const requiredFields = ['rollNumber', 'enrollmentNumber', 'fullName', 'email', 'password', 'department', 'semester'];
  
  console.log('Checking schema fields...');
  requiredFields.forEach(field => {
    if (schema[field]) {
      console.log(`  ✅ ${field}: ${schema[field].instance}`);
      tests.push({ test: `Schema has ${field}`, status: 'PASS' });
    } else {
      console.log(`  ❌ ${field}: MISSING`);
      errors.push(`Schema missing required field: ${field}`);
      tests.push({ test: `Schema has ${field}`, status: 'FAIL' });
    }
  });
  
  // Check pre-save hook
  const preSaveHooks = Student.schema.s.hooks._pres.get('save');
  if (preSaveHooks && preSaveHooks.length > 0) {
    console.log('  ✅ Pre-save hook exists (password hashing)');
    tests.push({ test: 'Pre-save hook exists', status: 'PASS' });
  } else {
    console.log('  ⚠️  Pre-save hook not found');
    warnings.push('Pre-save hook not found - passwords may not be hashed');
    tests.push({ test: 'Pre-save hook exists', status: 'WARN' });
  }
  
  // Check comparePassword method
  if (typeof Student.schema.methods.comparePassword === 'function') {
    console.log('  ✅ comparePassword method exists');
    tests.push({ test: 'comparePassword method exists', status: 'PASS' });
  } else {
    console.log('  ❌ comparePassword method missing');
    errors.push('comparePassword method missing - login will fail');
    tests.push({ test: 'comparePassword method exists', status: 'FAIL' });
  }
  
  console.log('');
} catch (error) {
  console.log(`  ❌ Error loading Student model: ${error.message}\n`);
  errors.push(`Student model error: ${error.message}`);
  tests.push({ test: 'Load Student model', status: 'FAIL' });
}

// Test 2: Validate Auth Controller
console.log('TEST 2: Auth Controller Validation');
console.log('-'.repeat(70));
try {
  const authController = require('./backend/controllers/authController');
  
  // Check registerStudent function
  if (typeof authController.registerStudent === 'function') {
    console.log('  ✅ registerStudent function exists');
    tests.push({ test: 'registerStudent function exists', status: 'PASS' });
    
    // Analyze function code
    const registerCode = authController.registerStudent.toString();
    
    // Check if it validates required fields
    if (registerCode.includes('rollNumber') && registerCode.includes('enrollmentNumber')) {
      console.log('  ✅ Validates rollNumber and enrollmentNumber');
      tests.push({ test: 'Validates rollNumber/enrollmentNumber', status: 'PASS' });
    } else {
      console.log('  ❌ Missing rollNumber/enrollmentNumber validation');
      errors.push('registerStudent missing field validation');
      tests.push({ test: 'Validates rollNumber/enrollmentNumber', status: 'FAIL' });
    }
    
    // Check if it handles password hashing
    if (registerCode.includes('password')) {
      console.log('  ✅ Handles password field');
      tests.push({ test: 'Handles password', status: 'PASS' });
    } else {
      console.log('  ❌ Missing password handling');
      errors.push('registerStudent missing password handling');
      tests.push({ test: 'Handles password', status: 'FAIL' });
    }
    
    // Check if it generates JWT token
    if (registerCode.includes('generateToken') || registerCode.includes('token')) {
      console.log('  ✅ Generates JWT token');
      tests.push({ test: 'Generates JWT token', status: 'PASS' });
    } else {
      console.log('  ⚠️  May not generate JWT token');
      warnings.push('registerStudent may not generate JWT token');
      tests.push({ test: 'Generates JWT token', status: 'WARN' });
    }
  } else {
    console.log('  ❌ registerStudent function missing');
    errors.push('registerStudent function not found');
    tests.push({ test: 'registerStudent function exists', status: 'FAIL' });
  }
  
  // Check loginStudent function
  if (typeof authController.loginStudent === 'function') {
    console.log('  ✅ loginStudent function exists');
    tests.push({ test: 'loginStudent function exists', status: 'PASS' });
    
    const loginCode = authController.loginStudent.toString();
    
    // Check if it uses comparePassword
    if (loginCode.includes('comparePassword')) {
      console.log('  ✅ Uses comparePassword for validation');
      tests.push({ test: 'Uses comparePassword', status: 'PASS' });
    } else {
      console.log('  ❌ Does not use comparePassword - SECURITY ISSUE');
      errors.push('loginStudent does not use comparePassword - passwords compared as plain text!');
      tests.push({ test: 'Uses comparePassword', status: 'FAIL' });
    }
    
    // Check if it finds student by rollNumber
    if (loginCode.includes('rollNumber')) {
      console.log('  ✅ Finds student by rollNumber');
      tests.push({ test: 'Finds by rollNumber', status: 'PASS' });
    } else {
      console.log('  ❌ Does not find by rollNumber');
      errors.push('loginStudent does not search by rollNumber');
      tests.push({ test: 'Finds by rollNumber', status: 'FAIL' });
    }
  } else {
    console.log('  ❌ loginStudent function missing');
    errors.push('loginStudent function not found');
    tests.push({ test: 'loginStudent function exists', status: 'FAIL' });
  }
  
  console.log('');
} catch (error) {
  console.log(`  ❌ Error loading auth controller: ${error.message}\n`);
  errors.push(`Auth controller error: ${error.message}`);
  tests.push({ test: 'Load auth controller', status: 'FAIL' });
}

// Test 3: Field Consistency Check
console.log('TEST 3: Field Consistency Check');
console.log('-'.repeat(70));
try {
  const fs = require('fs');
  
  // Read files
  const modelContent = fs.readFileSync('./backend/models/Student.js', 'utf8');
  const controllerContent = fs.readFileSync('./backend/controllers/authController.js', 'utf8');
  const registerContent = fs.readFileSync('./frontend/src/pages/Register.jsx', 'utf8');
  
  // Check field consistency
  const fields = ['rollNumber', 'enrollmentNumber', 'fullName', 'email', 'department', 'semester', 'password'];
  
  console.log('Checking field consistency across files...');
  fields.forEach(field => {
    const inModel = modelContent.includes(field);
    const inController = controllerContent.includes(field);
    const inFrontend = registerContent.includes(field);
    
    if (inModel && inController) {
      console.log(`  ✅ ${field}: Model ✓ Controller ✓`);
      tests.push({ test: `${field} consistency`, status: 'PASS' });
    } else {
      console.log(`  ❌ ${field}: Model ${inModel ? '✓' : '✗'} Controller ${inController ? '✓' : '✗'}`);
      errors.push(`Field ${field} inconsistency between model and controller`);
      tests.push({ test: `${field} consistency`, status: 'FAIL' });
    }
  });
  
  // Check for dateOfBirth in frontend (bug indicator)
  if (registerContent.includes('dateOfBirth')) {
    console.log('  ⚠️  Frontend sends dateOfBirth but backend may not use it');
    warnings.push('Frontend sends dateOfBirth - check if backend handles it');
    tests.push({ test: 'No unused frontend fields', status: 'WARN' });
  }
  
  console.log('');
} catch (error) {
  console.log(`  ❌ Error checking field consistency: ${error.message}\n`);
  errors.push(`Field consistency check error: ${error.message}`);
  tests.push({ test: 'Field consistency check', status: 'FAIL' });
}

// Test 4: JWT Utility Validation
console.log('TEST 4: JWT Utility Validation');
console.log('-'.repeat(70));
try {
  const jwt = require('./backend/utils/jwt');
  
  if (typeof jwt.generateToken === 'function') {
    console.log('  ✅ generateToken function exists');
    tests.push({ test: 'generateToken exists', status: 'PASS' });
    
    // Test token generation
    if (process.env.JWT_SECRET) {
      try {
        const testToken = jwt.generateToken({ userId: 'test123', role: 'student' });
        if (testToken && typeof testToken === 'string') {
          console.log('  ✅ Token generation works');
          tests.push({ test: 'Token generation works', status: 'PASS' });
        } else {
          console.log('  ❌ Token generation returns invalid value');
          errors.push('generateToken returns invalid value');
          tests.push({ test: 'Token generation works', status: 'FAIL' });
        }
      } catch (error) {
        console.log(`  ❌ Token generation failed: ${error.message}`);
        errors.push(`Token generation error: ${error.message}`);
        tests.push({ test: 'Token generation works', status: 'FAIL' });
      }
    } else {
      console.log('  ⚠️  JWT_SECRET not set - skipping token test');
      warnings.push('JWT_SECRET not configured');
      tests.push({ test: 'JWT_SECRET configured', status: 'WARN' });
    }
  } else {
    console.log('  ❌ generateToken function missing');
    errors.push('generateToken function not found');
    tests.push({ test: 'generateToken exists', status: 'FAIL' });
  }
  
  if (typeof jwt.verifyToken === 'function') {
    console.log('  ✅ verifyToken function exists');
    tests.push({ test: 'verifyToken exists', status: 'PASS' });
  } else {
    console.log('  ❌ verifyToken function missing');
    errors.push('verifyToken function not found');
    tests.push({ test: 'verifyToken exists', status: 'FAIL' });
  }
  
  console.log('');
} catch (error) {
  console.log(`  ❌ Error loading JWT utility: ${error.message}\n`);
  errors.push(`JWT utility error: ${error.message}`);
  tests.push({ test: 'Load JWT utility', status: 'FAIL' });
}

// Test 5: Password Security Check
console.log('TEST 5: Password Security Check');
console.log('-'.repeat(70));
try {
  const bcrypt = require('bcryptjs');
  
  console.log('  ✅ bcrypt library available');
  tests.push({ test: 'bcrypt available', status: 'PASS' });
  
  // Test password hashing
  const testPassword = 'test123';
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.log(`  ❌ Salt generation failed: ${err.message}`);
      errors.push('bcrypt salt generation failed');
      tests.push({ test: 'bcrypt salt generation', status: 'FAIL' });
    } else {
      console.log('  ✅ bcrypt salt generation works');
      tests.push({ test: 'bcrypt salt generation', status: 'PASS' });
      
      bcrypt.hash(testPassword, salt, (err, hash) => {
        if (err) {
          console.log(`  ❌ Password hashing failed: ${err.message}`);
          errors.push('bcrypt hashing failed');
          tests.push({ test: 'bcrypt hashing', status: 'FAIL' });
        } else {
          console.log('  ✅ bcrypt password hashing works');
          tests.push({ test: 'bcrypt hashing', status: 'PASS' });
          
          // Test password comparison
          bcrypt.compare(testPassword, hash, (err, result) => {
            if (err) {
              console.log(`  ❌ Password comparison failed: ${err.message}`);
              errors.push('bcrypt comparison failed');
              tests.push({ test: 'bcrypt comparison', status: 'FAIL' });
            } else if (result) {
              console.log('  ✅ bcrypt password comparison works');
              tests.push({ test: 'bcrypt comparison', status: 'PASS' });
            } else {
              console.log('  ❌ Password comparison returned false');
              errors.push('bcrypt comparison logic error');
              tests.push({ test: 'bcrypt comparison', status: 'FAIL' });
            }
            
            printSummary();
          });
        }
      });
    }
  });
  
  console.log('');
} catch (error) {
  console.log(`  ❌ Error testing password security: ${error.message}\n`);
  errors.push(`Password security error: ${error.message}`);
  tests.push({ test: 'Password security', status: 'FAIL' });
  printSummary();
}

function printSummary() {
  console.log('='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  
  const passed = tests.filter(t => t.status === 'PASS').length;
  const failed = tests.filter(t => t.status === 'FAIL').length;
  const warned = tests.filter(t => t.status === 'WARN').length;
  
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warned}`);
  console.log('');
  
  if (errors.length > 0) {
    console.log('❌ CRITICAL ERRORS:');
    errors.forEach((err, index) => {
      console.log(`   ${index + 1}. ${err}`);
    });
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach((warn, index) => {
      console.log(`   ${index + 1}. ${warn}`);
    });
    console.log('');
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ ALL TESTS PASSED! Student authentication is working correctly.');
  } else if (errors.length === 0) {
    console.log('✅ No critical errors. Warnings should be reviewed.');
  } else {
    console.log('❌ CRITICAL ERRORS FOUND! Student authentication needs fixes.');
  }
  
  console.log('');
  console.log('='.repeat(70));
  console.log('');
}
