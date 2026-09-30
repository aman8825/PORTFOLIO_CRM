const express = require('express');
const router = express.Router();
const {
  getTestimonials,
  getPublicTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} = require('../../controllers/testimonialsController');
const { protect, authorize } = require('../../middleware/auth');

// Public route
router.get('/public', getPublicTestimonials);

// Admin routes
router.use(protect);
router.route('/')
  .get(getTestimonials)
  .post(authorize('superadmin', 'editor'), createTestimonial);

router.route('/:id')
  .put(authorize('superadmin', 'editor'), updateTestimonial)
  .delete(authorize('superadmin'), deleteTestimonial);

module.exports = router;
