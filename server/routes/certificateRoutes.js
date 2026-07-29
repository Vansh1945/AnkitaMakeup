const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadCertificateImage } = require('../middleware/uploadMiddleware');

const optionalUploadCertificateImage = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return uploadCertificateImage(req, res, next);
  }
  next();
};

// Public route to get certificates
router.get('/', certificateController.getAllCertificates);
router.get('/:id', certificateController.getCertificateById);

// Admin protected routes
router.post('/', protect, authorize('admin'), optionalUploadCertificateImage, certificateController.createCertificate);
router.put('/:id', protect, authorize('admin'), optionalUploadCertificateImage, certificateController.updateCertificate);
router.delete('/:id', protect, authorize('admin'), certificateController.deleteCertificate);

module.exports = router;
