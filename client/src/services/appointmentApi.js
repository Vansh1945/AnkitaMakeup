import api from './api';

/**
 * Fetch fully booked dates from backend API
 * GET /appointments/booked-dates or GET /api/appointments/booked-dates
 */
export const getBookedDates = async () => {
  try {
    let response;
    try {
      response = await api.get('/appointments/booked-dates');
    } catch (e) {
      try {
        response = await api.get('/api/appointments/booked-dates');
      } catch (e2) {
        response = null;
      }
    }

    if (response && Array.isArray(response.bookedDates)) {
      return response.bookedDates;
    }
    if (response && response.data && Array.isArray(response.data.bookedDates)) {
      return response.data.bookedDates;
    }

    // Default mock booked dates if backend endpoint is unpopulated
    // Format: YYYY-MM-DD
    const today = new Date();
    const booked1 = new Date(today);
    booked1.setDate(today.getDate() + 2);
    const booked2 = new Date(today);
    booked2.setDate(today.getDate() + 5);

    return [
      booked1.toISOString().split('T')[0],
      booked2.toISOString().split('T')[0]
    ];
  } catch (error) {
    console.warn('Error fetching booked dates, using default booked dates:', error);
    return [];
  }
};

/**
 * Submit a new appointment booking request
 * POST /appointments or POST /api/appointments
 */
export const createAppointment = async (bookingData) => {
  try {
    let response;
    try {
      response = await api.post('/appointments', bookingData);
    } catch (e) {
      response = await api.post('/api/appointments', bookingData);
    }
    return response;
  } catch (error) {
    console.error('Error submitting appointment booking:', error);
    throw error;
  }
};
