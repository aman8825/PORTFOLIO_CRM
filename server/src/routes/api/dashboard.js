const express = require('express');
const router = express.Router();
const { getDashboardSummary, checkLinkHealth } = require('../../controllers/dashboardController');
const { protect } = require('../../middleware/auth');

router.get('/summary', protect, getDashboardSummary);
router.get('/link-health', protect, checkLinkHealth);

module.exports = router;
