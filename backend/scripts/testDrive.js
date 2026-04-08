/**
 * Test Google Drive connection
 * Run: node backend/scripts/testDrive.js
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function test() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!keyPath) {
    console.error('❌ GOOGLE_SERVICE_ACCOUNT_KEY not set in .env');
    process.exit(1);
  }

  const resolved = path.resolve(path.join(__dirname, '..'), keyPath);
  if (!fs.existsSync(resolved)) {
    console.error('❌ JSON key file not found at:', resolved);
    process.exit(1);
  }

  console.log('✅ JSON key file found:', resolved);

  try {
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      keyFile: resolved,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const drive = google.drive({ version: 'v3', auth });

    // Create a small test file
    const testContent = `SmartCampus Drive Test - ${new Date().toISOString()}`;
    const tmpFile = path.join(__dirname, 'drive-test.txt');
    fs.writeFileSync(tmpFile, testContent);

    // Check if folder ID is set
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      console.warn('⚠️  GOOGLE_DRIVE_FOLDER_ID not set — uploading to root (may fail without shared folder)');
    } else {
      console.log('✅ Folder ID:', folderId);
    }

    // Upload test file
    console.log('📤 Uploading test file to Drive...');
    const uploadOptions = {
      requestBody: { name: 'smartcampus-test.txt', mimeType: 'text/plain' },
      media: { mimeType: 'text/plain', body: fs.createReadStream(tmpFile) },
      fields: 'id, webViewLink'
    };
    if (folderId) uploadOptions.requestBody.parents = [folderId];

    const response = await drive.files.create(uploadOptions);
    console.log('✅ File uploaded! ID:', fileId);

    // Make public
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' }
    });
    console.log('✅ File made public:', response.data.webViewLink);

    // Delete test file from Drive
    await drive.files.delete({ fileId });
    console.log('✅ Test file deleted from Drive');

    // Clean up local temp file
    fs.unlinkSync(tmpFile);

    console.log('\n🎉 Google Drive is working correctly!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Drive test failed:', err.message);
    process.exit(1);
  }
}

test();
