const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSettingsImages } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getSettings);
router.put('/', protect, authorize('admin'), uploadSettingsImages, updateSettings);

module.exports = router;
