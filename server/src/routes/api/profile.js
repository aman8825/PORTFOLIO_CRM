const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { getProfile, getPublicProfile, updateProfile } = require('../../controllers/profileController');

// @route   GET /api/profile/public
// @desc    Get public profile data for portfolio
// @access  Public
router.get('/public', getPublicProfile);

// @route   GET /api/profile
// @desc    Get admin profile data
// @access  Private
router.get('/', protect, getProfile);

// @route   PUT /api/profile
// @desc    Update profile
// @access  Private
router.put('/', protect, updateProfile);

module.exports = router;
