const express = require('express');
const {
  getAllGalleryItems,
  createGalleryItem,
  deleteGalleryItem,
} = require('../controllers/galleryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadGalleryImage } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllGalleryItems);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), uploadGalleryImage, createGalleryItem);
router.delete('/:id', protect, authorize('admin'), deleteGalleryItem);

module.exports = router;
