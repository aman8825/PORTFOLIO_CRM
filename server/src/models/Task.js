const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Review', 'Completed', 'Cancelled'],
    default: 'Todo'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  category: {
    type: String,
    enum: ['Development', 'Portfolio', 'Client', 'Job Search', 'Interview', 'Learning', 'Deployment', 'Personal', 'Other'],
    default: 'Other'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  tags: {
    type: [String],
    default: []
  },
  notes: {
    type: String
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project'
  },
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);
