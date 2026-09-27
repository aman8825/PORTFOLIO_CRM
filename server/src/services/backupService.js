const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const archiver = require('archiver');
const util = require('util');

const BACKUP_DIR = path.join(__dirname, '../../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const performBackup = async () => {
  console.log('Starting automated database backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = `backup-${timestamp}.zip`;
  const backupPath = path.join(BACKUP_DIR, backupFilename);
  
  return new Promise(async (resolve, reject) => {
    try {
      const output = fs.createWriteStream(backupPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`Backup completed successfully: ${backupFilename} (${archive.pointer()} bytes)`);
        
        // Clean up old backups (keep only last 7)
        cleanOldBackups();
        
        resolve({
          filename: backupFilename,
          path: backupPath,
          size: archive.pointer(),
          createdAt: new Date()
        });
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      // Get all registered models in mongoose
      const models = mongoose.modelNames();
      
      for (const modelName of models) {
        const Model = mongoose.model(modelName);
        const data = await Model.find({});
        
        // Append stringified JSON to the zip
        archive.append(JSON.stringify(data, null, 2), { name: `${modelName.toLowerCase()}.json` });
      }

      archive.finalize();
    } catch (error) {
      console.error('Backup failed:', error);
      reject(error);
    }
  });
};

const cleanOldBackups = () => {
  fs.readdir(BACKUP_DIR, (err, files) => {
    if (err) return console.error('Failed to read backup dir', err);
    
    // Sort files by creation time (newest first)
    const sortedFiles = files
      .filter(f => f.endsWith('.zip'))
      .map(file => {
        const stat = fs.statSync(path.join(BACKUP_DIR, file));
        return { file, time: stat.mtime.getTime() };
      })
      .sort((a, b) => b.time - a.time);

    // Keep the first 7, delete the rest
    if (sortedFiles.length > 7) {
      const toDelete = sortedFiles.slice(7);
      toDelete.forEach(f => {
        fs.unlinkSync(path.join(BACKUP_DIR, f.file));
        console.log(`Deleted old backup: ${f.file}`);
      });
    }
  });
};

const listBackups = () => {
  try {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.zip'));
    return files.map(file => {
      const stat = fs.statSync(path.join(BACKUP_DIR, file));
      return {
        filename: file,
        size: stat.size,
        createdAt: stat.mtime
      };
    }).sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Failed to list backups:', error);
    return [];
  }
};

module.exports = {
  performBackup,
  listBackups,
  BACKUP_DIR
};
