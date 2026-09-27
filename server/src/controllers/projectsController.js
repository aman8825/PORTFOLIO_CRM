const Project = require('../models/Project');
const { logActivity } = require('../services/activityLogger');

exports.getProjects = async (req, res) => {
  try {
    const { public: isPublic } = req.query;
    let query = {};
    if (isPublic === 'true') {
      query.$or = [{ status: 'published' }, { published: true }];
    }
    
    const projects = await Project.find(query).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({ 
      slug: req.params.slug, 
      $or: [{ status: 'published' }, { published: true }] 
    });
    if (!project) return res.status(404).json({ success: false, message: 'Not found' });
    
    // Optional: filter out non-visible documents if any
    const projectData = project.toObject();
    if (projectData.documents) {
      projectData.documents = projectData.documents.filter(doc => doc.visible);
    }
    
    res.status(200).json({ success: true, data: projectData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    await logActivity(req, 'PROJECT_CREATED', 'Project', `Project created: ${project.title}`, {}, project._id);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!project) return res.status(404).json({ success: false, message: 'Not found' });
    await logActivity(req, 'PROJECT_UPDATED', 'Project', `Project updated: ${project.title}`, {}, project._id);
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Not found' });
    await logActivity(req, 'PROJECT_DELETED', 'Project', `Project deleted: ${project.title}`, {}, project._id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
