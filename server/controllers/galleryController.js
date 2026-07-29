const Gallery = require('../models/Gallery');

/**
 * @desc    Get all gallery items
 * @route   GET /api/v1/gallery
 * @access  Public
 */
exports.getAllGalleryItems = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    const items = await Gallery.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload / Create a new gallery item
 * @route   POST /api/v1/gallery
 * @access  Private/Admin
 */
exports.createGalleryItem = async (req, res, next) => {
  try {
    const { title, category } = req.body;

    if (!title || !category) {
      res.status(400);
      return next(new Error('Title and category are required'));
    }

    let image = '';
    if (req.file) {
      image = req.file.path;
    } else {
      res.status(400);
      return next(new Error('Image file is required'));
    }

    const item = await Gallery.create({
      title,
      category,
      image,
    });

    res.status(201).json({
      success: true,
      message: 'Image uploaded to gallery successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete gallery item
 * @route   DELETE /api/v1/gallery/:id
 * @access  Private/Admin
 */
exports.deleteGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await Gallery.findById(id);
    if (!item) {
      res.status(404);
      return next(new Error('Gallery item not found'));
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
