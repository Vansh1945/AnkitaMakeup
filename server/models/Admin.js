const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't return password field in queries by default
    },
    photo: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
    securityPin: {
      type: String,
      required: [true, 'Security PIN is required'],
      minlength: [4, 'Security PIN must be at least 4 digits'],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password and security pin before writing to DB
AdminSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    
    if (this.isModified('securityPin')) {
      const salt = await bcrypt.genSalt(10);
      this.securityPin = await bcrypt.hash(this.securityPin, salt);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password match
AdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to check security PIN match
AdminSchema.methods.comparePin = async function (enteredPin) {
  return await bcrypt.compare(enteredPin, this.securityPin);
};

module.exports = mongoose.model('Admin', AdminSchema);
