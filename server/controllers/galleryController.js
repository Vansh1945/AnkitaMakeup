const Gallery = require('../models/Gallery');

/**
 * @desc    Get all gallery items
 * @route   GET /api/v1/gallery or /api/v1/admin/gallery
 * @access  Public / Admin
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
      items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single gallery item by ID
 * @route   GET /api/v1/gallery/:id
 * @access  Public / Admin
 */
exports.getSingleGalleryItem = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      res.status(404);
      return next(new Error('Gallery item not found'));
    }

    res.status(200).json({
      success: true,
      data: item,
      item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload / Create a new gallery item
 * @route   POST /api/v1/gallery or /api/v1/admin/gallery
 * @access  Private/Admin
 */
exports.createGalleryItem = async (req, res, next) => {
  try {
    const { title, category, description, isVisible } = req.body;

    if (!title || !category) {
      res.status(400);
      return next(new Error('Title and category are required'));
    }

    let image = '';
    if (req.file) {
      image = req.file.path || req.file.secure_url || req.file.location;
    } else if (req.body.imageUrl || req.body.image) {
      image = req.body.imageUrl || req.body.image;
    } else {
      res.status(400);
      return next(new Error('Image file or URL is required'));
    }

    const item = await Gallery.create({
      title: title.trim(),
      category: category.trim(),
      image,
      imageUrl: image,
      description: description ? description.trim() : '',
      isVisible: isVisible !== false && isVisible !== 'false'
    });

    res.status(201).json({
      success: true,
      message: 'Image uploaded to gallery successfully',
      data: item,
      item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing gallery item
 * @route   PUT /api/v1/gallery/:id or /api/v1/admin/gallery/:id
 * @access  Private/Admin
 */
exports.updateGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    let item = await Gallery.findById(id);

    if (!item) {
      res.status(404);
      return next(new Error('Gallery item not found'));
    }

    const { title, category, description, isVisible, imageUrl, image } = req.body;

    if (title) item.title = title.trim();
    if (category) item.category = category.trim();
    if (description !== undefined) item.description = description ? description.trim() : '';
    if (isVisible !== undefined) item.isVisible = isVisible !== false && isVisible !== 'false';

    if (req.file) {
      const newImg = req.file.path || req.file.secure_url || req.file.location;
      item.image = newImg;
      item.imageUrl = newImg;
    } else if (imageUrl || image) {
      const newImg = imageUrl || image;
      item.image = newImg;
      item.imageUrl = newImg;
    }

    const updatedItem = await item.save();

    res.status(200).json({
      success: true,
      message: 'Gallery item updated successfully',
      data: updatedItem,
      item: updatedItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete gallery item
 * @route   DELETE /api/v1/gallery/:id or /api/v1/admin/gallery/:id
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
