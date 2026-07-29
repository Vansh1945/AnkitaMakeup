const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const galleryRoutes = require('./galleryRoutes');

// Protect all admin summary routes
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardSummary);
router.use('/gallery', galleryRoutes);

module.exports = router;
