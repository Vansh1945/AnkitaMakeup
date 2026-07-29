const Certificate = require('../models/Certificate');

/**
 * Get all certificates
 * GET /api/v1/certificates
 */
exports.getAllCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
      certificates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single certificate by ID
 * GET /api/v1/certificates/:id
 */
exports.getCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new certificate
 * POST /api/v1/certificates
 */
exports.createCertificate = async (req, res, next) => {
  try {
    const { title, institute, date, image, imageUrl, isVerified } = req.body;

    const imgPath = req.file ? req.file.path : (image || imageUrl || '');

    if (!imgPath) {
      return res.status(400).json({
        success: false,
        message: 'Certificate image is required'
      });
    }

    const certificate = await Certificate.create({
      title: title?.trim(),
      institute: institute?.trim(),
      date: date?.trim(),
      image: imgPath,
      isVerified: isVerified !== false
    });

    res.status(201).json({
      success: true,
      message: 'Certificate Added Successfully',
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update certificate
 * PUT /api/v1/certificates/:id
 */
exports.updateCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, institute, date, image, imageUrl, isVerified } = req.body;

    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (title) certificate.title = title.trim();
    if (institute) certificate.institute = institute.trim();
    if (date) certificate.date = date.trim();
    if (isVerified !== undefined) certificate.isVerified = isVerified;

    if (req.file) {
      certificate.image = req.file.path;
    } else if (image || imageUrl) {
      certificate.image = image || imageUrl;
    }

    await certificate.save();

    res.status(200).json({
      success: true,
      message: 'Certificate Updated Successfully',
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete certificate
 * DELETE /api/v1/certificates/:id
 */
exports.deleteCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findByIdAndDelete(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Certificate Deleted Successfully'
    });
  } catch (error) {
    next(error);
  }
};
