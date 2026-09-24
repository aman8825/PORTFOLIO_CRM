const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  date: String,
  description: String,
  score: String,
  badge: String,
  certificateImage: {
    url: String,
    publicId: String,
    width: Number,
    height: Number,
    format: String,
    resourceType: String
  },
  certificateUrl: String,
  order: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
