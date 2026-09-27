const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const { triggerBackup, getBackups, downloadBackup } = require('../../controllers/backupController');

router.use(protect);
router.use(authorize('superadmin'));

router.post('/', triggerBackup);
router.get('/', getBackups);
router.get('/download/:filename', downloadBackup);

module.exports = router;
