const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Middleware to protect routes and verify JWT token validity
 */
const protect = async (req, res, next) => {
  let token;

  // Retrieve token from cookies or authorization bearer header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Ensure token exists
  if (!token) {
    res.status(401);
    const err = new Error('Not authorized, no token provided');
    err.statusCode = 401;
    return next(err);
  }

  try {
    // Verify token signature and contents
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB and attach to request context (exclude password field)
    req.user = await Admin.findById(decoded.id).select('-password');
    
    if (!req.user) {
      res.status(401);
      const err = new Error('User not found, authentication failed');
      err.statusCode = 401;
      return next(err);
    }

    next();
  } catch (error) {
    res.status(401);
    error.statusCode = 401;
    return next(error);
  }
};

/**
 * Middleware to restrict access based on user role
 * @param {...string} roles - Approved roles list
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`User role (${req.user?.role || 'none'}) is not authorized to access this resource`)
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
