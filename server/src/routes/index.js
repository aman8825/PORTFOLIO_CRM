const express = require('express');
const router = express.Router();

// Placeholder for routes to be implemented in future phases
router.use('/auth', require('./api/auth'));
router.use('/profile', require('./api/profile'));
router.use('/skills', require('./api/skills'));
router.use('/experience', require('./api/experience'));
router.use('/projects', require('./api/projects'));
router.use('/achievements', require('./api/achievements'));
router.use('/resume', require('./api/resume'));
router.use('/messages', require('./api/messages'));
router.use('/settings', require('./api/settings'));
router.use('/uploads', require('./api/uploads'));
router.use('/assistant', require('./api/assistant'));
router.use('/tasks', require('./api/tasks'));

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'API is healthy' });
});

module.exports = router;
