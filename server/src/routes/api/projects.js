const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { getProjects, getProjectById, getProjectBySlug, createProject, updateProject, deleteProject } = require('../../controllers/projectsController');

router.route('/')
  .get(getProjects)
  .post(protect, createProject);

router.route('/slug/:slug')
  .get(getProjectBySlug);

router.route('/:id')
  .get(getProjectById) // public can get by id if needed, or protect if only admin
  .put(protect, updateProject)
  .delete(protect, deleteProject);

module.exports = router;
