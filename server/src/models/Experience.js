const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String },
  currentlyWorking: { type: Boolean, default: false },
  location: String,
  description: String,
  technologies: [String],
  responsibilities: [String],
  order: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);
