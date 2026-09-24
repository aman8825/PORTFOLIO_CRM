const Achievement = require('../models/Achievement');

exports.getAchievements = async (req, res) => {
  try {
    const { public: isPublic } = req.query;
    let query = {};
    if (isPublic === 'true') query.enabled = true;
    
    const achievements = await Achievement.find(query).sort('order');
    res.status(200).json({ success: true, count: achievements.length, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.create(req.body);
    res.status(201).json({ success: true, data: achievement });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!achievement) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: achievement });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    if (!achievement) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
