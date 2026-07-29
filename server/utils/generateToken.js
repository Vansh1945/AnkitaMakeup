const jwt = require('jsonwebtoken');

/**
 * Generate JWT and store in HTTP-Only Cookie
 * @param {Object} res - Express response object
 * @param {string} userId - Authenticated user id
 * @param {string} role - Authenticated user role
 */
const generateToken = (res, userId, role) => {
  const token = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

module.exports = generateToken;
