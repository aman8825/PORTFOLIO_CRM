const { askQuestion } = require('../services/assistant.service');
const AssistantQuestion = require('../models/AssistantQuestion');
const PortfolioKnowledge = require('../models/PortfolioKnowledge');

// @route   POST /api/assistant/ask
// @desc    Ask a question to the AI assistant
// @access  Public
exports.askAssistant = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    if (question.length > 500) {
      return res.status(400).json({ success: false, message: 'Question is too long' });
    }

    const response = await askQuestion(question);
    res.json(response);
  } catch (error) {
    console.error('Controller Error askAssistant:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   GET /api/assistant/questions/pending
// @desc    Get all pending questions
// @access  Private (Admin)
exports.getPendingQuestions = async (req, res) => {
  try {
    const questions = await AssistantQuestion.find({ status: 'pending' }).sort('-askedCount -updatedAt');
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   GET /api/assistant/stats
// @desc    Get assistant stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
  try {
    const totalQuestions = await AssistantQuestion.countDocuments();
    const pendingQuestions = await AssistantQuestion.countDocuments({ status: 'pending' });
    const answeredQuestions = await AssistantQuestion.countDocuments({ status: 'answered' });
    const knowledgeEntries = await PortfolioKnowledge.countDocuments();
    
    res.json({
      success: true,
      data: {
        totalQuestions,
        pendingQuestions,
        answeredQuestions,
        knowledgeEntries
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   POST /api/assistant/questions/:id/answer
// @desc    Answer a pending question
// @access  Private (Admin)
exports.answerQuestion = async (req, res) => {
  try {
    const { answer, aliases } = req.body;
    
    if (!answer || answer.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Answer is required' });
    }

    const question = await AssistantQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Mark as answered
    question.status = 'answered';
    question.answer = answer;
    question.answeredAt = Date.now();
    await question.save();

    // Create knowledge entry
    let parsedAliases = [];
    if (aliases) {
      parsedAliases = Array.isArray(aliases) ? aliases : aliases.split(',').map(a => a.trim()).filter(a => a.length > 0);
    }

    const knowledge = await PortfolioKnowledge.create({
      question: question.question,
      answer: answer,
      category: question.category,
      aliases: parsedAliases,
      createdBy: req.admin._id
    });

    res.json({ success: true, data: question, knowledge });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   GET /api/assistant/knowledge
// @desc    Get all knowledge base entries
// @access  Private (Admin)
exports.getKnowledge = async (req, res) => {
  try {
    const knowledge = await PortfolioKnowledge.find().sort('-updatedAt');
    res.json({ success: true, data: knowledge });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   POST /api/assistant/knowledge
// @desc    Create a new knowledge base entry manually
// @access  Private (Admin)
exports.createKnowledge = async (req, res) => {
  try {
    const { question, answer, category, keywords, aliases } = req.body;
    
    let parsedAliases = [];
    if (aliases) {
      parsedAliases = Array.isArray(aliases) ? aliases : aliases.split(',').map(a => a.trim()).filter(a => a.length > 0);
    }

    const knowledge = await PortfolioKnowledge.create({
      question,
      answer,
      category,
      keywords,
      aliases: parsedAliases,
      createdBy: req.admin._id
    });

    res.status(201).json({ success: true, data: knowledge });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   DELETE /api/assistant/knowledge/:id
// @desc    Delete a knowledge base entry
// @access  Private (Admin)
exports.deleteKnowledge = async (req, res) => {
  try {
    const knowledge = await PortfolioKnowledge.findById(req.params.id);
    if (!knowledge) {
      return res.status(404).json({ success: false, message: 'Knowledge entry not found' });
    }

    await knowledge.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
