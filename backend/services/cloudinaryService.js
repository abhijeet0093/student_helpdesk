const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure once
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isConfigured() {
  return !!(process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET);
}

/**
 * Upload an image to Cloudinary.
 * Returns secure URL or null on failure.
 */
async function uploadImage(localFilePath, folder = 'smartcampus/images') {
  if (!isConfigured()) return null;
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: 'image',
      transformation: [{ width: 800, crop: 'limit', quality: 'auto' }]
    });
    fs.unlink(localFilePath, () => {});
    console.log('[Cloudinary] Image uploaded:', result.secure_url);
    return result.secure_url;
  } catch (err) {
    console.error('[Cloudinary] Image upload failed:', err.message);
    return null;
  }
}

/**
 * Upload a PDF to Cloudinary.
 * Returns secure URL or null on failure.
 */
async function uploadPDF(localFilePath, folder = 'smartcampus/documents') {
  if (!isConfigured()) return null;
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: 'raw'
    });
    fs.unlink(localFilePath, () => {});
    console.log('[Cloudinary] PDF uploaded:', result.secure_url);
    return result.secure_url;
  } catch (err) {
    console.error('[Cloudinary] PDF upload failed:', err.message);
    return null;
  }
}

/**
 * Delete a file from Cloudinary by its URL.
 */
async function deleteFile(fileUrl) {
  if (!isConfigured() || !fileUrl) return;
  try {
    // Extract public_id from URL
    const parts = fileUrl.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return;
    // Remove version segment (v1234567) if present
    const afterUpload = parts.slice(uploadIndex + 1);
    if (/^v\d+$/.test(afterUpload[0])) afterUpload.shift();
    const publicIdWithExt = afterUpload.join('/');
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    console.log('[Cloudinary] Deleted:', publicId);
  } catch (err) {
    console.error('[Cloudinary] Delete failed:', err.message);
  }
}

module.exports = { uploadImage, uploadPDF, deleteFile, isConfigured };
