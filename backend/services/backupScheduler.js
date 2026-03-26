const cron = require('node-cron');
const { runBackup } = require('./backupService');
const { cleanOldPosts } = require('./cleanupService');

/**
 * Backup Scheduler — daily at 2:00 AM IST
 * Cleanup Scheduler — weekly on Sunday at 3:00 AM IST
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
      console.log(`[Cleanup Scheduler] Done — deleted: ${result.deleted}, skipped: ${result.skipped}`);
    } catch (err) {
      console.error('[Cleanup Scheduler] Error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  console.log('[Backup Scheduler] Scheduled: daily backup at 2:00 AM IST');
  console.log('[Cleanup Scheduler] Scheduled: weekly post cleanup on Sunday at 3:00 AM IST');
}

module.exports = { startBackupScheduler };
