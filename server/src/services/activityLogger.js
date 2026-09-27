const ActivityLog = require('../models/ActivityLog');

exports.logActivity = async (req, action, entityType, description, metadata = {}, entityId = null) => {
  try {
    const actor = (req.admin && req.admin._id) || (req.user && req.user._id) || null;
    
    await ActivityLog.create({
      actor,
      action,
      entityType,
      entityId,
      description,
      metadata
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
