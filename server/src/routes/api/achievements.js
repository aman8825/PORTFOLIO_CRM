const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { getAchievements, createAchievement, updateAchievement, deleteAchievement } = require('../../controllers/achievementsController');

router.route('/')
  .get(getAchievements)
  .post(protect, createAchievement);

router.route('/:id')
  .put(protect, updateAchievement)
  .delete(protect, deleteAchievement);

module.exports = router;
