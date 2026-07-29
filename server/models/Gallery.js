const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Gallery item title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Gallery item category is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Gallery image path or URL is required'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model('Gallery', GallerySchema);
