require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const AnalyticsEvent = require('./src/models/AnalyticsEvent');
    const Project = require('./src/models/Project');
    
    const dateFilter = {};
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
      
      AnalyticsEvent.aggregate([
        { $match: { ...dateFilter, eventType: 'project_view' } },
        { $group: { _id: '$metadata.projectId', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 5 }
      ]),

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

    console.log('Most viewed projects IDs:', mostViewedProjects);

    const projectIds = mostViewedProjects.map(p => p._id).filter(Boolean);
    const projects = await Project.find({ _id: { $in: projectIds } }).select('title');
    console.log('Success:', {
        totalViews,
        mostViewedProjects,
        viewsOverTime
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}).catch(console.error);
