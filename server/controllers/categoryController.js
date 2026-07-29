const Category = require('../models/Category');

/**
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
exports.getAllCategories = async (req, res, next) => {
  try {
    const { all } = req.query;
    const filter = all === 'true' ? {} : { active: true };

    const categories = await Category.find(filter).sort({ sortOrder: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category by ID
 * @route   GET /api/v1/categories/:id
 * @access  Public
 */
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      return next(new Error('Category not found'));
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/v1/categories
 * @access  Private/Admin
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, active, sortOrder } = req.body;

    if (!name) {
      res.status(400);
      return next(new Error('Category name is required'));
    }

    const category = await Category.create({
      name,
      description: description || '',
      active: active !== undefined ? active : true,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/v1/categories/:id
 * @access  Private/Admin
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      return next(new Error('Category not found'));
    }

    const { name, description, active, sortOrder } = req.body;

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (active !== undefined) category.active = active;
    if (sortOrder !== undefined) category.sortOrder = Number(sortOrder);

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/v1/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      return next(new Error('Category not found'));
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
