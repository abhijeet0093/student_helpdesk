/**
 * Show Login Credentials
 * Quick display of all login credentials
 */

console.log('\n' + '='.repeat(60));
console.log('🔐 SMART CAMPUS - LOGIN CREDENTIALS');
console.log('='.repeat(60) + '\n');

console.log('👨‍🎓 STUDENT LOGIN');
console.log('-'.repeat(60));
console.log('Option 1: Register New Student (Recommended)');
console.log('  1. Go to: http://localhost:3000/register');
console.log('  2. Fill in form with your details');
console.log('  3. Use Roll Number format: CS2024001, IT2024001, etc.');
console.log('  4. Set password (min 6 characters)');
console.log('  5. Login with your Roll Number and Password');
console.log('');
console.log('Option 2: Use Seeded Student');
console.log('  First run: node backend/scripts/seedStudentsNew.js');
console.log('  Roll Number: CS2021001');
console.log('  Password: student123');
console.log('');
console.log('  Other seeded students:');
console.log('  - IT2021002 / student123');
console.log('  - ENTC2021003 / student123');
console.log('  - CS2022004 / student123');
console.log('  - IT2022005 / student123');
console.log('');

console.log('👨‍💼 ADMIN LOGIN');
console.log('-'.repeat(60));
console.log('First run: node backend/scripts/seedAdmin.js');
console.log('Username: admin');
console.log('Password: admin123');
console.log('');

console.log('👨‍🏫 STAFF LOGIN');
console.log('-'.repeat(60));
console.log('First run: node backend/scripts/seedStaff.js');
console.log('');
console.log('Option 1:');
console.log('  Email: rajesh.staff@college.edu');
console.log('  Password: staff123');
console.log('');
console.log('Option 2:');
console.log('  Email: priya.staff@college.edu');
console.log('  Password: staff123');
console.log('');

console.log('='.repeat(60));
console.log('🌐 LOGIN URL');
console.log('='.repeat(60));
console.log('http://localhost:3000/login');
console.log('');

console.log('='.repeat(60));
console.log('🚀 QUICK SETUP');
console.log('='.repeat(60));
console.log('1. Start MongoDB: mongod');
console.log('2. Start Backend: cd backend && npm run dev');
console.log('3. Start Frontend: cd frontend && npm start');
console.log('4. Seed accounts:');
console.log('   node backend/scripts/seedAdmin.js');
console.log('   node backend/scripts/seedStaff.js');
console.log('   node backend/scripts/seedStudentsNew.js (optional)');
console.log('5. Login at: http://localhost:3000/login');
console.log('');

console.log('='.repeat(60));
console.log('📖 MORE INFO');
console.log('='.repeat(60));
console.log('Detailed guide: ALL_LOGIN_CREDENTIALS.md');
console.log('Quick reference: LOGIN_CREDENTIALS.txt');
console.log('Check database: node get-credentials.js');
console.log('');

console.log('✅ Student registration is NOW FIXED and working!');
console.log('');
