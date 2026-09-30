const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  message: { type: String, required: true },
  profileImage: { type: String }, // URL from Cloudinary
  linkedinUrl: { type: String },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes for typical public queries
testimonialSchema.index({ published: 1, order: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
