const express = require('express');
const router = express.Router();
const { trackEvent, getAnalyticsSummary } = require('../../controllers/analyticsController');
const { protect } = require('../../middleware/auth');

// Public route for tracking events
router.post('/track', trackEvent);

// Protected route for dashboard analytics
router.get('/summary', protect, getAnalyticsSummary);

module.exports = router;
