const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all team members
// @route   GET /api/team
// @access  Private (Superadmin)
exports.getTeam = async (req, res) => {
  try {
    const team = await Admin.find().select('-password').sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: team.length, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Invite/Create a new team member
// @route   POST /api/team
// @access  Private (Superadmin)
exports.inviteTeamMember = async (req, res) => {
  try {
    const { email, name, role, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const admin = await Admin.create({
      email,
      name,
      role: role || 'editor',
      password // In a real app, send invite email to set password. Here we create it directly.
    });

    await ActivityLog.create({
      action: 'ADMIN_INVITED',
      description: `Invited new team member: ${admin.email} (${admin.role})`,
      actor: req.admin._id,
      entityType: 'Admin'
    });

    admin.password = undefined; // Don't send back
    res.status(201).json({ success: true, data: admin });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update team member role
// @route   PUT /api/team/:id
// @access  Private (Superadmin)
exports.updateTeamMember = async (req, res) => {
  try {
    // Prevent modifying self via this route
    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot modify your own role here.' });
    }

    const { role } = req.body;
    const admin = await Admin.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('-password');
    
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    await ActivityLog.create({
      action: 'ADMIN_UPDATED',
      description: `Updated role for ${admin.email} to ${role}`,
      actor: req.admin._id,
      entityType: 'Admin'
    });

    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a team member
// @route   DELETE /api/team/:id
// @access  Private (Superadmin)
exports.deleteTeamMember = async (req, res) => {
  try {
    // Prevent deleting self
    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself.' });
    }

    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    await ActivityLog.create({
      action: 'ADMIN_DELETED',
      description: `Removed team member: ${admin.email}`,
      actor: req.admin._id,
      entityType: 'Admin'
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
