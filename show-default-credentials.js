/**
 * Show Default Credentials
 * Works without MongoDB connection
 */

console.log('\n' + '='.repeat(60));
console.log('🔐 DEFAULT LOGIN CREDENTIALS');
console.log('='.repeat(60) + '\n');

console.log('👨‍💼 ADMIN LOGIN');
console.log('-'.repeat(60));
console.log('Username: admin');
console.log('Password: admin123');
console.log('Login URL: http://localhost:3000/login (Admin tab)');
console.log('Create: node backend/scripts/seedAdmin.js');
console.log('');

console.log('👨‍🏫 STAFF LOGIN');
console.log('-'.repeat(60));
console.log('Email: rajesh.staff@college.edu');
console.log('Password: staff123');
console.log('Login URL: http://localhost:3000/login (Staff tab)');
console.log('');
console.log('Alternative Staff:');
console.log('Email: priya.staff@college.edu');
console.log('Password: staff123');
console.log('Create: node backend/scripts/seedStaff.js');
console.log('');

console.log('👨‍🎓 STUDENT LOGIN');
console.log('-'.repeat(60));
console.log('Roll Number: [Your Roll Number]');
console.log('Password: [Your Password]');
console.log('Login URL: http://localhost:3000/login (Student tab)');
console.log('');
console.log('Note: Students must register first');
console.log('Register at: http://localhost:3000/register');
console.log('');

console.log('='.repeat(60));
console.log('🚀 QUICK SETUP');
console.log('='.repeat(60));
console.log('');
console.log('1. Create Admin:');
console.log('   node backend/scripts/seedAdmin.js');
console.log('');
console.log('2. Create Staff:');
console.log('   node backend/scripts/seedStaff.js');
console.log('');
console.log('3. Create Student Master Data:');
console.log('   node backend/scripts/seedStudentMaster.js');
console.log('');
console.log('4. Check existing credentials (requires MongoDB):');
console.log('   node get-credentials.js');
console.log('');

console.log('='.repeat(60));
console.log('📖 MORE INFORMATION');
console.log('='.repeat(60));
console.log('');
console.log('Complete Guide: GET_CREDENTIALS.md');
console.log('Quick Reference: CREDENTIALS_QUICK_REFERENCE.txt');
console.log('Summary: CREDENTIALS_SUMMARY.md');
console.log('');

console.log('='.repeat(60));
console.log('✅ READY TO LOGIN!');
console.log('='.repeat(60));
console.log('');
console.log('Use the credentials above to login at:');
console.log('http://localhost:3000/login');
console.log('');
