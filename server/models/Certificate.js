const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Certificate title is required'],
      trim: true
    },
    institute: {
      type: String,
      required: [true, 'Institute name is required'],
      trim: true
    },
    date: {
      type: String,
      required: [true, 'Completion date is required'],
      trim: true
    },
    image: {
      type: String,
      required: [true, 'Certificate image is required'],
      trim: true
    },
    isVerified: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Certificate', certificateSchema);
