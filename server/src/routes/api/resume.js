const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { getResumes, createResume, updateResume, deleteResume } = require('../../controllers/resumeController');

router.route('/')
  .get(getResumes)
  .post(protect, createResume);

router.route('/:id')
  .put(protect, updateResume)
  .delete(protect, deleteResume);

module.exports = router;
