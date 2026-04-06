/**
 * One-time fix: set isPublished = false on any UTResult
 * where isPublished is null/undefined (saved before the field existed).
 * Run once: node backend/scripts/fixResultsFlag.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const UTResult = require('../models/UTResult');

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  // Fix records where isPublished is not set
  const result = await UTResult.updateMany(
    { isPublished: { $exists: false } },
    { $set: { isPublished: false } }
  );
  console.log('Fixed (isPublished missing):', result.modifiedCount);

  // Also fix records where isPublished is null
  const result2 = await UTResult.updateMany(
    { isPublished: null },
    { $set: { isPublished: false } }
  );
  console.log('Fixed (isPublished null):', result2.modifiedCount);

  const total = await UTResult.countDocuments();
  const unpublished = await UTResult.countDocuments({ isPublished: false });
  const published = await UTResult.countDocuments({ isPublished: true });
  console.log(`Total: ${total} | Unpublished: ${unpublished} | Published: ${published}`);

  process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });
