const Task = require('../models/Task');

// @route   GET /api/tasks
// @desc    Get all tasks (with filtering and sorting)
// @access  Private (Admin)
exports.getTasks = async (req, res) => {
  try {
    let query = {};
    
    // Filtering
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.category) query.category = req.query.category;
    if (req.query.project) query.project = req.query.project;
    
    // Default sorting: due date ascending, then priority
    let sort = { dueDate: 1, createdAt: -1 };
    
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',').join(' ');
      sort = sortFields;
    }

    const tasks = await Task.find(query)
      .populate({ path: 'project', select: 'title' })
      .sort(sort);

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate({ path: 'project', select: 'title' });
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
exports.createTask = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.admin._id;

    // Handle tags string to array if needed
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Set completedAt if created as completed
    if (req.body.status === 'Completed') {
      req.body.completedAt = Date.now();
    }

    const task = await Task.create(req.body);
    const populatedTask = await Task.findById(task._id).populate({ path: 'project', select: 'title' });

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Handle completion toggle
    if (req.body.status && req.body.status === 'Completed' && task.status !== 'Completed') {
      req.body.completedAt = Date.now();
    } else if (req.body.status && req.body.status !== 'Completed') {
      req.body.completedAt = null;
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({ path: 'project', select: 'title' });

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/tasks/:id/status
// @desc    Update task status only (Quick complete / Kanban drag)
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status;
    if (status === 'Completed') {
      task.completedAt = Date.now();
    } else {
      task.completedAt = null;
    }

    await task.save();
    
    // Populate to return the full object for state update
    const populatedTask = await Task.findById(task._id).populate({ path: 'project', select: 'title' });

    res.json({ success: true, data: populatedTask });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
