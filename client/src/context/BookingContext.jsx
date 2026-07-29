import React, { createContext, useContext, useState } from 'react';
import BookAppointmentModal from '../components/common/BookAppointmentModal';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialServiceId, setInitialServiceId] = useState('');

  const openBookingModal = (serviceId = '') => {
    setInitialServiceId(serviceId);
    setIsOpen(true);
  };

  const closeBookingModal = () => {
    setIsOpen(false);
    setInitialServiceId('');
  };

  return (
    <BookingContext.Provider value={{ openBookingModal, closeBookingModal, isOpen }}>
      {children}
      <BookAppointmentModal
        isOpen={isOpen}
        onClose={closeBookingModal}
        initialServiceId={initialServiceId}
      />
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
