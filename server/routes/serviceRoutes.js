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

const optionalUploadServiceCover = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return uploadServiceCover(req, res, next);
  }
  next();
};

// Public routes
router.get('/', getAllServices);
router.get('/:idOrSlug', getService);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), optionalUploadServiceCover, createService);
router.put('/:id', protect, authorize('admin'), optionalUploadServiceCover, updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;
