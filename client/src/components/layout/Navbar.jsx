import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useBooking } from '../../context/BookingContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSettings();
  const { openBookingModal } = useBooking();

  // Navigation Links
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/portfolio' },
    { name: 'Certifications', path: '/certificates' },
    { name: 'Contact', path: '/contact' },
  ];

  // Helper to check active page
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-surface/95 backdrop-blur-md shadow-sm border-b border-border">
      <div className="mx-auto max-w-[96%] px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo (Left) */}
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt={settings?.websiteName || 'Makeup Studio'}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="flex flex-col">
                <span className="font-playfair text-xl font-bold tracking-wider text-text group-hover:text-primary transition-colors">
                  {settings?.websiteName || 'GLOW STUDIO'}
                </span>
                <span className="font-sans text-[10px] tracking-[0.2em] text-primary font-medium uppercase">
                  {settings?.tagline || 'Makeup & Beauty Studio'}
                </span>
              </div>
            )}
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative py-1 text-sm font-medium transition-colors duration-200 ${
                    active
                      ? 'text-primary font-semibold'
                      : 'text-text-light hover:text-primary'
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full transition-all" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side CTA Button (Desktop) */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={() => openBookingModal()}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium text-sm rounded-full px-5 py-2.5 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => openBookingModal()}
              className="bg-primary text-white font-medium text-xs rounded-full px-3.5 py-1.5 shadow-sm cursor-pointer"
            >
              Book
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-text-light hover:text-primary hover:bg-secondary-light transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden bg-surface border-b border-border px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-secondary-light text-primary font-semibold'
                      : 'text-text-light hover:bg-surface-muted hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border">
            <button
              onClick={() => {
                setIsOpen(false);
                openBookingModal();
              }}
              className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-white font-medium text-sm rounded-full py-3 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
