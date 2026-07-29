const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const galleryRoutes = require('./galleryRoutes');
const serviceRoutes = require('./serviceRoutes');
const certificateRoutes = require('./certificateRoutes');

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardSummary);
router.use('/gallery', galleryRoutes);
router.use('/services', serviceRoutes);
router.use('/certificates', certificateRoutes);

module.exports = router;
