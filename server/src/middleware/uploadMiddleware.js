const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

// ─────────────────────────────────────────────────────────────────────────────
// Allowed MIME types for image uploads
// ─────────────────────────────────────────────────────────────────────────────
const ALLOWED_FORMATS = ['jpeg', 'jpg', 'png', 'webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Build a Cloudinary storage engine for a given folder
// ─────────────────────────────────────────────────────────────────────────────
const buildStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `ankita-makeup/${folder}`,
      allowed_formats: ALLOWED_FORMATS,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }], // Auto optimize quality & format
    },
  });

// ─────────────────────────────────────────────────────────────────────────────
// Helper: File filter to reject non-image MIME types early
// ─────────────────────────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'), false);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Upload Middleware Factory: single image
// Usage: upload.single('fieldName')
// ─────────────────────────────────────────────────────────────────────────────
const createSingleUpload = (folder, fieldName) =>
  multer({
    storage: buildStorage(folder),
    fileFilter: imageFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  }).single(fieldName);

// ─────────────────────────────────────────────────────────────────────────────
// Upload Middleware Factory: multiple images (up to maxCount files)
// Usage: upload.array('fieldName', maxCount)
// ─────────────────────────────────────────────────────────────────────────────
const createMultipleUpload = (folder, fieldName, maxCount = 10) =>
  multer({
    storage: buildStorage(folder),
    fileFilter: imageFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  }).array(fieldName, maxCount);

// ─────────────────────────────────────────────────────────────────────────────
// Pre-configured instances for domain-specific upload scenarios
// ─────────────────────────────────────────────────────────────────────────────

// Upload single profile photo (Admin)
const uploadAdminPhoto = createSingleUpload('admin', 'photo');

// Upload a single gallery image
const uploadGalleryImage = createSingleUpload('gallery', 'image');

// Upload a certificate image
const uploadCertificateImage = createSingleUpload('certificates', 'image');

// Upload a service cover image (single) or multiple gallery images
const uploadServiceCover = createSingleUpload('services', 'coverImage');
const uploadServiceGallery = createMultipleUpload('services', 'galleryImages', 8);

// Upload a testimonial customer image
const uploadTestimonialImage = createSingleUpload('testimonials', 'image');

// Upload website settings images (multiple fields)
const uploadSettingsImages = multer({
  storage: buildStorage('settings'),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 },
  { name: 'heroBannerImage', maxCount: 1 },
  { name: 'aboutImage', maxCount: 1 },
  { name: 'ownerProfileImage', maxCount: 1 },
  { name: 'ogImage', maxCount: 1 },
]);

// ─────────────────────────────────────────────────────────────────────────────
// Multer Error Handler (wraps multer middleware and surfaces clean errors)
// ─────────────────────────────────────────────────────────────────────────────
const handleUploadError = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400);
        return next(new Error('File too large. Maximum allowed size is 5 MB.'));
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        res.status(400);
        return next(new Error('Too many files uploaded at once.'));
      }
      res.status(400);
      return next(new Error(`Upload error: ${err.message}`));
    }
    if (err) {
      res.status(400);
      return next(err);
    }
    next();
  });
};

module.exports = {
  uploadAdminPhoto: handleUploadError(uploadAdminPhoto),
  uploadGalleryImage: handleUploadError(uploadGalleryImage),
  uploadCertificateImage: handleUploadError(uploadCertificateImage),
  uploadServiceCover: handleUploadError(uploadServiceCover),
  uploadServiceGallery: handleUploadError(uploadServiceGallery),
  uploadTestimonialImage: handleUploadError(uploadTestimonialImage),
  uploadSettingsImages: handleUploadError(uploadSettingsImages),
  // Expose factory for custom one-off usage
  createSingleUpload,
  createMultipleUpload,
  handleUploadError,
};
