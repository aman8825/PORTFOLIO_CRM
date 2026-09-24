const mongoose = require('mongoose');

const assistantQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please add a question'],
    trim: true,
    maxlength: [500, 'Question cannot be more than 500 characters']
  },
  normalizedQuestion: {
    type: String,
    required: true,
    select: false // Only used for backend deduplication
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'ignored'],
    default: 'pending'
  },
  answer: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['profile', 'skills', 'experience', 'projects', 'education', 'achievements', 'certification', 'availability', 'general'],
    default: 'general'
  },
  askedCount: {
    type: Number,
    default: 1
  },
  answeredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Pre-save hook to generate normalized question
assistantQuestionSchema.pre('validate', function(next) {
  if (this.question && this.isModified('question')) {
    // Basic normalization: lowercase, remove non-alphanumeric except spaces, trim extra spaces
    this.normalizedQuestion = this.question
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  next();
});

module.exports = mongoose.model('AssistantQuestion', assistantQuestionSchema);
