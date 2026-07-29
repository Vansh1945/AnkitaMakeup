const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { sensitiveLimiter } = require('../middleware/rateLimiter');

// Public route to fetch booked dates
router.get('/booked-dates', appointmentController.getBookedDates);

// Public route to submit new appointment booking
router.post('/', sensitiveLimiter, appointmentController.createAppointment);

// Admin routes (Protected)
router.get('/', protect, authorize('admin'), appointmentController.getAllAppointments);
router.patch('/:id/status', protect, authorize('admin'), appointmentController.updateAppointmentStatus);
router.put('/:id', protect, authorize('admin'), appointmentController.updateAppointmentStatus);
router.delete('/:id', protect, authorize('admin'), appointmentController.deleteAppointment);

module.exports = router;
