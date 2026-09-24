const Message = require('../models/Message');
const { sendAdminNotification, sendReplyToVisitor } = require('../services/emailService');

// @desc    Create a new contact message
// @route   POST /api/messages
// @access  Public
exports.createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Simple validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const newMessage = await Message.create({
      name,
      email,
      subject,
      message,
      status: 'unread'
    });

    // Fire & forget email notification
    sendAdminNotification(newMessage).catch(err => console.error(err));

    res.status(201).json({
      success: true,
      data: 'Message sent successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private (Admin)
exports.getMessages = async (req, res) => {
  try {
    const { search, status, sort } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOpt = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const messages = await Message.find(query).sort(sortOpt);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
};

// @desc    Get single message by ID
// @route   GET /api/messages/:id
// @access  Private (Admin)
exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch message', error: error.message });
  }
};

// @desc    Update message status
// @route   PATCH /api/messages/:id
// @access  Private (Admin)
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['unread', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update message', error: error.message });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private (Admin)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete message', error: error.message });
  }
};

// @desc    Reply to a message
// @route   POST /api/messages/:id/reply
// @access  Private (Admin)
exports.replyToMessage = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    
    if (!replyMessage) {
      return res.status(400).json({ success: false, message: 'Reply message cannot be empty' });
    }

    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Attempt to send email
    const subjectPrefix = message.subject.toLowerCase().startsWith('re:') ? '' : 'Re: ';
    const subject = `${subjectPrefix}${message.subject}`;
    
    await sendReplyToVisitor(message.email, subject, replyMessage);

    // Update message record
    message.replies.push({ message: replyMessage, sentAt: Date.now() });
    message.status = 'replied';
    message.repliedAt = Date.now();
    message.replyCount += 1;

    await message.save();

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send reply', error: error.message });
  }
};
