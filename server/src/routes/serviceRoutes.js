const express = require('express');
const {
  getAllServices,
  getService,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadServiceCover } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/:idOrSlug', getService);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), uploadServiceCover, createService);
router.put('/:id', protect, authorize('admin'), uploadServiceCover, updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;
