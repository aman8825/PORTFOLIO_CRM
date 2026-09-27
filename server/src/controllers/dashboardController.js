const mongoose = require('mongoose');
const Project = require('../models/Project');
const Achievement = require('../models/Achievement');
const Message = require('../models/Message');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const Settings = require('../models/Settings');
const Profile = require('../models/Profile');

exports.getDashboardSummary = async (req, res) => {
  try {
    const [
      projectCount,
      achievementCount,
      messageCount,
      taskCount,
      unreadMessages,
      recentActivity,
      profile,
      recentProjects,
      recentMessages
    ] = await Promise.all([
      Project.countDocuments(),
      Achievement.countDocuments(),
      Message.countDocuments(),
      Task.countDocuments({ status: { $ne: 'Completed' } }),
      Message.countDocuments({ status: 'unread' }),
      ActivityLog.find().sort({ createdAt: -1 }).limit(5),
      Profile.findOne(),
      Project.find().sort({ createdAt: -1 }).limit(5),
      Message.find().sort({ createdAt: -1 }).limit(5)
    ]);

    // Portfolio Health Logic
    let healthScore = 100;
    if (!profile || !profile.name || !profile.bio) healthScore -= 20;
    if (!profile || !profile.resumeUrl) healthScore -= 10;
    // We can add more health checks later

    res.status(200).json({
      success: true,
      data: {
        counts: {
          projects: projectCount,
          achievements: achievementCount,
          messages: messageCount,
          tasks: taskCount,
          unreadMessages: unreadMessages
        },
        healthScore,
        recentActivity,
        recentProjects,
        recentMessages,
        systemStatus: {
          api: 'ONLINE',
          database: mongoose.connection.readyState === 1 ? 'ONLINE' : 'DEGRADED'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.checkLinkHealth = async (req, res) => {
  try {
    const projects = await Project.find({}, 'title githubUrl liveDemoUrl documents');
    const profile = await Profile.findOne();
    const resumes = await require('../models/Resume').find({}, 'fileName fileUrl');

    const linksToCheck = [];

    // Extract Project Links
    projects.forEach(p => {
      if (p.githubUrl) linksToCheck.push({ source: `Project: ${p.title}`, type: 'GitHub', url: p.githubUrl });
      if (p.liveDemoUrl) linksToCheck.push({ source: `Project: ${p.title}`, type: 'Live Demo', url: p.liveDemoUrl });
      if (p.documents && p.documents.length > 0) {
        p.documents.forEach(d => {
          if (d.url) linksToCheck.push({ source: `Project Doc: ${p.title}`, type: d.type || 'Document', url: d.url });
        });
      }
    });

    // Extract Profile Links
    if (profile && profile.socialLinks) {
      profile.socialLinks.forEach(link => {
        if (link.url) linksToCheck.push({ source: 'Profile Social', type: link.platform, url: link.url });
      });
    }

    // Extract Resume Links
    resumes.forEach(r => {
      if (r.fileUrl) linksToCheck.push({ source: 'Resume', type: r.fileName || 'File', url: r.fileUrl });
    });

    // Check all links concurrently
    const checkUrl = async (item) => {
      try {
        const response = await fetch(item.url, { method: 'HEAD', headers: { 'User-Agent': 'PortfolioHealthCheck/1.0' }});
        return { ...item, status: response.status, ok: response.ok };
      } catch (error) {
        return { ...item, status: 0, ok: false, error: error.message };
      }
    };

    // Limit concurrency if there are many links, but for a portfolio it's usually small
    const results = await Promise.all(linksToCheck.map(checkUrl));
    
    const brokenLinks = results.filter(r => !r.ok);
    const healthyCount = results.length - brokenLinks.length;

    res.status(200).json({
      success: true,
      data: {
        totalChecked: results.length,
        healthyCount,
        brokenCount: brokenLinks.length,
        brokenLinks
      }
    });
  } catch (error) {
    console.error('Link health check error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
