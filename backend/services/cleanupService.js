const fs = require('fs');
const path = require('path');
const Post = require('../models/Post');

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const BATCH_LIMIT = 100; // max posts deleted per run
const LOG_FILE = path.join(__dirname, '..', 'logs', 'cleanup.log');

// ─── Logging ────────────────────────────────────────────────────────────────

function logCleanup(message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const line = `[${timestamp}] ${message}\n`;
  process.stdout.write(line);

  try {
    const logDir = path.dirname(LOG_FILE);
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(LOG_FILE, line);
  } catch (_) {
    // log file write failure should never crash the server
  }
}

// ─── File Deletion ───────────────────────────────────────────────────────────

function deleteFile(filePath) {
  try {
    if (!filePath) return true;
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    return true;
  } catch (err) {
    return false;
  }
}

// ─── Main Cleanup ────────────────────────────────────────────────────────────

/**
 * Clean up posts older than 1 year.
 * Safety rule: if file deletion fails → skip DB deletion.
 * Batch limit: max 100 posts per run.
 */
async function cleanOldPosts() {
  logCleanup('[Cleanup] Started');

  try {
    const cutoff = new Date(Date.now() - ONE_YEAR_MS);

    const oldPosts = await Post.find({ createdAt: { $lte: cutoff } })
      .limit(BATCH_LIMIT)
      .select('_id attachmentPath createdAt');

    logCleanup(`[Cleanup] Found ${oldPosts.length} old post(s) (limit: ${BATCH_LIMIT})`);

    if (oldPosts.length === 0) {
      logCleanup('[Cleanup] Nothing to delete. Done.');
      return { deleted: 0, skipped: 0 };
    }

    let deleted = 0;
    let skipped = 0;

    for (const post of oldPosts) {
      // Step 1: delete file if exists
      if (post.attachmentPath) {
        const fileDeleted = deleteFile(post.attachmentPath);
        if (!fileDeleted) {
          logCleanup(`[Cleanup] ERROR: Failed to delete file ${post.attachmentPath} — skipping post ${post._id}`);
          skipped++;
          continue;
        }
      }

      // Step 2: delete DB record only after file is gone
      try {
        await Post.findByIdAndDelete(post._id);
        deleted++;
      } catch (err) {
        logCleanup(`[Cleanup] ERROR: DB delete failed for post ${post._id} — ${err.message}`);
        skipped++;
      }
    }

    logCleanup(`[Cleanup] Deleted: ${deleted}, Skipped: ${skipped}`);
    logCleanup('[Cleanup] Completed');

    return { deleted, skipped };

  } catch (err) {
    logCleanup(`[Cleanup] FATAL ERROR: ${err.message}`);
    return { deleted: 0, skipped: 0 };
  }
}

module.exports = { cleanOldPosts };
