const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const Testimonial = require('../models/Testimonial');
const Gallery = require('../models/Gallery');
const Certificate = require('../models/Certificate');

/**
 * Get Admin Dashboard Summary Statistics
 * GET /api/v1/admin/dashboard
 */
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const [
      totalServices,
      totalAppointments,
      totalReviews,
      totalGalleryImages,
      totalCertificates,
      recentAppointments,
      pendingReviewList
    ] = await Promise.all([
      Service.countDocuments().catch(() => 0),
      Appointment.countDocuments().catch(() => 0),
      Testimonial.countDocuments().catch(() => 0),
      Gallery.countDocuments().catch(() => 0),
      Certificate.countDocuments().catch(() => 0),
      Appointment.find().sort({ createdAt: -1 }).limit(5).catch(() => []),
      Testimonial.find({ approved: false }).sort({ createdAt: -1 }).limit(5).catch(() => [])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalServices,
        totalAppointments,
        totalReviews,
        totalGalleryImages,
        totalCertificates,
        pendingReviewsCount: pendingReviewList.length,
        recentAppointments,
        pendingReviewList,
        recentActivity: []
      }
    });
  } catch (error) {
    next(error);
  }
};
