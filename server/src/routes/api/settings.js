const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const { getSettings, updateSettings, updatePassword, getPublicSettings } = require('../../controllers/settingsController');

// Public route for portfolio settings
router.get('/public', getPublicSettings);

router.use(protect); // All settings routes below are protected

router.route('/')
  .get(authorize('superadmin'), getSettings)
  .put(authorize('superadmin'), updateSettings);

router.post('/password', updatePassword);

module.exports = router;
