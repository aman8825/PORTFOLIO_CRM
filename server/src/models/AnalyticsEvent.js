const mongoose = require('mongoose');

const AnalyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      'page_view',
      'project_view',
      'case_study_view',
      'contact_submission',
      'resume_download',
      'external_click',
      'github_click',
      'linkedin_click',
      'cta_click',
      'other'
    ]
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sessionId: {
    type: String,
    select: false // Do not expose by default to protect privacy
  }
}, {
  timestamps: true
});

// Indexes for faster aggregation
AnalyticsEventSchema.index({ eventType: 1, createdAt: -1 });
AnalyticsEventSchema.index({ createdAt: -1 });
AnalyticsEventSchema.index({ 'metadata.projectId': 1 });

module.exports = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
