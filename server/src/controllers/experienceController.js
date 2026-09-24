const Experience = require('../models/Experience');

exports.getExperiences = async (req, res) => {
  try {
    const { public: isPublic } = req.query;
    let query = {};
    if (isPublic === 'true') query.enabled = true;
    
    const experiences = await Experience.find(query).sort({ order: 1, startDate: -1 });
    res.status(200).json({ success: true, count: experiences.length, data: experiences });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createExperience = async (req, res) => {
  try {
    const exp = await Experience.create(req.body);
    res.status(201).json({ success: true, data: exp });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateExperience = async (req, res) => {
  try {
    const exp = await Experience.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!exp) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: exp });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    const exp = await Experience.findByIdAndDelete(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
