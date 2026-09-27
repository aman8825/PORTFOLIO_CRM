const AnalyticsEvent = require('../models/AnalyticsEvent');
const Project = require('../models/Project');

// Create a new analytics event (Public Endpoint)
exports.trackEvent = async (req, res) => {
  try {
    const { eventType, metadata } = req.body;
    
    // Hash IP or generate a daily rolling session ID to respect privacy while tracking uniques
    // For this lightweight version, we will just use a generic ID or rely on client-provided session IDs
    const sessionId = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anonymous';
    
    await AnalyticsEvent.create({
      eventType,
      metadata,
      sessionId
    });

    res.status(201).json({ success: true });
  } catch (error) {
    // Fail silently for analytics so we don't break the frontend experience
    console.error('Analytics tracking failed:', error);
    res.status(200).json({ success: false, message: 'Tracking skipped' });
  }
};

// Get aggregated analytics data for the dashboard (Admin Endpoint)
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const { period = '30' } = req.query; // Today (1), 7, 30, All (all)
    
    let dateFilter = {};
    if (period !== 'all') {
      const days = parseInt(period);
      const date = new Date();
      date.setDate(date.getDate() - days);
      dateFilter = { createdAt: { $gte: date } };
    }

    const [
      totalViews,
      totalDownloads,
      totalSubmissions,
      mostViewedProjects,
      viewsOverTime
    ] = await Promise.all([
      AnalyticsEvent.countDocuments({ ...dateFilter, eventType: 'page_view' }),
      AnalyticsEvent.countDocuments({ ...dateFilter, eventType: 'resume_download' }),
      AnalyticsEvent.countDocuments({ ...dateFilter, eventType: 'contact_submission' }),
      
      // Aggregate most viewed projects
      AnalyticsEvent.aggregate([
        { $match: { ...dateFilter, eventType: 'project_view' } },
        { $group: { _id: '$metadata.projectId', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 5 }
      ]),

      // Aggregate views over time (group by day)
      AnalyticsEvent.aggregate([
        { $match: { ...dateFilter, eventType: { $in: ['page_view', 'project_view'] } } },
        { 
          $group: { 
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            views: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Populate project names for most viewed
    const projectIds = mostViewedProjects.map(p => p._id).filter(Boolean);
    const projects = await Project.find({ _id: { $in: projectIds } }).select('title');
    const projectMap = {};
    projects.forEach(p => projectMap[p._id.toString()] = p.title);
    
    const formattedMostViewed = mostViewedProjects.map(p => ({
      projectId: p._id,
      title: p._id ? (projectMap[p._id.toString()] || 'Unknown Project') : 'Unknown',
      views: p.views
    }));

    res.status(200).json({
      success: true,
      data: {
        totalViews,
        totalDownloads,
        totalSubmissions,
        mostViewedProjects: formattedMostViewed,
        viewsOverTime
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to load analytics' });
  }
};
