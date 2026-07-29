const Service = require('../models/Service');

/**
 * @desc    Get all services
 * @route   GET /api/v1/services
 * @access  Public / Admin
 */
exports.getAllServices = async (req, res, next) => {
  try {
    const { category, featured, all } = req.query;
    const filter = {};

    // By default, public only sees active services
    if (all !== 'true') {
      filter.active = true;
    }

    if (category) {
      filter.category = category;
    }

    if (featured) {
      filter.featured = featured === 'true';
    }

    const services = await Service.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single service by ID or Slug
 * @route   GET /api/v1/services/:idOrSlug
 * @access  Public
 */
exports.getService = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let service;

    // Check if the parameter is a valid MongoDB ObjectID
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      service = await Service.findById(idOrSlug);
    } else {
      service = await Service.findOne({ slug: idOrSlug });
    }

    if (!service) {
      res.status(404);
      return next(new Error('Service not found'));
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};
// Helper to parse numeric values from string inputs (e.g. "15000" or "₹15000")
const parseNumber = (val) => {
  if (val === undefined || val === null || val === '') return NaN;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.]/g, '');
    return cleaned ? parseFloat(cleaned) : NaN;
  }
  return NaN;
};

// Helper to parse duration strings like "240 Mins", "2.5 Hours", "120", 240
const parseDuration = (val) => {
  if (val === undefined || val === null || val === '') return NaN;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const trimmed = val.trim().toLowerCase();
    const match = trimmed.match(/^([\d.]+)\s*(hrs?|hours?|mins?|minutes?)?$/i) || trimmed.match(/[\d.]+/);
    if (!match) return NaN;
    const num = parseFloat(match[1] || match[0]);
    if (isNaN(num)) return NaN;
    
    if (match[2] && (match[2].startsWith('hour') || match[2].startsWith('hr'))) {
      return Math.round(num * 60);
    }
    return num;
  }
  return NaN;
};

/**
 * @desc    Create a new service
 * @route   POST /api/v1/services
 * @access  Private/Admin
 */
exports.createService = async (req, res, next) => {
  try {
    const { title, description, category, duration, price, featured, active } = req.body;

    const trimmedTitle = title?.trim();
    const numPrice = parseNumber(price);
    const numDuration = parseDuration(duration);

    if (!trimmedTitle || !category || price === undefined) {
      res.status(400);
      return next(new Error('Service title, category, and price are required'));
    }

    if (isNaN(numPrice) || numPrice < 0) {
      res.status(400);
      return next(new Error('Price must be a valid positive number'));
    }

    if (isNaN(numDuration) || numDuration <= 0) {
      res.status(400);
      return next(new Error('Duration must be a valid positive number'));
    }

    // Check if title is unique
    const existingService = await Service.findOne({ title: trimmedTitle });
    if (existingService) {
      res.status(400);
      return next(new Error('A service with this title already exists'));
    }

    // Set coverImage from upload middleware (Cloudinary URL is in req.file.path or req.file.secure_url)
    let coverImage = '';
    if (req.file) {
      coverImage = req.file.path || req.file.secure_url || '';
    } else {
      res.status(400);
      return next(new Error('Service cover image is required'));
    }

    const service = await Service.create({
      title: trimmedTitle,
      description: description ? description.trim() : '',
      category: category.trim(),
      duration: numDuration,
      price: numPrice,
      coverImage,
      featured: featured === 'true' || featured === true,
      active: active === 'true' || active === true || active === undefined, // default to true
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing service
 * @route   PUT /api/v1/services/:id
 * @access  Private/Admin
 */
exports.updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, duration, price, featured, active } = req.body;

    let service = await Service.findById(id);
    if (!service) {
      res.status(404);
      return next(new Error('Service not found'));
    }

    // Check for title uniqueness if changed
    if (title && title !== service.title) {
      const existingService = await Service.findOne({ title });
      if (existingService) {
        res.status(400);
        return next(new Error('A service with this title already exists'));
      }
      service.title = title;
    }

    if (description) service.description = description;
    if (category) service.category = category;

    if (duration !== undefined && duration !== null && duration !== '') {
      const numDuration = parseDuration(duration);
      if (isNaN(numDuration) || numDuration <= 0) {
        res.status(400);
        return next(new Error('Duration must be a valid positive number'));
      }
      service.duration = numDuration;
    }

    if (price !== undefined && price !== null && price !== '') {
      const numPrice = parseNumber(price);
      if (isNaN(numPrice) || numPrice < 0) {
        res.status(400);
        return next(new Error('Price must be a valid positive number'));
      }
      service.price = numPrice;
    }

    if (featured !== undefined) {
      service.featured = featured === 'true' || featured === true;
    }

    if (active !== undefined) {
      service.active = active === 'true' || active === true;
    }

    // If new image uploaded
    if (req.file) {
      service.coverImage = req.file.path;
    }

    const updatedService = await service.save();

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a service
 * @route   DELETE /api/v1/services/:id
 * @access  Private/Admin
 */
exports.deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      res.status(404);
      return next(new Error('Service not found'));
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
