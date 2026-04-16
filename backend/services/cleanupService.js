const fs = require('fs');
const path = require('path');
const Post = require('../models/Post');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');

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

// ─── Post Cleanup ────────────────────────────────────────────────────────────

/**
 * Clean up posts older than 1 year.
 * Safety rule: if file deletion fails → skip DB deletion.
 * Batch limit: max 100 posts per run.
 */
async function cleanOldPosts() {
  logCleanup('[PostCleanup] Started');

  try {
    const cutoff = new Date(Date.now() - ONE_YEAR_MS);

    const oldPosts = await Post.find({ createdAt: { $lte: cutoff } })
      .limit(BATCH_LIMIT)
      .select('_id attachmentPath createdAt');

    logCleanup(`[PostCleanup] Found ${oldPosts.length} old post(s) (limit: ${BATCH_LIMIT})`);

    if (oldPosts.length === 0) {
      logCleanup('[PostCleanup] Nothing to delete. Done.');
      return { deleted: 0, skipped: 0 };
    }

    let deleted = 0;
    let skipped = 0;

    for (const post of oldPosts) {
      if (post.attachmentPath) {
        const fileDeleted = deleteFile(post.attachmentPath);
        if (!fileDeleted) {
          logCleanup(`[PostCleanup] ERROR: Failed to delete file ${post.attachmentPath} — skipping post ${post._id}`);
          skipped++;
          continue;
        }
      }

      try {
        await Post.findByIdAndDelete(post._id);
        deleted++;
      } catch (err) {
        logCleanup(`[PostCleanup] ERROR: DB delete failed for post ${post._id} — ${err.message}`);
        skipped++;
      }
    }

    logCleanup(`[PostCleanup] Deleted: ${deleted}, Skipped: ${skipped}`);
    logCleanup('[PostCleanup] Completed');

    return { deleted, skipped };

  } catch (err) {
    logCleanup(`[PostCleanup] FATAL ERROR: ${err.message}`);
    return { deleted: 0, skipped: 0 };
  }
}

// ─── Orphaned ChatSession Cleanup ────────────────────────────────────────────

/**
 * Remove ChatSessions that have no remaining messages.
 * MongoDB TTL deletes ChatMessages after 30 days, but the parent
 * ChatSession may linger. This cleans those up.
 */
async function cleanOrphanedChatSessions() {
  logCleanup('[ChatCleanup] Started orphaned session cleanup');

  try {
    // Find all session IDs that still have at least one message
    const activeSessions = await ChatMessage.distinct('sessionId');

    // Delete sessions NOT in that set
    const result = await ChatSession.deleteMany({
      _id: { $nin: activeSessions }
    });

    logCleanup(`[ChatCleanup] Removed ${result.deletedCount} orphaned session(s)`);
    return { deleted: result.deletedCount };
  } catch (err) {
    logCleanup(`[ChatCleanup] ERROR: ${err.message}`);
    return { deleted: 0 };
  }
}

module.exports = { cleanOldPosts, cleanOrphanedChatSessions };
