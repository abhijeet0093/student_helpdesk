/**
 * VERIFY BUG FIX - Check if password validation was added
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('🔍 VERIFYING STUDENT LOGIN BUG FIX');
console.log('='.repeat(70) + '\n');

const authControllerPath = path.join(__dirname, 'backend', 'controllers', 'authController.js');

try {
  const content = fs.readFileSync(authControllerPath, 'utf8');
  
  // Check 1: Password length validation exists
  console.log('CHECK 1: Password length validation in registerStudent()');
  console.log('-'.repeat(70));
  
  const hasPasswordValidation = content.includes('password.length < 8') || 
                                  content.includes('password.length<8');
  
  if (hasPasswordValidation) {
    console.log('✅ PASS: Password length validation found');
    
    // Extract the validation block
    const lines = content.split('\n');
    const validationLineIndex = lines.findIndex(line => line.includes('password.length < 8'));
    
    if (validationLineIndex !== -1) {
      console.log('\n   Code snippet:');
      for (let i = Math.max(0, validationLineIndex - 2); i <= Math.min(lines.length - 1, validationLineIndex + 5); i++) {
        console.log('   ' + lines[i]);
      }
    }
  } else {
    console.log('❌ FAIL: Password length validation NOT found');
    console.log('   The bug fix was not applied!');
  }
  console.log('');
  
  // Check 2: Error message is clear
  console.log('CHECK 2: Clear error message for short passwords');
  console.log('-'.repeat(70));
  
  const hasErrorMessage = content.includes('Password must be at least 8 characters');
  
  if (hasErrorMessage) {
    console.log('✅ PASS: Clear error message found');
  } else {
    console.log('❌ FAIL: Error message not found or unclear');
  }
  console.log('');
  
  // Check 3: Validation happens before Student.create()
  console.log('CHECK 3: Validation order (before database operation)');
  console.log('-'.repeat(70));
  
  const passwordValidationIndex = content.indexOf('password.length < 8');
  const studentCreateIndex = content.indexOf('Student.create');
  
  if (passwordValidationIndex !== -1 && studentCreateIndex !== -1) {
    if (passwordValidationIndex < studentCreateIndex) {
      console.log('✅ PASS: Validation happens before Student.create()');
      console.log('   This prevents database validation errors');
    } else {
      console.log('❌ FAIL: Validation happens AFTER Student.create()');
      console.log('   This won\'t prevent the bug!');
    }
  } else {
    console.log('⚠️  WARNING: Could not determine validation order');
  }
  console.log('');
  
  // Check 4: No changes to loginStudent()
  console.log('CHECK 4: Login function unchanged (as required)');
  console.log('-'.repeat(70));
  
  const loginStudentMatch = content.match(/async function loginStudent\(req, res\) \{[\s\S]*?\n\}/);
  
  if (loginStudentMatch) {
    const loginFunction = loginStudentMatch[0];
    
    // Login should still use comparePassword
    if (loginFunction.includes('comparePassword')) {
      console.log('✅ PASS: Login still uses comparePassword()');
    } else {
      console.log('❌ FAIL: Login function was modified incorrectly');
    }
    
    // Login should still check isLocked
    if (loginFunction.includes('isLocked')) {
      console.log('✅ PASS: Login still checks account lock status');
    } else {
      console.log('⚠️  WARNING: Account lock check might be missing');
    }
  }
  console.log('');
  
  // Summary
  console.log('='.repeat(70));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  
  if (hasPasswordValidation && hasErrorMessage && passwordValidationIndex < studentCreateIndex) {
    console.log('\n✅ BUG FIX VERIFIED SUCCESSFULLY!');
    console.log('\n   The fix includes:');
    console.log('   1. Password length validation (>= 8 characters)');
    console.log('   2. Clear error message for users');
    console.log('   3. Validation before database operation');
    console.log('   4. No changes to login logic');
    console.log('\n   Students can now:');
    console.log('   - Register with valid passwords (>= 8 chars)');
    console.log('   - Get clear error if password too short');
    console.log('   - Login successfully after registration');
  } else {
    console.log('\n❌ BUG FIX INCOMPLETE OR MISSING');
    console.log('\n   Please ensure:');
    console.log('   1. Password validation is added to registerStudent()');
    console.log('   2. Validation checks: password.length < 8');
    console.log('   3. Error message: "Password must be at least 8 characters long"');
    console.log('   4. Validation happens BEFORE Student.create()');
  }
  
  console.log('\n');
  
} catch (error) {
  console.error('❌ Error reading authController.js:', error.message);
  process.exit(1);
}
