const Settings = require('../models/Settings');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com' });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getPublicSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com' });
    }
    
    // Only return safe public fields
    const publicData = {
      maintenanceMode: settings.maintenanceMode,
      maintenanceTitle: settings.maintenanceTitle,
      maintenanceMessage: settings.maintenanceMessage,
      maintenanceEstimatedReturn: settings.maintenanceEstimatedReturn,
      maintenanceContactEnabled: settings.maintenanceContactEnabled,
      portfolioPublic: settings.portfolioPublic
    };
    
    res.status(200).json({ success: true, data: publicData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true, runValidators: true });
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Provide both passwords' });

    const admin = await Admin.findById(req.admin.id).select('+password');
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect current password' });

    admin.password = newPassword;
    await admin.save();
    
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
