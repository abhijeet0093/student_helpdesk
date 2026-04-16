const cron = require('node-cron');
const { runBackup } = require('./backupService');
const { cleanOldPosts, cleanOrphanedChatSessions } = require('./cleanupService');

/**
 * Backup Scheduler  — daily at 2:00 AM IST
 * Post Cleanup      — weekly on Sunday at 3:00 AM IST
 * Chat Session GC   — weekly on Sunday at 3:30 AM IST
 */
function startBackupScheduler() {
  // Daily backup at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('[Backup Scheduler] Starting daily backup...');
    await runBackup();
  }, { timezone: 'Asia/Kolkata' });

  // Weekly post cleanup every Sunday at 3:00 AM
  cron.schedule('0 3 * * 0', async () => {
    console.log('[Cleanup Scheduler] Starting weekly post cleanup...');
    try {
      const result = await cleanOldPosts();
      console.log(`[Cleanup Scheduler] Posts — deleted: ${result.deleted}, skipped: ${result.skipped}`);
    } catch (err) {
      console.error('[Cleanup Scheduler] Post cleanup error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  // Orphaned chat session GC every Sunday at 3:30 AM
  cron.schedule('30 3 * * 0', async () => {
    console.log('[Chat GC] Starting orphaned session cleanup...');
    try {
      const result = await cleanOrphanedChatSessions();
      console.log(`[Chat GC] Removed ${result.deleted} orphaned session(s)`);
    } catch (err) {
      console.error('[Chat GC] Error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  console.log('[Backup Scheduler] Scheduled: daily backup at 2:00 AM IST');
  console.log('[Cleanup Scheduler] Scheduled: weekly post cleanup on Sunday at 3:00 AM IST');
  console.log('[Chat GC] Scheduled: orphaned session cleanup on Sunday at 3:30 AM IST');
}

module.exports = { startBackupScheduler };
