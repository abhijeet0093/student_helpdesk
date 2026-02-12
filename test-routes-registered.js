/**
 * TEST SCRIPT - Verify All Routes Are Registered
 * 
 * This script checks if all route files are properly imported
 * and registered in server.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('🔍 VERIFYING ROUTE REGISTRATION');
console.log('='.repeat(70) + '\n');

const serverPath = path.join(__dirname, 'backend', 'server.js');
const routesDir = path.join(__dirname, 'backend', 'routes');

try {
  // Read server.js content
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Get all route files
  const routeFiles = fs.readdirSync(routesDir)
    .filter(file => file.endsWith('Routes.js'));
  
  console.log(`📁 Found ${routeFiles.length} route files in backend/routes/\n`);
  
  let allRegistered = true;
  const results = [];
  
  // Check each route file
  routeFiles.forEach(file => {
    const routeName = file.replace('.js', '');
    const variableName = routeName; // e.g., authRoutes
    
    // Check if imported
    const importPattern = new RegExp(`require\\(['"]\\.\\/routes\\/${file}['"]\\)`);
    const isImported = importPattern.test(serverContent);
    
    // Check if used
    const usePattern = new RegExp(`app\\.use\\([^)]*${variableName}\\)`);
    const isUsed = usePattern.test(serverContent);
    
    const status = isImported && isUsed ? '✅' : '❌';
    
    results.push({
      file,
      variableName,
      isImported,
      isUsed,
      status
    });
    
    if (!isImported || !isUsed) {
      allRegistered = false;
    }
  });
  
  // Display results
  console.log('Route Registration Status:');
  console.log('-'.repeat(70));
  
  results.forEach(result => {
    console.log(`${result.status} ${result.file}`);
    if (!result.isImported) {
      console.log(`   ⚠️  NOT IMPORTED: Missing require() statement`);
    }
    if (!result.isUsed) {
      console.log(`   ⚠️  NOT USED: Missing app.use() statement`);
    }
    if (result.isImported && result.isUsed) {
      console.log(`   ✓ Imported and registered correctly`);
    }
    console.log('');
  });
  
  // Extract route mappings
  console.log('='.repeat(70));
  console.log('📍 ROUTE MAPPINGS');
  console.log('='.repeat(70) + '\n');
  
  const routeMappings = serverContent.match(/app\.use\(['"]([^'"]+)['"],\s*(\w+)\)/g);
  
  if (routeMappings) {
    routeMappings.forEach(mapping => {
      const match = mapping.match(/app\.use\(['"]([^'"]+)['"],\s*(\w+)\)/);
      if (match) {
        const [, path, handler] = match;
        console.log(`  ${path.padEnd(30)} → ${handler}`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 SUMMARY');
  console.log('='.repeat(70) + '\n');
  
  if (allRegistered) {
    console.log('✅ ALL ROUTES REGISTERED SUCCESSFULLY!');
    console.log('\n   All route files are properly imported and registered.');
    console.log('   The server should handle all API endpoints correctly.');
  } else {
    console.log('❌ SOME ROUTES ARE MISSING!');
    console.log('\n   Please ensure all route files are:');
    console.log('   1. Imported with require() at the top of server.js');
    console.log('   2. Registered with app.use() in the routes section');
  }
  
  console.log('\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
