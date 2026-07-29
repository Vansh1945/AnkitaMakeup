import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  ShieldCheck,
  Calendar,
  Sparkles,
  CheckCircle2,
  X,
  Maximize2,
  AlertCircle,
  RefreshCw,
  Clock,
  UserCheck,
  Heart,
  BookOpen,
  Phone
} from 'lucide-react';
import SEO from '../components/common/SEO';
import { getCertificates } from '../services/certificateApi';
import { useSettings } from '../context/SettingsContext';

const WHY_MATTER_POINTS = [
  {
    icon: Award,
    title: 'Professional Skills',
    description: 'Formally trained in color theory, skin anatomy, contouring, and advanced facial accentuation.'
  },
  {
    icon: ShieldCheck,
    title: 'Certified Training',
    description: 'Accredited by top national and international cosmetology institutions and beauty academies.'
  },
  {
    icon: Sparkles,
    title: 'Latest Beauty Techniques',
    description: 'Expertise in HD airbrush application, waterproof formulas, and modern long-lasting finishes.'
  },
  {
    icon: UserCheck,
    title: 'Trusted by Clients',
    description: 'Over 500+ satisfied clients and brides who rely on certified expertise for their special occasions.'
  },
  {
    icon: CheckCircle2,
    title: 'Maintain Hygiene Standards',
    description: 'Strict adherence to tool sterilization, sanitized palettes, and single-use disposable applicators.'
  },
  {
    icon: Clock,
    title: 'Modern Makeup Trends',
    description: 'Continuously updated skills through specialized workshops, masterclasses, and runway trends.'
  }
];

const Certificates = () => {
  const { settings } = useSettings();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  const fetchCertificatesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCertificates();
      setCertificates(data || []);
    } catch (err) {
      console.error('Failed to load certificates:', err);
      setError('Unable to load certifications at this moment. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificatesData();
  }, []);

  // Keyboard navigation & body scroll lock for Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedCert) {
        setSelectedCert(null);
      }
    };

    if (selectedCert) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedCert]);

  // Statistics values from backend database settings and dynamic certificates
  const totalCertsDisplay = certificates.length > 0 ? `${certificates.length}+` : (settings?.certificationsCount || '0');
  const workshopsDisplay = settings?.workshopsAttendedCount || (certificates.length > 0 ? `${certificates.length}+` : '0');
  const rawExperience = settings?.yearsOfExperience || '8+';
  const experienceDisplay = rawExperience.toLowerCase().includes('year') ? rawExperience : `${rawExperience} Years`;

  return (
    <main className="min-h-screen bg-background text-text font-sans pb-16">
      <SEO
        title="Professional Certifications | Makeup Artist"
        description="View all professional makeup certifications, beauty academy certificates and training achievements."
      />

      <div className="mx-auto max-w-[96%] px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-14 sm:space-y-20">

        {/* 1. Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary-light border border-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Award size={14} />
            <span>Certified Makeup Artist</span>
          </div>

          <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text leading-tight">
            Professional Certifications
          </h1>

          <p className="text-sm sm:text-base text-text-light leading-relaxed max-w-2xl mx-auto">
            Certified by recognized beauty academies and professional training institutes, ensuring quality, hygiene and modern makeup techniques.
          </p>
        </section>

        {/* 2. Statistics Section */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-border text-center shadow-xs space-y-1">
            <div className="flex justify-center text-primary mb-1">
              <Award size={24} />
            </div>
            <div className="font-playfair text-2xl sm:text-3xl font-extrabold text-text">
              {totalCertsDisplay}
            </div>
            <div className="text-xs font-medium text-text-light uppercase tracking-wider">
              Total Certifications
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border text-center shadow-xs space-y-1">
            <div className="flex justify-center text-primary mb-1">
              <BookOpen size={24} />
            </div>
            <div className="font-playfair text-2xl sm:text-3xl font-extrabold text-text">
              {workshopsDisplay}
            </div>
            <div className="text-xs font-medium text-text-light uppercase tracking-wider">
              Workshops Attended
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border text-center shadow-xs space-y-1">
            <div className="flex justify-center text-primary mb-1">
              <Clock size={24} />
            </div>
            <div className="font-playfair text-2xl sm:text-3xl font-extrabold text-text">
              {experienceDisplay}
            </div>
            <div className="text-xs font-medium text-text-light uppercase tracking-wider">
              Industry Experience
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border text-center shadow-xs space-y-1">
            <div className="flex justify-center text-primary mb-1">
              <ShieldCheck size={24} />
            </div>
            <div className="font-playfair text-2xl sm:text-3xl font-extrabold text-text">
              100%
            </div>
            <div className="text-xs font-medium text-text-light uppercase tracking-wider">
              Verified Accreditation
            </div>
          </div>
        </section>

        {/* 3. Certifications Grid & States */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Accreditations</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-text">Verified Qualifications</h2>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-3xl bg-surface border border-border overflow-hidden shadow-xs animate-pulse space-y-4 p-4"
                >
                  <div className="h-56 bg-border/60 rounded-2xl w-full" />
                  <div className="space-y-2 p-2">
                    <div className="h-4 bg-border/60 rounded w-1/3" />
                    <div className="h-6 bg-border/80 rounded w-3/4" />
                    <div className="h-3 bg-border/50 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="max-w-md mx-auto rounded-3xl bg-surface border border-border p-8 text-center space-y-4 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mx-auto">
                <AlertCircle size={24} />
              </div>
              <h3 className="font-playfair text-xl font-bold text-text">Failed to Load Certificates</h3>
              <p className="text-xs text-text-light leading-relaxed">{error}</p>
              <button
                onClick={fetchCertificatesData}
                className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-200"
                aria-label="Retry loading certificates"
              >
                <RefreshCw size={14} />
                <span>Retry Again</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && certificates.length === 0 && (
            <div className="max-w-md mx-auto rounded-3xl bg-surface border border-border p-10 text-center space-y-4 shadow-xs">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-light text-primary mx-auto">
                <Award size={28} />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-text">No Certifications Available</h3>
              <p className="text-xs text-text-light leading-relaxed">
                New qualifications and masterclass achievements will be published here soon.
              </p>
            </div>
          )}

          {/* Certifications Grid */}
          {!loading && !error && certificates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {certificates.map((cert) => (
                <article
                  key={cert._id || cert.id}
                  onClick={() => setSelectedCert(cert)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedCert(cert);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View certificate for ${cert.title}`}
                  className="group rounded-3xl bg-surface border border-border overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Certificate Image Container */}
                    <div className="relative h-60 w-full overflow-hidden bg-background">
                      <img
                        src={cert.certificateImage || cert.imageUrl || cert.image || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop'}
                        alt={cert.title || cert.certificateName || 'Certificate Image'}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Category Badge (Top Left) */}
                      {cert.category && (
                        <span className="absolute top-3 left-3 rounded-full bg-surface/90 backdrop-blur-md border border-border px-3 py-1 text-[11px] font-semibold text-text shadow-xs">
                          {cert.category}
                        </span>
                      )}

                      {/* Verified Badge (Top Right) */}
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-3 py-1 text-[11px] font-bold shadow-xs uppercase tracking-wider">
                        <CheckCircle2 size={12} />
                        <span>Verified Certificate</span>
                      </span>

                      {/* Hover Overlay Icon */}
                      <div className="absolute inset-0 bg-text/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-primary shadow-sm">
                          <Maximize2 size={18} />
                        </div>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs text-text-light font-medium">
                        <span className="font-semibold text-primary">{cert.institute}</span>
                        {(cert.issueDate || cert.year) && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{cert.issueDate ? new Date(cert.issueDate).getFullYear() : cert.year}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-playfair text-xl font-bold text-text group-hover:text-primary transition-colors duration-200">
                        {cert.title}
                      </h3>

                      {cert.description && (
                        <p className="text-xs text-text-light leading-relaxed line-clamp-3">
                          {cert.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: ID / Number if available */}
                  {(cert.certificateNumber || cert.certificateId) && (
                    <div className="px-6 pb-5 pt-2 border-t border-border/50 text-[11px] font-mono text-text-light flex items-center justify-between">
                      <span>ID: {cert.certificateNumber || cert.certificateId}</span>
                      <span className="text-primary font-bold">Official Seal</span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 4. Why Certifications Matter */}
        <section className="rounded-3xl bg-surface p-8 sm:p-12 border border-border shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Trust & Assurance</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-text">Why Certifications Matter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_MATTER_POINTS.map((point, idx) => {
              const Icon = point.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-background border border-border space-y-3 shadow-xs hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-light text-primary">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-playfair text-base font-bold text-text">{point.title}</h3>
                  <p className="text-xs text-text-light leading-relaxed">{point.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. CTA Section */}
        <section className="py-6 sm:py-8 bg-surface border-b border-border">
          <div className="mx-auto max-w-[96%] px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-r from-background via-secondary-light/40 to-background p-8 sm:p-12 border border-border text-center space-y-5 max-w-4xl mx-auto shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Book Certified Artistry</span>
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-text">
                Ready for Your Perfect Makeup Look?
              </h2>
              <p className="text-xs sm:text-sm text-text-light max-w-xl mx-auto leading-relaxed">
                Book your appointment today and experience certified professional makeup services.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-7 py-3.5 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300"
                >
                  <Calendar size={16} />
                  <span>Book Appointment</span>
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-surface border border-border hover:bg-secondary-light text-text px-7 py-3.5 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300"
                >
                  <Phone size={15} className="text-primary" />
                  <span>Contact Now</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* 6. Certificate Preview Modal */}
      {selectedCert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Preview of ${selectedCert.title}`}
          onClick={() => setSelectedCert(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-6 transition-opacity duration-300"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full rounded-3xl bg-surface border border-border overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6"
          >
            <button
              onClick={() => setSelectedCert(null)}
              aria-label="Close modal"
              className="absolute top-4 right-4 z-10 p-2.5 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full transition-all duration-200"
            >
              <X size={20} />
            </button>

            {/* Large Certificate Image */}
            <div className="relative max-h-[60vh] w-full overflow-hidden rounded-2xl bg-black/20 flex items-center justify-center">
              <img
                src={selectedCert.certificateImage || selectedCert.imageUrl || selectedCert.image || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop'}
                alt={selectedCert.title || selectedCert.certificateName || 'Certificate Image'}
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Certificate Details in Modal */}
            <div className="space-y-2 text-center pt-2">
              <div className="flex items-center justify-center gap-2">
                <span className="rounded-full bg-secondary-light border border-secondary px-3 py-1 text-[11px] font-semibold text-primary uppercase tracking-wider">
                  {selectedCert.institute}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                  <CheckCircle2 size={12} />
                  <span>Verified</span>
                </span>
              </div>

              <h2 className="font-playfair text-xl sm:text-2xl font-bold text-text">
                {selectedCert.title}
              </h2>

              {selectedCert.description && (
                <p className="text-xs text-text-light leading-relaxed max-w-lg mx-auto">
                  {selectedCert.description}
                </p>
              )}

              {(selectedCert.certificateNumber || selectedCert.certificateId) && (
                <p className="text-[11px] font-mono text-text-light pt-1">
                  Credential ID: {selectedCert.certificateNumber || selectedCert.certificateId}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Certificates;

