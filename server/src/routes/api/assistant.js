const express = require('express');
const router = express.Router();
const { 
  askAssistant, 
  getPendingQuestions, 
  getStats, 
  answerQuestion, 
  getKnowledge, 
  createKnowledge, 
  deleteKnowledge 
} = require('../../controllers/assistant.controller');
const { protect } = require('../../middleware/auth');

// Public route for portfolio front-end
router.post('/ask', askAssistant);

// Protected routes for Admin Dashboard
router.get('/questions/pending', protect, getPendingQuestions);
router.post('/questions/:id/answer', protect, answerQuestion);

router.get('/stats', protect, getStats);

router.get('/knowledge', protect, getKnowledge);
router.post('/knowledge', protect, createKnowledge);
router.delete('/knowledge/:id', protect, deleteKnowledge);

module.exports = router;
