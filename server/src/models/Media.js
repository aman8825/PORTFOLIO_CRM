const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  format: { type: String },
  size: { type: Number },
  folder: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

// Index for retrieving media quickly
mediaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Media', mediaSchema);
