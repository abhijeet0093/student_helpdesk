const sharp = require('sharp');
const fs = require('fs');

/**
 * Compress an uploaded image in-place.
 * - Resize to max 800px width (preserves aspect ratio)
 * - JPEG/PNG quality: 60
 * - Overwrites the original file
 *
 * @param {string} filePath - absolute path to the uploaded image
 * @param {string} mimetype - file MIME type
 * @returns {Promise<void>}
 */
async function compressImage(filePath, mimetype) {
  const tempPath = `${filePath}.tmp`;

  try {
    const pipeline = sharp(filePath).resize({ width: 800, withoutEnlargement: true });

    if (mimetype === 'image/png') {
      await pipeline.png({ quality: 60 }).toFile(tempPath);
    } else {
      await pipeline.jpeg({ quality: 60 }).toFile(tempPath);
    }

    // Replace original with compressed version
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    // Clean up temp file if it exists
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    // Log but don't throw — upload still succeeds even if compression fails
    console.error('[ImageCompressor] Compression failed:', err.message);
  }
}

module.exports = { compressImage };
