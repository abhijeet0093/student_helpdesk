/**
 * FIX STUDENT COLLECTION INDEXES
 * Removes broken/old indexes and ensures correct ones exist
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function fixIndexes() {
  try {
    console.log('=== FIXING STUDENT INDEXES ===\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('students');

    // Get all existing indexes
    console.log('Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });
    console.log();

    // Check for problematic indexes
    const problematicIndexes = indexes.filter(index => 
      index.name.includes('studentMasterId') || 
      index.name.includes('studentMaster')
    );

    if (problematicIndexes.length > 0) {
      console.log('⚠ Found problematic indexes:');
      problematicIndexes.forEach(index => {
        console.log(`  - ${index.name}`);
      });
      console.log();

      // Drop problematic indexes
      for (const index of problematicIndexes) {
        try {
          await collection.dropIndex(index.name);
          console.log(`✓ Dropped index: ${index.name}`);
        } catch (error) {
          console.error(`✗ Failed to drop ${index.name}:`, error.message);
        }
      }
      console.log();
    } else {
      console.log('✓ No problematic indexes found\n');
    }

    // Ensure correct indexes exist
    console.log('Ensuring correct indexes...');
    
    const requiredIndexes = [
      { key: { rollNumber: 1 }, unique: true, name: 'rollNumber_1' },
      { key: { enrollmentNumber: 1 }, unique: true, name: 'enrollmentNumber_1' },
      { key: { email: 1 }, unique: true, name: 'email_1' }
    ];

    for (const indexSpec of requiredIndexes) {
      try {
        const existingIndex = indexes.find(idx => idx.name === indexSpec.name);
        if (!existingIndex) {
          await collection.createIndex(indexSpec.key, { 
            unique: indexSpec.unique,
            name: indexSpec.name 
          });
          console.log(`✓ Created index: ${indexSpec.name}`);
        } else {
          console.log(`✓ Index exists: ${indexSpec.name}`);
        }
      } catch (error) {
        console.error(`✗ Failed to create ${indexSpec.name}:`, error.message);
      }
    }
    console.log();

    // Show final indexes
    console.log('Final indexes:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key, index.unique ? '(unique)' : '');
    });
    console.log();

    console.log('=== INDEX FIX COMPLETE ===');
    console.log('✓ Removed any studentMasterId indexes');
    console.log('✓ Ensured correct unique indexes exist');
    console.log('✓ Registration should now work properly\n');

  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

fixIndexes();
