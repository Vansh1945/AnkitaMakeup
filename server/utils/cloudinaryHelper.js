const { cloudinary } = require('../config/cloudinary');

/**
 * Extract the Cloudinary public_id from a full Cloudinary URL.
 * Example: https://res.cloudinary.com/demo/image/upload/v123/ankita-makeup/gallery/abc.jpg
 * Returns: "ankita-makeup/gallery/abc"
 *
 * @param {string} imageUrl - Full Cloudinary URL
 * @returns {string|null} - public_id or null if extraction fails
 */
const extractPublicId = (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) return null;
    // Extract the portion after '/upload/' and strip the file extension
    const parts = imageUrl.split('/upload/');
    if (parts.length < 2) return null;
    const withVersion = parts[1]; // e.g. "v1234567890/ankita-makeup/gallery/abc.jpg"
    // Remove version prefix if present (v + digits + /)
    const withoutVersion = withVersion.replace(/^v\d+\//, '');
    // Strip the file extension
    const publicId = withoutVersion.replace(/\.[^.]+$/, '');
    return publicId;
  } catch {
    return null;
  }
};

/**
 * Upload a single image buffer or local file path to Cloudinary.
 * Useful for non-Multer upload paths (e.g., base64, stream-based uploads).
 *
 * @param {string} filePath - Local filesystem path or base64 data URI
 * @param {string} folder - Cloudinary folder name (e.g. 'gallery', 'services')
 * @returns {Promise<Object>} - Cloudinary upload result object
 */
const uploadImage = async (filePath, folder = 'general') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: `ankita-makeup/${folder}`,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  return result;
};

/**
 * Upload multiple images to Cloudinary concurrently.
 *
 * @param {string[]} filePaths - Array of local paths or base64 URIs
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Object[]>} - Array of Cloudinary upload results
 */
const uploadMultipleImages = async (filePaths, folder = 'general') => {
  const uploadPromises = filePaths.map((filePath) => uploadImage(filePath, folder));
  return Promise.all(uploadPromises);
};

/**
 * Delete a single image from Cloudinary by its URL or public_id.
 *
 * @param {string} imageUrlOrPublicId - Full Cloudinary URL or raw public_id
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
const deleteImage = async (imageUrlOrPublicId) => {
  // Determine if a URL was passed; extract public_id if needed
  const publicId =
    imageUrlOrPublicId.startsWith('http')
      ? extractPublicId(imageUrlOrPublicId)
      : imageUrlOrPublicId;

  if (!publicId) {
    throw new Error('Invalid image URL or public_id provided for deletion');
  }

  const result = await cloudinary.uploader.destroy(publicId);
  return result;
};

/**
 * Delete multiple images from Cloudinary concurrently.
 *
 * @param {string[]} imageUrls - Array of Cloudinary URLs or public_ids
 * @returns {Promise<Object[]>} - Array of deletion results
 */
const deleteMultipleImages = async (imageUrls) => {
  const deletePromises = imageUrls.map((url) => deleteImage(url));
  return Promise.all(deletePromises);
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  extractPublicId,
};
