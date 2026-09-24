const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  // Legacy fields (kept for migration fallback)
  name: String,
  professionalTitle: String,
  shortIntroduction: String,
  aboutDescription: String,
  email: String,
  phone: String,
  location: String,
  githubUrl: String,
  linkedinUrl: String,
  profileImage: mongoose.Schema.Types.Mixed,
  resumeUrl: String,
  availabilityStatus: String,

  // New Nested Architecture
  basic: {
    fullName: { type: String, default: '' },
    professionalName: { type: String, default: '' },
    headline: { type: String, default: '' },
    shortBio: { type: String, default: '' },
    longBio: { type: String, default: '' },
    location: { type: String, default: '' },
    profileImage: {
      url: String,
      publicId: String
    }
  },
  
  professional: {
    primaryRole: { type: String, default: '' },
    currentFocus: { type: String, default: '' },
    skills: [{ type: String }],
    currentStatus: { type: String, default: '' }
  },
  
  contact: {
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    contactPreference: { type: String, default: 'email' }
  },
  
  socialLinks: [{
    platform: String,
    name: String,
    url: String,
    username: String,
    icon: String,
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  }],
  
  availability: {
    status: { type: String, default: 'Available' },
    message: { type: String, default: '' },
    visible: { type: Boolean, default: true }
  },
  
  resume: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    fileName: { type: String, default: '' },
    updatedAt: { type: Date }
  },
  
  visibility: {
    email: { type: Boolean, default: true },
    phone: { type: Boolean, default: true },
    location: { type: Boolean, default: true },
    socialLinks: { type: Boolean, default: true },
    profileImage: { type: Boolean, default: true }
  },
  
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: { type: String, default: '' },
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
