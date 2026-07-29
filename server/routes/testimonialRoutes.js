const express = require('express');
const {
  addReview,
  getApprovedReviews,
  getReviewsAdmin,
  approveReview,
  rejectReview,
  deleteReview,
} = require('../controllers/testimonialController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadTestimonialImage } = require('../middleware/uploadMiddleware');
const { sensitiveLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post('/', sensitiveLimiter, uploadTestimonialImage, addReview);
router.get('/approved', getApprovedReviews);

// Protected routes (Admin only)
router.get('/', protect, authorize('admin'), getReviewsAdmin);
router.put('/:id/approve', protect, authorize('admin'), approveReview);
router.put('/:id/reject', protect, authorize('admin'), rejectReview);
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;
