const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin'
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'PROFILE_UPDATED',
      'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED', 'PROJECT_PUBLISHED',
      'ACHIEVEMENT_CREATED', 'ACHIEVEMENT_UPDATED', 'ACHIEVEMENT_DELETED',
      'ARTICLE_CREATED', 'ARTICLE_UPDATED', 'ARTICLE_DELETED',
      'RESUME_CHANGED', 'SOCIAL_LINK_CHANGED',
      'TASK_CREATED', 'TASK_UPDATED', 'TASK_COMPLETED',
      'SETTINGS_CHANGED', 'MAINTENANCE_MODE_CHANGED', 'MESSAGE_STATUS_CHANGED',
      'ADMIN_INVITED', 'ADMIN_UPDATED', 'ADMIN_DELETED', 'BACKUP_CREATED',
      'OTHER'
    ]
  },
  entityType: {
    type: String,
    required: true
  },
  entityId: {
    type: mongoose.Schema.ObjectId
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: Object
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
