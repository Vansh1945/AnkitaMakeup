const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadCertificateImage } = require('../middleware/uploadMiddleware');

// Public route to get certificates
router.get('/', certificateController.getAllCertificates);
router.get('/:id', certificateController.getCertificateById);

// Admin protected routes
router.post('/', protect, authorize('admin'), uploadCertificateImage, certificateController.createCertificate);
router.put('/:id', protect, authorize('admin'), uploadCertificateImage, certificateController.updateCertificate);
router.delete('/:id', protect, authorize('admin'), certificateController.deleteCertificate);

module.exports = router;
