const mongoose = require('mongoose');

const portfolioKnowledgeSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please add a question'],
    trim: true,
    maxlength: [500, 'Question cannot be more than 500 characters']
  },
  answer: {
    type: String,
    required: [true, 'Please add an answer'],
    maxlength: [2000, 'Answer cannot be more than 2000 characters']
  },
  category: {
    type: String,
    enum: ['profile', 'skills', 'experience', 'projects', 'education', 'achievements', 'certification', 'availability', 'general'],
    default: 'general'
  },
  keywords: {
    type: [String],
    default: []
  },
  aliases: {
    type: [String],
    default: []
  },
  approved: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    required: false
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PortfolioKnowledge', portfolioKnowledgeSchema);
