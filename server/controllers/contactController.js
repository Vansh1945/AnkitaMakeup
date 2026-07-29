const Contact = require('../models/Contact');

/**
 * @desc    Submit a new contact message
 * @route   POST /api/v1/contact
 * @access  Public
 */
exports.submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim()?.toLowerCase();
    const trimmedPhone = phone?.trim();
    const trimmedMessage = message?.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedMessage) {
      res.status(400);
      return next(new Error('Please provide name, email, phone number, and message'));
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400);
      return next(new Error('Please enter a valid email address'));
    }

    if (trimmedPhone.length < 7 || trimmedPhone.length > 20) {
      res.status(400);
      return next(new Error('Please enter a valid phone number'));
    }

    // Create the message in database
    const contactMessage = await Contact.create({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      subject: subject ? subject.trim() : 'General Inquiry',
      message: trimmedMessage,
    });

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted successfully. We will get back to you shortly.',
      data: contactMessage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all contact messages with metadata counts
 * @route   GET /api/v1/contact
 * @access  Private/Admin
 */
exports.getContactMessages = async (req, res, next) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });

    const totalMessages = messages.length;
    const unreadCount = messages.filter((m) => !m.isRead).length;
    const readCount = totalMessages - unreadCount;

    res.status(200).json({
      success: true,
      count: totalMessages,
      totalMessages,
      unreadCount,
      readCount,
      data: messages,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a message as read
 * @route   PUT /api/v1/contact/:id/read
 * @access  Private/Admin
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Contact.findById(id);
    if (!message) {
      res.status(404);
      return next(new Error('Message not found'));
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a message
 * @route   DELETE /api/v1/contact/:id
 * @access  Private/Admin
 */
exports.deleteContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Contact.findById(id);
    if (!message) {
      res.status(404);
      return next(new Error('Message not found'));
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
