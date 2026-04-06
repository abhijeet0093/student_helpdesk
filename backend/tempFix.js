const mongoose = require('mongoose');
require('dotenv').config();

const UTResult = require('./models/UTResult');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB.");
    
    // Emergency data fix
    const res = await UTResult.updateMany({}, { $set: { isPublished: true } });
    console.log(`Updated ${res.modifiedCount} records to isPublished: true`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
