const WebsiteSettings = require('../models/WebsiteSettings');

/**
 * @desc    Get website settings (Public & Admin)
 * @route   GET /api/v1/website-settings
 * @access  Public
 */
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await WebsiteSettings.findOne();

    // If no settings exist yet, create default document
    if (!settings) {
      settings = await WebsiteSettings.create({});
    }

    res.status(200).json({
      success: true,
      data: settings,
      settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update website settings (Private / Admin)
 * @route   PUT /api/v1/website-settings
 * @access  Private / Admin
 */
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await WebsiteSettings.findOne();

    if (!settings) {
      settings = new WebsiteSettings({});
    }

    // Allowed editable fields whitelist (Mass Assignment Prevention)
    const allowedFields = [
      'websiteName', 'businessName', 'ownerName', 'tagline', 'businessTiming',
      'yearsOfExperience', 'workingSince', 'shortDescription', 'fullAboutDescription',
      'logo', 'favicon', 'heroBannerImage', 'aboutImage',
      'heroTitle', 'heroSubtitle', 'heroDescription', 'heroButtonText', 'heroButtonLink',
      'heroSecondaryButtonText', 'heroSecondaryButtonLink', 'heroOverlayOpacity',
      'aboutTitle', 'aboutSubtitle', 'aboutShortDescription', 'happyClientsCount',
      'completedMakeovers', 'bridalMakeoversCount', 'certificationsCount', 'ctaText', 'ctaLink',
      'phone', 'altPhone', 'whatsapp', 'email', 'address', 'city', 'state', 'country', 'pincode',
      'instagram', 'instagramEnabled', 'facebook', 'facebookEnabled', 'youtube', 'youtubeEnabled',
      'pinterest', 'pinterestEnabled', 'metaTitle', 'metaDescription', 'metaKeywords',
      'canonicalUrl', 'googleAnalyticsId', 'googleSearchConsoleVerification', 'robotsMeta', 'author'
    ];

    // Merge text and boolean fields from request body (whitelisted only)
    if (req.body) {
      Object.keys(req.body).forEach((key) => {
        if (!allowedFields.includes(key)) return; // Ignore unknown or internal properties
        let val = req.body[key];
        // Parse boolean strings if sent via multipart FormData
        if (val === 'true') val = true;
        if (val === 'false') val = false;
        settings[key] = val;
      });
    }

    // Handle files if uploaded via multer (Cloudinary storage returns URL in file.path)
    if (req.files) {
      const fileKeys = Object.keys(req.files);
      fileKeys.forEach((key) => {
        if (allowedFields.includes(key) && Array.isArray(req.files[key]) && req.files[key][0]) {
          settings[key] = req.files[key][0].path || req.files[key][0].secure_url;
        }
      });
    }

    const updatedSettings = await settings.save();

    res.status(200).json({
      success: true,
      message: 'Website Settings Updated Successfully',
      data: updatedSettings,
      settings: updatedSettings
    });
  } catch (error) {
    next(error);
  }
};
