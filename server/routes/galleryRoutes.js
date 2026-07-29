const express = require('express');
const {
  getAllGalleryItems,
  getSingleGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} = require('../controllers/galleryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadGalleryImage } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllGalleryItems);
router.get('/:id', getSingleGalleryItem);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), uploadGalleryImage, createGalleryItem);
router.put('/:id', protect, authorize('admin'), uploadGalleryImage, updateGalleryItem);
router.delete('/:id', protect, authorize('admin'), deleteGalleryItem);

module.exports = router;
