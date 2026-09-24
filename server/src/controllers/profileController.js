const Profile = require('../models/Profile');

// Helper for migrating legacy flat data to nested structure
const migrateProfileData = (profile) => {
  let needsSave = false;
  
  if (profile.name && !profile.basic?.fullName) {
    profile.basic = profile.basic || {};
    profile.basic.fullName = profile.name;
    needsSave = true;
  }
  if (profile.professionalTitle && !profile.basic?.headline) {
    profile.basic.headline = profile.professionalTitle;
    needsSave = true;
  }
  if (profile.shortIntroduction && !profile.basic?.shortBio) {
    profile.basic.shortBio = profile.shortIntroduction;
    needsSave = true;
  }
  if (profile.aboutDescription && !profile.basic?.longBio) {
    profile.basic.longBio = profile.aboutDescription;
    needsSave = true;
  }
  if (profile.location && !profile.basic?.location) {
    profile.basic.location = profile.location;
    needsSave = true;
  }
  if (profile.email && !profile.contact?.email) {
    profile.contact = profile.contact || {};
    profile.contact.email = profile.email;
    needsSave = true;
  }
  if (profile.phone && !profile.contact?.phone) {
    profile.contact.phone = profile.phone;
    needsSave = true;
  }
  if (profile.profileImage && profile.profileImage.url && !profile.basic?.profileImage?.url) {
    profile.basic.profileImage = {
      url: profile.profileImage.url,
      publicId: profile.profileImage.publicId
    };
    needsSave = true;
  }
  if (profile.resumeUrl && !profile.resume?.url) {
    profile.resume = profile.resume || {};
    profile.resume.url = profile.resumeUrl;
    needsSave = true;
  }
  if (profile.availabilityStatus && !profile.availability?.status) {
    profile.availability = profile.availability || {};
    profile.availability.status = profile.availabilityStatus;
    needsSave = true;
  }

  // Migrate social links
  if ((profile.githubUrl || profile.linkedinUrl) && (!profile.socialLinks || profile.socialLinks.length === 0)) {
    profile.socialLinks = [];
    if (profile.githubUrl) {
      profile.socialLinks.push({
        platform: 'GitHub',
        name: 'GitHub',
        url: profile.githubUrl,
        visible: true,
        order: 1
      });
    }
    if (profile.linkedinUrl) {
      profile.socialLinks.push({
        platform: 'LinkedIn',
        name: 'LinkedIn',
        url: profile.linkedinUrl,
        visible: true,
        order: 2
      });
    }
    needsSave = true;
  }

  return { migratedProfile: profile, needsSave };
};

// @desc    Get admin profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();
    
    if (!profile) {
      return res.status(200).json({ success: true, data: {} });
    }

    const { migratedProfile, needsSave } = migrateProfileData(profile);
    
    if (needsSave) {
      await migratedProfile.save();
    }

    res.status(200).json({ success: true, data: migratedProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get public profile data
// @route   GET /api/profile/public
// @access  Public
exports.getPublicProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();
    
    if (!profile) {
      return res.status(200).json({ success: true, data: {} });
    }

    const { migratedProfile, needsSave } = migrateProfileData(profile);
    if (needsSave) {
      await migratedProfile.save();
    }
    
    profile = migratedProfile;

    // Filter based on visibility
    const publicData = {
      basic: profile.basic,
      professional: profile.professional,
      seo: profile.seo,
      availability: profile.availability?.visible ? profile.availability : null,
      resume: profile.resume,
      contact: {
        email: profile.visibility?.email ? profile.contact?.email : null,
        phone: profile.visibility?.phone ? profile.contact?.phone : null,
        whatsapp: profile.visibility?.phone ? profile.contact?.whatsapp : null, // Assuming phone visibility covers whatsapp
        contactPreference: profile.contact?.contactPreference
      },
      socialLinks: profile.visibility?.socialLinks 
        ? (profile.socialLinks || []).filter(link => link.visible).sort((a, b) => a.order - b.order)
        : [],
      visibility: profile.visibility
    };

    if (profile.visibility && !profile.visibility.location && publicData.basic) {
      publicData.basic.location = null;
    }
    if (profile.visibility && !profile.visibility.profileImage && publicData.basic) {
      publicData.basic.profileImage = null;
    }

    res.status(200).json({ success: true, data: publicData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update or create profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();

    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        {},
        req.body,
        { new: true, runValidators: true }
      );
      return res.status(200).json({ success: true, data: profile });
    }

    // Create
    profile = await Profile.create(req.body);
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
