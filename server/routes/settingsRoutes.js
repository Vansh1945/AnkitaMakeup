const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSettingsImages } = require('../middleware/uploadMiddleware');

const router = express.Router();

const optionalUploadSettingsImages = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return uploadSettingsImages(req, res, next);
  }
  next();
};

router.get('/', getSettings);
router.put('/', protect, authorize('admin'), optionalUploadSettingsImages, updateSettings);

module.exports = router;
