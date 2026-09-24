const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect } = require('../../middleware/auth');
const {
  createMessage,
  getMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
  replyToMessage
} = require('../../controllers/messagesController');

// Rate limiting for public message submission
const messageSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 message submissions per window
  message: { success: false, message: 'Too many messages sent from this IP, please try again after 15 minutes.' }
});

// Public Route
router.post('/', messageSubmitLimiter, createMessage);

// Protected Admin Routes
router.use(protect);
router.get('/', getMessages);
router.get('/:id', getMessageById);
router.patch('/:id', updateMessageStatus);
router.delete('/:id', deleteMessage);
router.post('/:id/reply', replyToMessage);

module.exports = router;
