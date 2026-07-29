const Appointment = require('../models/Appointment');

/**
 * Get all appointments (Admin)
 * GET /api/v1/appointments
 */
exports.getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
      appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get booked dates (Public for booking calendar validation)
 * GET /api/v1/appointments/booked-dates
 */
exports.getBookedDates = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({
      status: { $in: ['Pending', 'Confirmed'] }
    }).select('appointmentDate');

    // Count bookings per date (assuming 3 slots per day limit)
    const dateCounts = {};
    appointments.forEach((appt) => {
      if (appt.appointmentDate) {
        dateCounts[appt.appointmentDate] = (dateCounts[appt.appointmentDate] || 0) + 1;
      }
    });

    const bookedDates = Object.keys(dateCounts).filter((dateStr) => dateCounts[dateStr] >= 3);

    res.status(200).json({
      success: true,
      data: bookedDates,
      bookedDates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new appointment booking request
 * POST /api/v1/appointments
 */
exports.createAppointment = async (req, res, next) => {
  try {
    const { customerName, name, phone, mobile, email, serviceName, service, appointmentDate, date, time, address, notes } = req.body;

    const finalName = (customerName || name || '')?.trim();
    const finalPhone = (phone || mobile || '')?.trim();
    const finalDate = (appointmentDate || date || '')?.trim();
    const finalService = (serviceName || service || '')?.trim();

    if (!finalName || !finalPhone || !finalDate) {
      res.status(400);
      return next(new Error('Customer name, phone number, and appointment date are required'));
    }

    if (finalPhone.length < 7 || finalPhone.length > 20) {
      res.status(400);
      return next(new Error('Please enter a valid phone number'));
    }

    const newAppointment = await Appointment.create({
      customerName: finalName,
      phone: finalPhone,
      email: email ? email.trim().toLowerCase() : '',
      serviceName: finalService || 'Bridal HD Makeup',
      appointmentDate: finalDate,
      time: time ? time.trim() : '11:00 AM',
      address: address ? address.trim() : '',
      notes: notes ? notes.trim() : '',
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully',
      data: newAppointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment status (Admin)
 * PATCH /api/v1/appointments/:id/status or PUT /api/v1/appointments/:id
 */
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (status) appointment.status = status;
    if (req.body.customerName) appointment.customerName = req.body.customerName;
    if (req.body.phone) appointment.phone = req.body.phone;
    if (req.body.serviceName) appointment.serviceName = req.body.serviceName;
    if (req.body.appointmentDate) appointment.appointmentDate = req.body.appointmentDate;
    if (req.body.time) appointment.time = req.body.time;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete appointment record (Admin)
 * DELETE /api/v1/appointments/:id
 */
exports.deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
