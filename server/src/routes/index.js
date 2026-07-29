const express = require('express');
const router = express.Router();

/**
 * Health Check Endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is running smoothly',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Mount sub-routes
router.use('/auth', require('./authRoutes'));
router.use('/services', require('./serviceRoutes'));
router.use('/gallery', require('./galleryRoutes'));
router.use('/contact', require('./contactRoutes'));
router.use('/testimonials', require('./testimonialRoutes'));
router.use('/reviews', require('./testimonialRoutes'));
router.use('/website-settings', require('./settingsRoutes'));
router.use('/appointments', require('./appointmentRoutes'));
router.use('/bookings', require('./appointmentRoutes'));
router.use('/certificates', require('./certificateRoutes'));
router.use('/categories', require('./categoryRoutes'));

module.exports = router;
