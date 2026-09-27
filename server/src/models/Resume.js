const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  title: String,
  fileName: String,
  fileSize: String,
  fileUrl: { type: String, required: true },
  version: String,
  isActive: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
