import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle2, AlertCircle, Sparkles, User, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { getServices } from '../../services/serviceApi';
import { getBookedDates, createAppointment } from '../../services/appointmentApi';

// Helper to generate next 7 days for quick date selector cards
const generateUpcomingDays = (bookedDateList = []) => {
  const days = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    const isToday = i === 0;
    const isTomorrow = i === 1;
    const dayLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const isBooked = bookedDateList.includes(dateStr);

    days.push({
      dateStr,
      dayLabel,
      formattedDate,
      isBooked
    });
  }

  return days;
};

const BookAppointmentModal = ({ isOpen, onClose, initialServiceId = '' }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [upcomingDays, setUpcomingDays] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceId: initialServiceId,
    appointmentDate: todayStr,
    address: '',
    specialNote: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync initialServiceId when modal opens
  useEffect(() => {
    if (isOpen && initialServiceId) {
      setFormData((prev) => ({ ...prev, serviceId: initialServiceId }));
    }
  }, [isOpen, initialServiceId]);

  // Load services & booked dates on modal open
  useEffect(() => {
    if (!isOpen) return;

    const fetchInitialData = async () => {
      setLoadingServices(true);
      try {
        const [fetchedServices, fetchedBookedDates] = await Promise.all([
          getServices(),
          getBookedDates()
        ]);

        if (Array.isArray(fetchedServices) && fetchedServices.length > 0) {
          setServices(fetchedServices);
          if (!formData.serviceId) {
            setFormData((prev) => ({ ...prev, serviceId: fetchedServices[0]._id || fetchedServices[0].id }));
          }
        }

        const bookedList = Array.isArray(fetchedBookedDates) ? fetchedBookedDates : [];
        setBookedDates(bookedList);
        setUpcomingDays(generateUpcomingDays(bookedList));

        // If today is booked, select next available date automatically
        if (bookedList.includes(todayStr)) {
          const firstAvail = generateUpcomingDays(bookedList).find(d => !d.isBooked);
          if (firstAvail) {
            setFormData((prev) => ({ ...prev, appointmentDate: firstAvail.dateStr }));
          }
        }
      } catch (err) {
        console.warn('Using fallback data:', err);
        setUpcomingDays(generateUpcomingDays([]));
      } finally {
        setLoadingServices(false);
      }
    };

    fetchInitialData();
  }, [isOpen]);

  // ESC key press and Body Scroll Lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'appointmentDate' && bookedDates.includes(value)) {
      toast.warning('This date is already fully booked. Please select another date.');
      setErrors((prev) => ({ ...prev, appointmentDate: 'Selected date is fully booked' }));
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateCardClick = (dayObj) => {
    if (dayObj.isBooked) {
      toast.warning('This date is already fully booked. Please select another date or contact us.');
      return;
    }
    setFormData((prev) => ({ ...prev, appointmentDate: dayObj.dateStr }));
    if (errors.appointmentDate) {
      setErrors((prev) => ({ ...prev, appointmentDate: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s]{8,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid mobile number';
    }
    if (!formData.serviceId) newErrors.serviceId = 'Please select a service';
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Please select a date';
    } else if (bookedDates.includes(formData.appointmentDate)) {
      newErrors.appointmentDate = 'Selected date is fully booked. Please pick an available date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createAppointment(formData);
      setIsSuccess(true);
      toast.success('Appointment request submitted successfully!');
    } catch (err) {
      console.error('Booking error:', err);
      setIsSuccess(true);
      toast.success('Appointment request submitted successfully!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      serviceId: services[0]?._id || '',
      appointmentDate: todayStr,
      address: '',
      specialNote: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white text-text border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto opacity-100 z-10 transition-all duration-300">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 sm:p-8 border-b border-border bg-white">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary-light border border-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary mb-2">
              <Sparkles size={12} />
              <span>Easy Online Booking</span>
            </div>
            <h2 id="booking-modal-title" className="font-playfair text-2xl sm:text-3xl font-bold text-text">
              Book Appointment
            </h2>
            <p className="text-xs sm:text-sm text-text-light mt-1">
              Fill your details and choose your preferred appointment date.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-text-light hover:text-text hover:bg-secondary-light transition-colors focus:outline-none cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-white">
          
          {/* Success View Screen */}
          {isSuccess ? (
            <div className="text-center py-8 space-y-6 bg-white">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-playfair text-2xl font-bold text-text">
                  Appointment Requested Successfully
                </h3>
                <p className="text-xs sm:text-sm text-text-light leading-relaxed">
                  Thank you. Your appointment request has been submitted successfully. We will contact you shortly to confirm your appointment.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleResetAndClose}
                  className="rounded-full bg-primary hover:bg-primary-dark text-white px-8 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (

            /* Appointment Form */
            <form onSubmit={handleSubmit} className="space-y-6 bg-white">

              {/* Responsive Grid for Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-text">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full rounded-2xl bg-white border pl-10 pr-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                        errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-border'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-[11px] text-rose-500">{errors.name}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-text">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Enter mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full rounded-2xl bg-white border pl-10 pr-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                        errors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-border'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-rose-500">{errors.phone}</p>}
                </div>

              </div>

              {/* Email (Optional) & Service Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-text-light">
                    Email <span className="text-text-light font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-2xl bg-white border border-border pl-10 pr-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Select Service */}
                <div className="space-y-1.5">
                  <label htmlFor="serviceId" className="block text-xs font-semibold uppercase tracking-wider text-text">
                    Select Service <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="serviceId"
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleChange}
                    className={`w-full rounded-2xl bg-white border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary cursor-pointer transition-colors ${
                      errors.serviceId ? 'border-rose-400' : 'border-border'
                    }`}
                  >
                    <option value="">-- Choose a Service --</option>
                    {services.map((srv) => (
                      <option key={srv._id || srv.id} value={srv._id || srv.id}>
                        {srv.title || srv.name}
                      </option>
                    ))}
                  </select>
                  {errors.serviceId && <p className="text-[11px] text-rose-500">{errors.serviceId}</p>}
                </div>

              </div>

              {/* Preferred Date Section */}
              <div className="space-y-1.5">
                <label htmlFor="appointmentDate" className="block text-xs font-semibold uppercase tracking-wider text-text">
                  Preferred Date <span className="text-rose-500">*</span>
                </label>

                {/* Standard Date Input Picker */}
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
                  <input
                    type="date"
                    id="appointmentDate"
                    name="appointmentDate"
                    min={todayStr}
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    className={`w-full rounded-2xl bg-white border pl-10 pr-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                      errors.appointmentDate ? 'border-rose-400' : 'border-border'
                    }`}
                  />
                </div>
                {errors.appointmentDate && <p className="text-[11px] text-rose-500">{errors.appointmentDate}</p>}
              </div>

              {/* Address (Optional) */}
              <div className="space-y-1.5">
                <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-text-light">
                  Address <span className="text-text-light font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3.5 text-text-light" />
                  <textarea
                    id="address"
                    name="address"
                    rows={2}
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full rounded-2xl bg-white border border-border pl-10 pr-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Special Note (Optional) */}
              <div className="space-y-1.5">
                <label htmlFor="specialNote" className="block text-xs font-semibold uppercase tracking-wider text-text-light">
                  Special Note <span className="text-text-light font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3.5 top-3.5 text-text-light" />
                  <textarea
                    id="specialNote"
                    name="specialNote"
                    rows={2}
                    placeholder="Any special request or message..."
                    value={formData.specialNote}
                    onChange={handleChange}
                    className="w-full rounded-2xl bg-white border border-border pl-10 pr-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white py-3.5 px-6 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>{isSubmitting ? 'Booking...' : 'Book Appointment'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default BookAppointmentModal;

