const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all admin summary routes
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardSummary);

module.exports = router;
