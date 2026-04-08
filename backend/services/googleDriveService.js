const fs = require('fs');
const path = require('path');

/**
 * Google Drive Upload Service
 * No manual folder sharing needed — service account creates its own folder.
 *
 * SETUP:
 * 1. Place JSON key at: backend/config/google-service-account.json
 * 2. Add to .env:
 *    GOOGLE_SERVICE_ACCOUNT_KEY=./config/google-service-account.json
 */

let driveClient = null;
let cachedFolderId = null;

async function getDriveClient() {
  if (driveClient) return driveClient;

  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyPath || !fs.existsSync(path.resolve(keyPath))) return null;

  try {
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      keyFile: path.resolve(keyPath),
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    driveClient = google.drive({ version: 'v3', auth });
    return driveClient;
  } catch (err) {
    console.error('[GoogleDrive] Failed to init client:', err.message);
    return null;
  }
}

async function getOrCreateFolder(drive) {
  if (process.env.GOOGLE_DRIVE_FOLDER_ID) return process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (cachedFolderId) return cachedFolderId;

  try {
    const existing = await drive.files.list({
      q: "name='SmartCampus-Uploads' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id)'
    });

    if (existing.data.files.length > 0) {
      cachedFolderId = existing.data.files[0].id;
      return cachedFolderId;
    }

    const folder = await drive.files.create({
      requestBody: { name: 'SmartCampus-Uploads', mimeType: 'application/vnd.google-apps.folder' },
      fields: 'id'
    });
    cachedFolderId = folder.data.id;
    console.log('[GoogleDrive] Created folder:', cachedFolderId);
    return cachedFolderId;
  } catch (err) {
    console.error('[GoogleDrive] Folder error:', err.message);
    return null;
  }
}

async function uploadFile(localFilePath, filename, mimeType) {
  const drive = await getDriveClient();
  if (!drive) {
    console.warn('[GoogleDrive] Not configured — file stored locally as fallback');
    return null;
  }

  try {
    const folderId = await getOrCreateFolder(drive);
    if (!folderId) return null;

    const response = await drive.files.create({
      requestBody: { name: filename, parents: [folderId], mimeType },
      media: { mimeType, body: fs.createReadStream(localFilePath) },
      fields: 'id, webViewLink'
    });

    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: { role: 'reader', type: 'anyone' }
    });

    fs.unlink(localFilePath, () => {});
    console.log('[GoogleDrive] Uploaded:', response.data.webViewLink);
    return response.data.webViewLink;
  } catch (err) {
    console.error('[GoogleDrive] Upload failed:', err.message);
    return null;
  }
}

async function uploadPDF(localFilePath, filename) {
  return uploadFile(localFilePath, filename, 'application/pdf');
}

async function uploadImage(localFilePath, filename, mimeType = 'image/jpeg') {
  return uploadFile(localFilePath, filename, mimeType);
}

async function deleteDriveFile(fileUrl) {
  if (!fileUrl) return;
  const drive = await getDriveClient();
  if (!drive) return;

  try {
    const match = fileUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!match) return;
    await drive.files.delete({ fileId: match[1] });
    console.log('[GoogleDrive] Deleted:', match[1]);
  } catch (err) {
    console.error('[GoogleDrive] Delete failed:', err.message);
  }
}

const deletePDF = deleteDriveFile;

module.exports = { uploadPDF, uploadImage, deletePDF, deleteDriveFile };
