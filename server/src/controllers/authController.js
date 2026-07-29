const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Authenticate admin & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  const { email, password, pin } = req.body;

  try {
    // 1. Validation check
    if (!email || !password) {
      res.status(400);
      return next(new Error('Please provide an email and password'));
    }

    // 2. Locate admin in database (include password and security pin for verification)
    const admin = await Admin.findOne({ email }).select('+password +securityPin');
    if (!admin) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    // 3. Verify password match
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    // 4. If no PIN is provided, request PIN entry
    if (!pin) {
      return res.status(200).json({
        success: true,
        requirePin: true,
        message: 'Credentials valid. Please enter security PIN.',
      });
    }

    // 5. Verify security PIN
    const isPinMatch = await admin.comparePin(pin);
    if (!isPinMatch) {
      res.status(401);
      return next(new Error('Invalid security PIN'));
    }

    // 6. Generate token & store in cookie
    generateToken(res, admin._id, admin.role);

    // 7. Send success response (exclude password and PIN)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        photo: admin.photo,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log user out / clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Public
 */
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      httpOnly: true,
      expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in admin
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update admin profile details
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { username, email } = req.body;

    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      res.status(404);
      return next(new Error('Admin not found'));
    }

    // Check username uniqueness if changed
    if (username && username !== admin.username) {
      const existingUser = await Admin.findOne({ username });
      if (existingUser) {
        res.status(400);
        return next(new Error('Username is already in use'));
      }
      admin.username = username;
    }

    // Check email uniqueness if changed
    if (email && email !== admin.email) {
      const existingEmail = await Admin.findOne({ email });
      if (existingEmail) {
        res.status(400);
        return next(new Error('Email is already in use'));
      }
      admin.email = email;
    }

    // Set new profile image path if uploaded
    if (req.file) {
      admin.photo = req.file.path;
    }

    const updatedAdmin = await admin.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedAdmin._id,
        username: updatedAdmin.username,
        email: updatedAdmin.email,
        photo: updatedAdmin.photo,
        role: updatedAdmin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update admin password
 * @route   PUT /api/v1/auth/password
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      return next(new Error('Please provide current and new passwords'));
    }

    const admin = await Admin.findById(req.user._id).select('+password');
    if (!admin) {
      res.status(404);
      return next(new Error('Admin not found'));
    }

    // Verify current password match
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Incorrect current password'));
    }

    // Set new password (will be hashed automatically via mongoose pre-save hook)
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update admin security PIN
 * @route   PUT /api/v1/auth/pin
 * @access  Private
 */
exports.updateSecurityPin = async (req, res, next) => {
  try {
    const { currentPassword, newPin } = req.body;

    if (!currentPassword || !newPin) {
      res.status(400);
      return next(new Error('Please provide current password and new security PIN'));
    }

    if (newPin.length < 4) {
      res.status(400);
      return next(new Error('Security PIN must be at least 4 digits'));
    }

    const admin = await Admin.findById(req.user._id).select('+password');
    if (!admin) {
      res.status(404);
      return next(new Error('Admin not found'));
    }

    // Verify current password match
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Incorrect password'));
    }

    // Set new security PIN
    admin.securityPin = newPin;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Security PIN updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
