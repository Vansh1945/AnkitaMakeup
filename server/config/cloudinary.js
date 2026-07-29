const cloudinary = require('cloudinary').v2;

/**
 * Configure Cloudinary SDK with credentials from environment variables.
 * Call this once at server startup.
 */
const connectCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Always use HTTPS URLs
  });

  console.log('Cloudinary configured successfully');
};

module.exports = { cloudinary, connectCloudinary };
