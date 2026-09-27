const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../../controllers/activityController');
const { protect } = require('../../middleware/auth');

router.get('/', protect, getActivityLogs);

module.exports = router;
