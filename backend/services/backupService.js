const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const BACKUP_ROOT = path.join(__dirname, '..', 'backup');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const MAX_BACKUPS = 7;

// ─── Logging ────────────────────────────────────────────────────────────────

function getLogPath(dateFolder) {
  return path.join(dateFolder, 'backup.log');
}

function log(dateFolder, message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const line = `[${timestamp}] ${message}\n`;
  process.stdout.write(line);
  fs.appendFileSync(getLogPath(dateFolder), line);
}

// ─── Folder Setup ────────────────────────────────────────────────────────────

function getTodayFolder() {
  const today = new Date().toISOString().substring(0, 10); // YYYY-MM-DD
  const folder = path.join(BACKUP_ROOT, today);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  return folder;
}

// ─── DB Backup (mongodump) ───────────────────────────────────────────────────

function backupDatabase(dateFolder) {
  return new Promise((resolve, reject) => {
    const uri = process.env.MONGODB_URI;
    if (!uri) return reject(new Error('MONGODB_URI not set in .env'));

    // Use MONGODUMP_PATH from .env if mongodump is not in system PATH
    const mongodump = process.env.MONGODUMP_PATH || 'mongodump';
    const outFile = path.join(dateFolder, 'db-backup.gz');
    const cmd = `"${mongodump}" --uri="${uri}" --archive="${outFile}" --gzip`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(new Error(`mongodump failed: ${stderr || error.message}`));
      resolve(outFile);
    });
  });
}

// ─── Uploads Zip ─────────────────────────────────────────────────────────────

function backupUploads(dateFolder) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(UPLOADS_DIR)) {
      return resolve(null); // no uploads folder yet, skip silently
    }

    const outFile = path.join(dateFolder, 'uploads.zip');
    const output = fs.createWriteStream(outFile);
    const archive = archiver('zip', { zlib: { level: 6 } });

    output.on('close', () => resolve(outFile));
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.directory(UPLOADS_DIR, 'uploads');
    archive.finalize();
  });
}

// ─── Retention: keep last 7 backups ─────────────────────────────────────────

function cleanOldBackups(dateFolder) {
  if (!fs.existsSync(BACKUP_ROOT)) return;

  const folders = fs.readdirSync(BACKUP_ROOT)
    .filter(name => /^\d{4}-\d{2}-\d{2}$/.test(name))
    .sort(); // ascending → oldest first

  const toDelete = folders.slice(0, Math.max(0, folders.length - MAX_BACKUPS));

  toDelete.forEach(folder => {
    const fullPath = path.join(BACKUP_ROOT, folder);
    fs.rmSync(fullPath, { recursive: true, force: true });
    log(dateFolder, `Deleted old backup: ${folder}`);
  });
}

// ─── Main Backup Runner ──────────────────────────────────────────────────────

async function runBackup() {
  const dateFolder = getTodayFolder();

  log(dateFolder, 'Backup Started');

  try {
    // DB backup
    try {
      await backupDatabase(dateFolder);
      log(dateFolder, 'DB Backup Success');
    } catch (err) {
      log(dateFolder, `ERROR (DB): ${err.message}`);
    }

    // Uploads backup
    try {
      const result = await backupUploads(dateFolder);
      if (result) {
        log(dateFolder, 'Uploads Backup Success');
      } else {
        log(dateFolder, 'Uploads folder not found — skipped');
      }
    } catch (err) {
      log(dateFolder, `ERROR (Uploads): ${err.message}`);
    }

    // Clean old backups only after current backup completes
    cleanOldBackups(dateFolder);

    log(dateFolder, 'Backup Completed');
  } catch (err) {
    log(dateFolder, `ERROR: ${err.message}`);
  }
}

module.exports = { runBackup };
