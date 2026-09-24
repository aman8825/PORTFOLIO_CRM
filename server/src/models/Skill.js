const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Frontend', 'Backend', 'Database', 'Authentication & APIs', 'Tools']
  },
  icon: String,
  order: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
