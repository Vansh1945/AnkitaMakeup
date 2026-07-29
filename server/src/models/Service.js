const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Service title must be at least 3 characters long'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Service category is required'],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Service duration is required'],
      min: [5, 'Duration must be at least 5 minutes'],
    },
    price: {
      type: Number,
      required: [true, 'Service price is required'],
      min: [0, 'Price cannot be negative'],
    },
    coverImage: {
      type: String,
      required: [true, 'Service cover image is required'],
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug from title
ServiceSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('Service', ServiceSchema);
