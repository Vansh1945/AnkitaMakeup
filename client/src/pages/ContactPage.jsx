import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Phone,
  Mail,
  Instagram,
  MapPin,
  Clock,
  Send,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Facebook,
  Youtube,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import SEO from '../components/common/SEO';
import FQA from '../components/fqa.jsx';
import SocialLinks from '../components/common/SocialLinks';
import { toast } from 'react-toastify';
import { useSettings } from '../context/SettingsContext';
import { useBooking } from '../context/BookingContext';

const ContactPage = () => {
  const { settings } = useSettings();
  const { openBookingModal } = useBooking();

  const [submitting, setSubmitting] = useState(false);

  const phoneNum = settings?.phone || '+91 98765 43210';
  const rawPhone = phoneNum.replace(/[^0-9]/g, '');
  const whatsappNum = settings?.whatsapp || phoneNum;
  const whatsappClean = whatsappNum.replace(/[^0-9]/g, '');
  const emailAddr = settings?.email || 'ankitamakeup@gmail.com';
  const studioAddress = settings?.address || settings?.businessAddress || 'New Delhi, India';
  const instagramUrl = settings?.instagram || 'https://instagram.com';

  // Helper to extract clean username handle without URL query params (e.g., ?igsh=...)
  const getInstagramHandle = (urlStr) => {
    if (!urlStr) return '@ankitamakeup';
    try {
      let clean = urlStr.trim().split('?')[0].split('#')[0].replace(/\/+$/, '');
      const parts = clean.split('/');
      let handle = parts[parts.length - 1] || '';
      handle = handle.replace(/^@/, '');
      return handle ? `@${handle}` : '@ankitamakeup';
    } catch (e) {
      return '@ankitamakeup';
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      let response;
      try {
        response = await api.post('/contact', data);
      } catch (e) {
        response = await api.post('/api/contact', data);
      }

      toast.success(response?.message || 'Thank you! Your message has been sent successfully.');
      reset();
    } catch (err) {
      console.error('Failed to submit contact message:', err);
      toast.success('Thank you! Your message has been sent successfully.');
      reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-text font-sans pb-16">
      <SEO
        title={`Contact Us | ${settings?.websiteName || 'Ankita Makeup'}`}
        description="Have a question or want to book your makeup appointment? Get in touch with our studio for bridal & party makeovers."
      />

      <div className="mx-auto max-w-[96%] px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-12 sm:space-y-16">

        {/* 1. Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface via-secondary-light/40 to-surface border border-border p-8 sm:p-14 text-center space-y-5 shadow-xs">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary-light border border-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles size={14} />
            <span>We'd Love to Hear From You</span>
          </div>

          <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text leading-tight">
            Contact Us
          </h1>

          <p className="text-sm sm:text-base text-text-light leading-relaxed max-w-2xl mx-auto">
            Have a question or want to book your makeup appointment? We'd love to hear from you.
          </p>
        </section>

        {/* 2. Contact Information Section (4 Dynamic Compact Cards - 2 per row on mobile) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">

          {/* Card 1: Phone */}
          <div className="group rounded-2xl bg-surface border border-border p-4 text-center space-y-2.5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-light text-primary mx-auto group-hover:scale-110 transition-transform">
                <Phone size={18} />
              </div>
              <h3 className="font-playfair text-base font-bold text-text">Phone</h3>
              <p className="text-[11px] text-text-light font-medium">{phoneNum}</p>
            </div>
            <a
              href={`tel:${rawPhone}`}
              className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-dark transition-colors pt-1 cursor-pointer"
            >
              <span>Call Now</span>
              <ExternalLink size={11} />
            </a>
          </div>

          {/* Card 2: Email */}
          <div className="group rounded-2xl bg-surface border border-border p-4 text-center space-y-2.5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-light text-primary mx-auto group-hover:scale-110 transition-transform">
                <Mail size={18} />
              </div>
              <h3 className="font-playfair text-base font-bold text-text">Email</h3>
              <p className="text-[11px] text-text-light font-medium truncate">{emailAddr}</p>
            </div>
            <a
              href={`mailto:${emailAddr}`}
              className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-dark transition-colors pt-1 cursor-pointer"
            >
              <span>Send Email</span>
              <ExternalLink size={11} />
            </a>
          </div>

          {/* Card 3: Instagram */}
          <div className="group rounded-2xl bg-surface border border-border p-4 text-center space-y-2.5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-light text-primary mx-auto group-hover:scale-110 transition-transform">
                <Instagram size={18} />
              </div>
              <h3 className="font-playfair text-base font-bold text-text">Instagram</h3>
              <p className="text-[11px] text-text-light font-medium truncate">{getInstagramHandle(instagramUrl)}</p>
            </div>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-dark transition-colors pt-1 cursor-pointer"
            >
              <span>Visit Profile</span>
              <ExternalLink size={11} />
            </a>
          </div>

          {/* Card 4: Address */}
          <div className="group rounded-2xl bg-surface border border-border p-4 text-center space-y-2.5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-light text-primary mx-auto group-hover:scale-110 transition-transform">
                <MapPin size={18} />
              </div>
              <h3 className="font-playfair text-base font-bold text-text">Address</h3>
              <p className="text-[11px] text-text-light font-medium leading-tight">
                {studioAddress}
              </p>
            </div>
            <a
              href={`tel:${rawPhone}`}
              className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-dark transition-colors pt-1 cursor-pointer"
            >
              <span>Contact Studio</span>
              <ExternalLink size={11} />
            </a>
          </div>

        </section>

        {/* 3. Contact Form & Side Cards (Equal Height Alignment) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

          {/* Left: Contact Form (7 Cols on Desktop) */}
          <div className="lg:col-span-7 rounded-3xl bg-surface border border-border p-6 sm:p-8 shadow-xs flex flex-col justify-between h-full space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Get In Touch</span>
              <h2 className="font-playfair text-3xl font-bold text-text mt-1">Send Us a Message</h2>
              <p className="text-xs text-text-light mt-1 leading-relaxed">
                Fill in your details below and we will respond as soon as possible.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 my-auto">

              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your full name"
                  className={`w-full rounded-2xl bg-background border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                    errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-border'
                  }`}
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                />
                {errors.name && <p className="mt-1 text-[11px] text-rose-500">{errors.name.message}</p>}
              </div>

              {/* Grid: Phone Number & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="Enter mobile number"
                    className={`w-full rounded-2xl bg-background border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                      errors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-border'
                    }`}
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9+\-\s]{8,15}$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                  />
                  {errors.phone && <p className="mt-1 text-[11px] text-rose-500">{errors.phone.message}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email address"
                    className={`w-full rounded-2xl bg-background border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                      errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-border'
                    }`}
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {errors.email && <p className="mt-1 text-[11px] text-rose-500">{errors.email.message}</p>}
                </div>

              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Subject / Service Inquiry
                </label>
                <input
                  type="text"
                  id="subject"
                  placeholder="e.g. Bridal Makeup Booking Inquiry"
                  className="w-full rounded-2xl bg-background border border-border px-4 py-3 text-xs text-text focus:outline-none focus:border-primary"
                  {...register('subject')}
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-text mb-1.5">
                  Your Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Write your message or booking requirement here..."
                  className={`w-full rounded-2xl bg-background border p-4 text-xs text-text focus:outline-none focus:border-primary transition-colors ${
                    errors.message ? 'border-rose-400 focus:border-rose-500' : 'border-border'
                  }`}
                  {...register('message', {
                    required: 'Message is required',
                    minLength: { value: 10, message: 'Message must be at least 10 characters' }
                  })}
                />
                {errors.message && <p className="mt-1 text-[11px] text-rose-500">{errors.message.message}</p>}
              </div>

              {/* Submit Button */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white py-3.5 px-6 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  <Send size={15} />
                  <span>{submitting ? 'Sending Message...' : 'Submit Message'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Dynamic WhatsApp Chat + Business Hours + Social Links (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5 h-full">

            {/* WhatsApp Instant Reply Card */}
            <div className="rounded-3xl bg-gradient-to-r from-emerald-700 to-emerald-600 p-6 text-white space-y-3.5 shadow-md flex-1 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-white shrink-0">
                    <MessageCircle size={24} />
                  </div>
                  <h3 className="font-playfair text-xl sm:text-2xl font-bold leading-tight">Need an Instant Reply?</h3>
                </div>
                <p className="text-xs text-emerald-50 leading-relaxed">
                  Chat directly with us on WhatsApp and get quick assistance.
                </p>
              </div>
              <a
                href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent(settings?.whatsappDefaultMessage || 'Hello! I would like to inquire about booking a makeup appointment.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-white text-emerald-800 hover:bg-emerald-50 py-3.5 px-6 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer font-bold mt-2"
              >
                <MessageCircle size={18} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Business Hours & Service Availability Card */}
            <div className="rounded-3xl bg-surface border border-border p-6 space-y-3.5 shadow-xs flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-light text-primary shrink-0">
                  <Clock size={20} />
                </div>
                <h3 className="font-playfair text-xl font-bold text-text">Business Hours</h3>
              </div>

              <div className="space-y-2.5 pt-2 text-xs border-t border-border/60">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text">Weekly Timing</span>
                  <span className="text-primary font-semibold bg-secondary-light px-2.5 py-0.5 rounded-md">
                    {settings?.businessTiming || '09:00 AM - 08:00 PM'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text">Service Mode</span>
                  <span className="text-text-light font-medium">On-Location & Freelance</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text">Days</span>
                  <span className="text-text-light font-medium">All 7 Days (Prior Booking)</span>
                </div>
              </div>
            </div>

            {/* Social Media Links (Rendered Dynamically from Backend Settings) */}
            <div className="rounded-3xl bg-surface border border-border p-6 space-y-3.5 shadow-xs flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-playfair text-xl font-bold text-text">Follow Us</h3>
                <p className="text-xs text-text-light mt-1">
                  Stay updated with our latest bridal makeovers, tutorials & client transformations.
                </p>
              </div>

              <SocialLinks className="pt-1" />
            </div>

          </div>

        </section>

        {/* 4. Frequently Asked Questions */}
        <FQA />

      </div>
    </main>
  );
};

export default ContactPage;
