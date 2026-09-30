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

exports.getPortfolioHealth = async (req, res) => {
  try {
    const profile = await Profile.findOne();
    const projects = await Project.find();
    const achievements = await Achievement.find();
    const settings = await Settings.findOne();

    const issues = [];
    const checks = {
      profile: true,
      social: true,
      projects: true,
      achievements: true,
      seo: true,
      content: true
    };

    // PROFILE CHECKS
    if (!profile) {
      issues.push({ category: 'PROFILE', type: 'ERROR', message: 'Profile does not exist.', suggestion: 'Create a profile.', fixLink: '/admin/profile' });
      checks.profile = false;
    } else {
      if (!profile.name) { issues.push({ category: 'PROFILE', type: 'ERROR', message: 'Name is missing.', suggestion: 'Add your name to the profile.', fixLink: '/admin/profile' }); checks.profile = false; }
      if (!profile.title) { issues.push({ category: 'PROFILE', type: 'WARNING', message: 'Professional title is missing.', suggestion: 'Add a professional title.', fixLink: '/admin/profile' }); checks.profile = false; }
      if (!profile.bio) { issues.push({ category: 'PROFILE', type: 'WARNING', message: 'Bio is missing.', suggestion: 'Add a bio to introduce yourself.', fixLink: '/admin/profile' }); checks.profile = false; }
      if (!profile.profileImage) { issues.push({ category: 'PROFILE', type: 'WARNING', message: 'Profile image is missing.', suggestion: 'Upload a professional photo.', fixLink: '/admin/profile' }); checks.profile = false; }
      if (!profile.email) { issues.push({ category: 'PROFILE', type: 'WARNING', message: 'Contact email is missing.', suggestion: 'Add a contact email.', fixLink: '/admin/profile' }); checks.profile = false; }

      // SOCIAL CHECKS
      let hasGithub = false;
      let hasLinkedin = false;
      if (profile.socialLinks && profile.socialLinks.length > 0) {
        profile.socialLinks.forEach(link => {
          if (!link.url || link.url.trim() === '') {
            issues.push({ category: 'SOCIAL', type: 'WARNING', message: `Empty URL for social platform: ${link.platform}.`, suggestion: 'Remove empty links or provide a valid URL.', fixLink: '/admin/profile' });
            checks.social = false;
          }
          if (link.platform.toLowerCase() === 'github') hasGithub = true;
          if (link.platform.toLowerCase() === 'linkedin') hasLinkedin = true;
        });
      }
      if (!hasGithub) { issues.push({ category: 'SOCIAL', type: 'WARNING', message: 'GitHub link not configured.', suggestion: 'Add your GitHub profile.', fixLink: '/admin/profile' }); checks.social = false; }
      if (!hasLinkedin) { issues.push({ category: 'SOCIAL', type: 'WARNING', message: 'LinkedIn link not configured.', suggestion: 'Add your LinkedIn profile.', fixLink: '/admin/profile' }); checks.social = false; }
    }

    // PROJECTS CHECKS
    if (projects.length === 0) {
      issues.push({ category: 'PROJECTS', type: 'ERROR', message: 'No projects found.', suggestion: 'Add at least one project to showcase your work.', fixLink: '/admin/projects' });
      checks.projects = false;
    } else {
      let emptyProjects = 0;
      projects.forEach(p => {
        if (!p.title) { issues.push({ category: 'PROJECTS', type: 'ERROR', message: 'A project is missing a title.', suggestion: 'Add a title to the project.', fixLink: `/admin/projects` }); checks.projects = false; }
        if (!p.description) { issues.push({ category: 'PROJECTS', type: 'WARNING', message: `Project "${p.title || 'Untitled'}" is missing a description.`, suggestion: 'Add a description.', fixLink: `/admin/projects` }); checks.projects = false; }
        if (!p.image) { issues.push({ category: 'PROJECTS', type: 'WARNING', message: `Project "${p.title || 'Untitled'}" is missing an image.`, suggestion: 'Add a project image.', fixLink: `/admin/projects` }); checks.projects = false; }
        if (!p.technologies || p.technologies.length === 0) { issues.push({ category: 'PROJECTS', type: 'WARNING', message: `Project "${p.title || 'Untitled'}" has no technologies listed.`, suggestion: 'Add the tech stack used.', fixLink: `/admin/projects` }); checks.projects = false; }
        if (p.isPublished === false) emptyProjects++;
      });
      if (emptyProjects === projects.length) {
        issues.push({ category: 'CONTENT', type: 'WARNING', message: 'All projects are currently unpublished or empty.', suggestion: 'Publish at least one project.', fixLink: '/admin/projects' });
        checks.content = false;
      }
    }

    // ACHIEVEMENTS CHECKS
    achievements.forEach(a => {
      if (!a.title) { issues.push({ category: 'ACHIEVEMENTS', type: 'ERROR', message: 'An achievement is missing a title.', suggestion: 'Add a title.', fixLink: '/admin/achievements' }); checks.achievements = false; }
      if (!a.issuer) { issues.push({ category: 'ACHIEVEMENTS', type: 'WARNING', message: `Achievement "${a.title || 'Untitled'}" is missing an issuer.`, suggestion: 'Add the issuer.', fixLink: '/admin/achievements' }); checks.achievements = false; }
    });

    // SEO CHECKS
    if (!settings) {
      issues.push({ category: 'SEO', type: 'WARNING', message: 'SEO settings are not configured.', suggestion: 'Configure global SEO settings.', fixLink: '/admin/settings' });
      checks.seo = false;
    } else {
      if (!settings.seoMetaTitle) { issues.push({ category: 'SEO', type: 'WARNING', message: 'Meta title is missing.', suggestion: 'Add a meta title.', fixLink: '/admin/settings' }); checks.seo = false; }
      if (!settings.seoMetaDescription) { issues.push({ category: 'SEO', type: 'WARNING', message: 'Meta description is missing.', suggestion: 'Add a meta description for search engines.', fixLink: '/admin/settings' }); checks.seo = false; }
    }

    res.status(200).json({
      success: true,
      data: {
        checks,
        issues,
        overall: issues.some(i => i.type === 'ERROR') ? 'ERROR' : (issues.some(i => i.type === 'WARNING') ? 'WARNING' : 'PASS')
      }
    });
  } catch (error) {
    console.error('Portfolio health check error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
