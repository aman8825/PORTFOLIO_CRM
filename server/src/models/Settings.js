const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  adminEmail: { type: String, required: true },
  portfolioPublic: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceTitle: { type: String, default: 'Under Maintenance' },
  maintenanceMessage: { type: String, default: 'We are currently updating our portfolio. Please check back soon.' },
  maintenanceEstimatedReturn: { type: String, default: '' },
  maintenanceContactEnabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
