const Article = require('../models/Article');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
exports.getArticles = async (req, res) => {
  try {
    const { status, all } = req.query;
    let query = {};
    
    // If 'all' is not passed, default to only showing Published.
    // Dashboard should pass ?all=true to get everything.
    if (status) {
      query.status = status;
    } else if (all !== 'true') {
      query.status = 'Published';
    }

    const articles = await Article.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: articles.length, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get single article
// @route   GET /api/articles/:id
// @access  Public
exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.status(200).json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get single article by slug
// @route   GET /api/articles/slug/:slug
// @access  Public
exports.getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    
    // Increment view count if published
    if (article.status === 'Published') {
      article.views += 1;
      await article.save();
    }
    
    res.status(200).json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Create new article
// @route   POST /api/articles
// @access  Private
exports.createArticle = async (req, res) => {
  try {
    const article = await Article.create(req.body);
    
    await ActivityLog.create({
      action: 'ARTICLE_CREATED',
      description: `Drafted new article: ${article.title}`,
      actor: req.admin._id,
      entityType: 'Article',
      entityId: article._id
    });

    res.status(201).json({ success: true, data: article });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Bad Request', error: error.message });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    await ActivityLog.create({
      action: 'ARTICLE_UPDATED',
      description: `Updated article: ${article.title}`,
      actor: req.admin._id,
      entityType: 'Article',
      entityId: article._id
    });

    res.status(200).json({ success: true, data: article });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Bad Request', error: error.message });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    await ActivityLog.create({
      action: 'ARTICLE_DELETED',
      description: `Deleted article: ${article.title}`,
      actor: req.admin._id,
      entityType: 'Article',
      entityId: article._id
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
