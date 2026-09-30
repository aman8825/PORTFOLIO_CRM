const mongoose = require('mongoose');

const AnalyticsEventSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    enum: [
      'page_view',
      'project_view',
      'case_study_view',
      'resume_view',
      'resume_download',
      'contact_form_open',
      'contact_submit',
      'social_link_click',
      'external_project_link_click',
      'document_click',
      'assistant_question',
      'article_view',
      'article_share',
      'newsletter_signup'
    ]
  },
  entityType: { type: String },
  entityId: { type: String },
  path: { type: String },
  referrer: { type: String },
  deviceType: { type: String },
  browser: { type: String },
  os: { type: String },
  country: { type: String },
  region: { type: String },
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
AnalyticsEventSchema.index({ event: 1, createdAt: -1 });
AnalyticsEventSchema.index({ createdAt: -1 });
AnalyticsEventSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
