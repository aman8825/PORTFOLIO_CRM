const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { getExperiences, createExperience, updateExperience, deleteExperience } = require('../../controllers/experienceController');

router.route('/')
  .get(getExperiences)
  .post(protect, createExperience);

router.route('/:id')
  .put(protect, updateExperience)
  .delete(protect, deleteExperience);

module.exports = router;
