const express = require('express');
const {
  submitContactMessage,
  getContactMessages,
  markAsRead,
  deleteContactMessage,
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { sensitiveLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post('/', sensitiveLimiter, submitContactMessage);

// Protected routes (Admin only)
router.get('/', protect, authorize('admin'), getContactMessages);
router.put('/:id/read', protect, authorize('admin'), markAsRead);
router.patch('/:id/read', protect, authorize('admin'), markAsRead);
router.delete('/:id', protect, authorize('admin'), deleteContactMessage);

module.exports = router;
