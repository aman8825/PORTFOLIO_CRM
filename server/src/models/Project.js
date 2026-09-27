const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  shortDescription: String,
  detailedDescription: String,
  category: String,
  technologies: [String],
  features: [String],
  githubUrl: String,
  liveDemoUrl: String,
  thumbnailImage: {
    url: String,
    publicId: String,
    width: Number,
    height: Number,
    format: String,
    resourceType: String
  },
  galleryImages: [{
    url: String,
    publicId: String,
    width: Number,
    height: Number,
    format: String,
    resourceType: String
  }],
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  order: { type: Number, default: 0 },
  caseStudy: {
    enabled: { type: Boolean, default: false },
    summary: String,
    overview: String,
    problem: String,
    solution: String,
    features: [{ title: String, description: String }],
    challenges: [{ title: String, description: String, solution: String }],
    implementation: String,
    architecture: String,
    outcome: String,
    role: String,
    duration: String,
    team: String
  },
  documents: [{
    title: String,
    description: String,
    url: String,
    type: { type: String },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  }],
  seo: {
    title: String,
    description: String,
    keywords: String,
    ogImage: {
      url: String,
      publicId: String
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
