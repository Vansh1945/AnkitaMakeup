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

const optionalUploadGalleryImage = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return uploadGalleryImage(req, res, next);
  }
  next();
};

// Public routes
router.get('/', getAllGalleryItems);
router.get('/:id', getSingleGalleryItem);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), optionalUploadGalleryImage, createGalleryItem);
router.put('/:id', protect, authorize('admin'), optionalUploadGalleryImage, updateGalleryItem);
router.delete('/:id', protect, authorize('admin'), deleteGalleryItem);

module.exports = router;
