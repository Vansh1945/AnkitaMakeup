import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import SocialLinks from '../common/SocialLinks';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();

  const phone = settings?.phone || '+91 98765 43210';
  const whatsapp = settings?.whatsapp || phone;
  const whatsappClean = whatsapp.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-[#18181b] text-gray-100 font-sans border-t border-white/10" aria-label="Site Footer">
      <div className="mx-auto max-w-[96%] px-4 sm:px-6 lg:px-8 py-10 sm:py-12">

        {/* Responsive Grid: Desktop (4 Columns), Tablet (2 Columns), Mobile (1 Column) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">

          {/* ====================================================== */}
          {/* 1. BRAND SECTION */}
          {/* ====================================================== */}
          <div className="space-y-3.5">
            <Link to="/" className="inline-block focus:outline-none">
              {settings?.logo ? (
                <img
                  src={settings.logo}
                  alt={settings?.websiteName || 'Ankita Makeup'}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="flex flex-col">
                  <span className="font-playfair text-xl sm:text-2xl font-bold tracking-widest text-white uppercase">
                    {settings?.websiteName || 'ANKITA MAKEUP'}
                  </span>
                  <span className="font-sans text-[10px] tracking-[0.25em] text-primary-light uppercase font-semibold">
                    {settings?.tagline || 'Professional Makeup & Hair'}
                  </span>
                </div>
              )}
            </Link>

            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-normal">
              {settings?.shortDescription ||
                settings?.footerText ||
                'Professional Makeup Artist — Making Your Special Day More Beautiful with elegant bridal, fashion, and party makeovers.'}
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-pink-200 bg-primary/20 border border-primary/40 px-3 py-1.5 rounded-full font-medium">
                <Sparkles size={13} className="text-amber-400 shrink-0" />
                <span>Certified Luxury Makeup Specialist</span>
              </span>
            </div>
          </div>

          {/* ====================================================== */}
          {/* 2. QUICK LINKS */}
          {/* ====================================================== */}
          <div className="space-y-3.5">
            <h3 className="font-playfair text-sm sm:text-base font-semibold tracking-wider text-white uppercase">
              Quick Links
            </h3>
            <nav aria-label="Footer Quick Links">
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:text-sm text-gray-300 font-normal">
                <li>
                  <Link to="/" className="hover:text-primary-light transition-colors inline-block py-0.5">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-primary-light transition-colors inline-block py-0.5">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-primary-light transition-colors inline-block py-0.5">
                    Services
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="hover:text-primary-light transition-colors inline-block py-0.5">
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link to="/certificates" className="hover:text-primary-light transition-colors inline-block py-0.5">
                    Certificates
                  </Link>
                </li>
                <li>
                  <Link to="/reviews" className="hover:text-primary-light transition-colors inline-block py-0.5">
                    Reviews
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary-light transition-colors inline-block py-0.5 font-medium text-pink-300">
                    Book Appointment
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary-light transition-colors inline-block py-0.5">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* ====================================================== */}
          {/* 3. CONTACT INFORMATION */}
          {/* ====================================================== */}
          <div className="space-y-3.5">
            <h3 className="font-playfair text-sm sm:text-base font-semibold tracking-wider text-white uppercase">
              Contact Info
            </h3>
            <address className="not-italic space-y-2.5 text-xs sm:text-sm text-gray-300 font-normal">
              <div className="flex items-start space-x-2.5">
                <MapPin size={15} className="text-primary-light shrink-0 mt-0.5" />
                <span>{settings?.address || settings?.businessAddress || 'Punjab , India'}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone size={15} className="text-primary-light shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-primary-light transition-colors">
                  {phone}
                </a>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail size={15} className="text-primary-light shrink-0" />
                <a href={`mailto:${settings?.email || 'ankitamakeup@gmail.com'}`} className="hover:text-primary-light transition-colors">
                  {settings?.email || 'ankitamakeup@gmail.com'}
                </a>
              </div>
              <div className="flex items-start space-x-2.5 pt-0.5">
                <Clock size={15} className="text-primary-light shrink-0 mt-0.5" />
                <span>{settings?.businessTiming || '09:00 AM - 06:00 PM'}</span>
              </div>
            </address>
          </div>

          {/* ====================================================== */}
          {/* 4. SOCIAL MEDIA & APPOINTMENT CTA */}
          {/* ====================================================== */}
          <div className="space-y-3.5">
            <h3 className="font-playfair text-sm sm:text-base font-semibold tracking-wider text-white uppercase">
              Connect With Us
            </h3>

            {/* Social Icons */}
            <SocialLinks variant="footer" iconSize={16} />

            {/* Appointment Action */}
            <div className="pt-1">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:scale-105"
              >
                <Calendar size={14} />
                <span>Book Appointment</span>
              </Link>
            </div>
          </div>

        </div>

        <hr className="my-6 border-white/10" />

        {/* ====================================================== */}
        {/* 5. COPYRIGHT BASE & CREATOR CREDIT */}
        {/* ====================================================== */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 space-y-3 sm:space-y-0 font-light">
          <p>
            © {currentYear} {settings?.websiteName || 'Ankita Makeup'}. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>
              Designed & Developed by{' '}
              <a
                href="https://vanshprofile.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-300 hover:text-white font-medium underline transition-colors"
              >
                Vansh
              </a>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
