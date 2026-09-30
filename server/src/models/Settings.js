const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  adminEmail: { type: String, required: true },
  portfolioPublic: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceTitle: { type: String, default: 'Under Maintenance' },
  maintenanceMessage: { type: String, default: 'We are currently updating our portfolio. Please check back soon.' },
  maintenanceEstimatedReturn: { type: String, default: '' },
  maintenanceContactEnabled: { type: Boolean, default: true },
  themePrimaryColor: { type: String, default: '#3b82f6' }, // default blue-500
  themeSecondaryColor: { type: String, default: '#10b981' }, // default emerald-500
  themeFontFamily: { type: String, default: 'Inter' },
  // Recruiter View specific settings
  recruiterViewEnabled: { type: Boolean, default: false },
  recruiterShowSkills: { type: Boolean, default: true },
  recruiterShowExperience: { type: Boolean, default: true },
  recruiterShowProjects: { type: Boolean, default: true },
  recruiterShowAchievements: { type: Boolean, default: true },
  recruiterShowResume: { type: Boolean, default: true },
  recruiterShowContact: { type: Boolean, default: true },
  // SEO Settings
  seoMetaTitle: { type: String, default: 'My Portfolio' },
  seoMetaDescription: { type: String, default: 'Welcome to my professional portfolio and blog.' },
  seoOpenGraphImage: { type: String, default: '' },
  seoTwitterHandle: { type: String, default: '' },
  seoEnableJsonLd: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
