const Resume = require('../models/Resume');

exports.getResumes = async (req, res) => {
  try {
    const { public: isPublic } = req.query;
    let query = {};
    if (isPublic === 'true') query.isActive = true;
    
    const resumes = await Resume.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: resumes.length, data: resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createResume = async (req, res) => {
  try {
    // If setting as active, unset others
    if (req.body.isActive) {
      await Resume.updateMany({}, { isActive: false });
    }
    
    const resume = await Resume.create(req.body);
    res.status(201).json({ success: true, data: resume });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateResume = async (req, res) => {
  try {
    if (req.body.isActive) {
      await Resume.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
    }

    const resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
