const express = require('express');
const { login, logout, getMe, updateProfile, updatePassword, updateSecurityPin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAdminPhoto } = require('../middleware/uploadMiddleware');
const { sensitiveLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post('/login', sensitiveLimiter, login);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadAdminPhoto, updateProfile);
router.put('/password', protect, updatePassword);
router.put('/pin', protect, updateSecurityPin);

module.exports = router;
