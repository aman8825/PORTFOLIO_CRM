const path = require('path');
const fs = require('fs');
const { performBackup, listBackups, BACKUP_DIR } = require('../services/backupService');
const ActivityLog = require('../models/ActivityLog');

// @desc    Trigger a manual backup
// @route   POST /api/backup
// @access  Private (Admin)
exports.triggerBackup = async (req, res) => {
  try {
    const backupInfo = await performBackup();
    
    // Log activity
    await ActivityLog.create({
      action: 'BACKUP_CREATED',
      description: `Manual database backup created: ${backupInfo.filename}`,
      performedBy: req.admin._id,
      entityType: 'System'
    });

    res.status(200).json({
      success: true,
      message: 'Backup completed successfully',
      data: backupInfo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create backup', error: error.message });
  }
};

// @desc    List all available backups
// @route   GET /api/backup
// @access  Private (Admin)
exports.getBackups = (req, res) => {
  try {
    const backups = listBackups();
    res.status(200).json({
      success: true,
      data: backups
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch backups' });
  }
};

// @desc    Download a specific backup
// @route   GET /api/backup/download/:filename
// @access  Private (Admin)
exports.downloadBackup = (req, res) => {
  try {
    const { filename } = req.params;
    
    // Basic security to prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ success: false, message: 'Invalid filename' });
    }

    const filePath = path.join(BACKUP_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Backup file not found' });
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to download backup' });
  }
};
