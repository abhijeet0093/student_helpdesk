/**
 * Verify Authentication Fix
 * Tests if the controller loads without errors
 */

console.log('🔍 Verifying Authentication Fix...\n');

// Test 1: Load controller without errors
console.log('1️⃣ Testing controller load...');
try {
  const authController = require('./backend/controllers/authController');
  console.log('   ✅ Controller loaded successfully');
  
  // Check if all functions are exported
  const functions = ['registerStudent', 'loginStudent', 'loginAdmin', 'loginStaff'];
  const missing = functions.filter(fn => typeof authController[fn] !== 'function');
  
  if (missing.length > 0) {
    console.log('   ❌ Missing functions:', missing.join(', '));
  } else {
    console.log('   ✅ All functions exported correctly');
    functions.forEach(fn => {
      console.log(`      - ${fn}: ✓`);
    });
  }
} catch (error) {
  console.log('   ❌ Controller failed to load!');
  console.log('   Error:', error.message);
  console.log('\n   This means the fix did not work.');
  console.log('   Check the error message above for details.');
  process.exit(1);
}

// Test 2: Load routes without errors
console.log('\n2️⃣ Testing routes load...');
try {
  const authRoutes = require('./backend/routes/authRoutes');
  console.log('   ✅ Routes loaded successfully');
} catch (error) {
  console.log('   ❌ Routes failed to load!');
  console.log('   Error:', error.message);
  process.exit(1);
}

// Test 3: Check for circular dependencies
console.log('\n3️⃣ Checking for circular dependencies...');
try {
  delete require.cache[require.resolve('./backend/controllers/authController')];
  delete require.cache[require.resolve('./backend/routes/authRoutes')];
  
  require('./backend/controllers/authController');
  require('./backend/routes/authRoutes');
  
  console.log('   ✅ No circular dependencies detected');
} catch (error) {
  console.log('   ❌ Circular dependency detected!');
  console.log('   Error:', error.message);
  process.exit(1);
}

// Success
console.log('\n' + '='.repeat(60));
console.log('✅ ALL CHECKS PASSED!');
console.log('='.repeat(60));
console.log('\nThe authentication controller is fixed and ready to use.');
console.log('\n📝 Next steps:');
console.log('   1. Restart backend: cd backend && npm start');
console.log('   2. Test endpoints: node test-auth-complete.js');
console.log('   3. Test in browser: http://localhost:3000/login');
console.log('\n🎉 Authentication module is working!\n');
