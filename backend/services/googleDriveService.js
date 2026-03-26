const fs = require('fs');
const path = require('path');

/**
 * Google Drive PDF Upload Service
 *
 * SETUP REQUIRED (one-time):
 * 1. Go to https://console.cloud.google.com
 * 2. Create a project → Enable "Google Drive API"
 * 3. Create a Service Account → Download JSON key
 * 4. Share your Drive folder with the service account email
 * 5. Add to .env:
 *    GOOGLE_SERVICE_ACCOUNT_KEY=./config/google-service-account.json
 *    GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
 *
 * Until credentials are configured, uploadPDF returns null
 * and the local file path is used as fallback.
 */

let driveClient = null;

async function getDriveClient() {
  if (driveClient) return driveClient;

  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!keyPath || !folderId) return null;
  if (!fs.existsSync(path.resolve(keyPath))) return null;

  try {
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      keyFile: path.resolve(keyPath),
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    driveClient = google.drive({ version: 'v3', auth });
    return driveClient;
  } catch (err) {
    console.error('[GoogleDrive] Failed to init client:', err.message);
    return null;
  }
}

/**
 * Upload a PDF file to Google Drive.
 * @param {string} localFilePath - absolute path to the temp PDF file
 * @param {string} filename - desired filename on Drive
 * @returns {Promise<string|null>} public URL or null if Drive not configured
 */
async function uploadPDF(localFilePath, filename) {
  const drive = await getDriveClient();

  if (!drive) {
    console.warn('[GoogleDrive] Not configured — PDF stored locally as fallback');
    return null;
  }

  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const response = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId],
        mimeType: 'application/pdf'
      },
      media: {
        mimeType: 'application/pdf',
        body: fs.createReadStream(localFilePath)
      },
      fields: 'id, webViewLink'
    });

    const fileId = response.data.id;

    // Make file publicly readable
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' }
    });

    // Delete local temp file after successful upload
    fs.unlink(localFilePath, () => {});

    console.log('[GoogleDrive] PDF uploaded:', response.data.webViewLink);
    return response.data.webViewLink;

  } catch (err) {
    console.error('[GoogleDrive] Upload failed:', err.message);
    return null;
  }
}

/**
 * Delete a file from Google Drive by file ID.
 * @param {string} fileUrl - the webViewLink stored in DB
 */
async function deletePDF(fileUrl) {
  if (!fileUrl) return;

  const drive = await getDriveClient();
  if (!drive) return;

  try {
    // Extract file ID from URL: https://drive.google.com/file/d/FILE_ID/view
    const match = fileUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!match) return;

    await drive.files.delete({ fileId: match[1] });
    console.log('[GoogleDrive] PDF deleted:', match[1]);
  } catch (err) {
    console.error('[GoogleDrive] Delete failed:', err.message);
  }
}

module.exports = { uploadPDF, deletePDF };
