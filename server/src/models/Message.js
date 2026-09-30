const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['new', 'read', 'contacted', 'replied', 'qualified', 'closed', 'archived'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: { type: String },
  followUpDate: { type: Date },
  tags: [{ type: String }],
  repliedAt: Date,
  replyCount: { type: Number, default: 0 },
  replies: [replySchema],
  starred: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);

