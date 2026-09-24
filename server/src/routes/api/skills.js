const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { getSkills, createSkill, updateSkill, deleteSkill } = require('../../controllers/skillsController');

router.route('/')
  .get(getSkills)
  .post(protect, createSkill);

router.route('/:id')
  .put(protect, updateSkill)
  .delete(protect, deleteSkill);

module.exports = router;
