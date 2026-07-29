const Testimonial = require('../models/Testimonial');

/**
 * @desc    Submit a new review/testimonial (Public)
 * @route   POST /api/v1/testimonials or /api/v1/reviews
 * @access  Public
 */
exports.addReview = async (req, res, next) => {
  try {
    const { customerName, serviceName, phone, email, rating, review } = req.body;

    const trimmedName = customerName?.trim();
    const trimmedReview = review?.trim();
    const numericRating = Number(rating);

    if (!trimmedName || !rating || !trimmedReview) {
      res.status(400);
      return next(new Error('Customer name, rating, and review text are required'));
    }

    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      res.status(400);
      return next(new Error('Rating must be between 1 and 5 stars'));
    }

    let image = '';
    if (req.file) {
      image = req.file.path || req.file.secure_url || '';
    }

    const testimonial = await Testimonial.create({
      customerName: trimmedName,
      serviceName: serviceName ? serviceName.trim() : '',
      phone: phone ? phone.trim() : '',
      email: email ? email.trim().toLowerCase() : '',
      rating: numericRating,
      review: trimmedReview,
      image,
      status: 'Pending',
      approved: false, // Default pending, hidden from public website until approved
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will be visible once approved by the administrator.',
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all approved reviews for public website display ONLY
 * @route   GET /api/v1/testimonials/approved or /api/v1/reviews/approved
 * @access  Public
 */
exports.getApprovedReviews = async (req, res, next) => {
  try {
    // Only return reviews where status === 'Approved' or approved === true
    const reviews = await Testimonial.find({
      $or: [{ status: 'Approved' }, { approved: true }]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for administration
 * @route   GET /api/v1/testimonials or /api/v1/reviews
 * @access  Private/Admin
 */
exports.getReviewsAdmin = async (req, res, next) => {
  try {
    const reviews = await Testimonial.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a review
 * @route   PUT /api/v1/testimonials/:id/approve or /api/v1/reviews/:id/approve
 * @access  Private/Admin
 */
exports.approveReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      res.status(404);
      return next(new Error('Testimonial not found'));
    }

    testimonial.status = 'Approved';
    testimonial.approved = true;
    await testimonial.save();

    res.status(200).json({
      success: true,
      message: 'Review approved successfully',
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a review
 * @route   PUT /api/v1/testimonials/:id/reject or /api/v1/reviews/:id/reject
 * @access  Private/Admin
 */
exports.rejectReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      res.status(404);
      return next(new Error('Testimonial not found'));
    }

    testimonial.status = 'Rejected';
    testimonial.approved = false;
    await testimonial.save();

    res.status(200).json({
      success: true,
      message: 'Review rejected successfully',
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/v1/testimonials/:id or /api/v1/reviews/:id
 * @access  Private/Admin
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      res.status(404);
      return next(new Error('Testimonial not found'));
    }

    await testimonial.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
