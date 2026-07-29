import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Award,
  ShieldCheck,
  Heart,
  Clock,
  Calendar,
  ArrowRight,
  Phone,
  Star,
  Smile,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import SEO from '../components/common/SEO';
import { useSettings } from '../context/SettingsContext';
import { getCertificates } from '../services/certificateApi';

const About = () => {
  const { settings } = useSettings();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Journey Milestones (Freelance & On-Location Services from 2025)
  const journeyMilestones = [
    {
      year: '2025 - Present',
      title: 'Freelance & On-Location Makeup Services',
      description: 'Providing professional freelance, venue, and on-location bridal, party, and occasion makeover services across Punjab & Himachal and outstation locations.'
    }
  ];

  // Why Choose Us Features (Simple & Clear English)
  const whyChooseUsFeatures = [
    {
      icon: Award,
      title: 'Professional Artist',
      description: 'Trained by top beauty academies with professional experience.'
    },
    {
      icon: Sparkles,
      title: 'Original Products',
      description: 'We use 100% original, high-quality products like MAC, NARS, Charlotte Tilbury & Huda Beauty.'
    },
    {
      icon: Heart,
      title: 'Personalized Look',
      description: 'Custom makeup looks designed to bring out your natural beauty.'
    },
    {
      icon: ShieldCheck,
      title: 'Clean & Hygienic',
      description: 'Cleaned and sanitized tools and brushes for every client.'
    },
    {
      icon: Clock,
      title: 'On-Time Service',
      description: 'Punctual and stress-free service delivered at your home or venue.'
    },
    {
      icon: Smile,
      title: 'Friendly Environment',
      description: 'Creating a comfortable and happy experience on your special day.'
    }
  ];

  // Fetch Certificates from Backend API
  const fetchCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCertificates();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading certificates on About page:', err);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const ownerName = settings?.ownerName || 'Ankita Sen';
  const designation = settings?.tagline || 'Lead Bridal & Party Makeup Artist';
  const experienceYears = settings?.yearsOfExperience || '8+';
  const happyClients = settings?.happyClientsCount || '500+';
  const completedMakeovers = settings?.completedMakeovers || '800+';
  const certificationsCount = settings?.certificationsCount || '15+';
  const shortIntro =
    settings?.shortDescription ||
    settings?.heroDescription ||
    'Professional makeup artist specializing in bridal, party, and occasion makeovers.';
  const fullStory =
    settings?.fullAboutDescription ||
    `I started my journey with a passion for bringing out natural beauty. Over the years, I have worked with hundreds of happy clients.

    I believe makeup should make you feel confident, radiant, and comfortable on your special day.`;
  const profileImage =
    settings?.aboutImage ||
    settings?.heroBannerImage ||
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop';

  return (
    <main className="min-h-screen bg-background text-text font-sans pb-16">
      <SEO
        title={`About ${ownerName} | Professional Makeup Artist`}
        description={`Read the story, experience, milestones, and professional certifications of ${ownerName}.`}
      />

      <div className="mx-auto max-w-[96%] px-4 sm:px-6 lg:px-8 space-y-14 sm:space-y-20 pt-6 sm:pt-10">

        {/* ====================================================== */}
        {/* 1. HERO SECTION */}
        {/* ====================================================== */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface via-secondary-light/30 to-surface border border-border p-6 sm:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left Text Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary-light border border-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles size={14} />
                <span>Professional Makeup Artist</span>
              </div>

              <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text leading-tight">
                Hi, I'm <span className="text-primary">{ownerName}</span>
              </h1>

              <p className="font-playfair text-lg sm:text-xl font-semibold text-text-light">
                {designation} with <span className="text-primary font-bold">{experienceYears} Years</span> of Experience.
              </p>

              <p className="text-xs sm:text-sm text-text-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {shortIntro}
              </p>

              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-8 py-3.5 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <Calendar size={16} />
                  <span>Book Appointment</span>
                </Link>
              </div>
            </div>

            {/* Right Owner Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative overflow-hidden rounded-3xl bg-background p-3 border border-border shadow-md w-full max-w-md group">
                <img
                  src={profileImage}
                  alt={ownerName}
                  loading="lazy"
                  className="h-[400px] w-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-surface/95 backdrop-blur-md p-4 border border-border shadow-sm text-center">
                  <span className="font-playfair text-base font-bold text-text">{ownerName}</span>
                  <p className="text-[11px] text-primary font-semibold uppercase tracking-wider">{designation}</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ====================================================== */}
        {/* 2. STORY SECTION */}
        {/* ====================================================== */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Behind The Canvas</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-text">My Story & Beauty Philosophy</h2>
          </div>

          <div className="rounded-3xl bg-surface border border-border p-6 sm:p-10 shadow-xs space-y-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-primary pb-2 border-b border-border">
              <Feather size={20} />
              <span className="font-playfair font-bold text-base text-text">Passionate Artistry</span>
            </div>

            <p className="text-sm sm:text-base text-text-light leading-relaxed whitespace-pre-line font-light">
              {fullStory}
            </p>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 3. EXPERIENCE & STATISTIC CARDS */}
        {/* ====================================================== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-3xl bg-surface border border-border text-center shadow-xs hover:-translate-y-1 transition-transform duration-300 space-y-2">
            <div className="flex justify-center text-primary">
              <Award size={26} />
            </div>
            <div className="font-playfair text-3xl sm:text-4xl font-black text-primary">
              {experienceYears}
            </div>
            <div className="text-xs font-semibold text-text uppercase tracking-wider">
              Years Experience
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-surface border border-border text-center shadow-xs hover:-translate-y-1 transition-transform duration-300 space-y-2">
            <div className="flex justify-center text-primary">
              <Smile size={26} />
            </div>
            <div className="font-playfair text-3xl sm:text-4xl font-black text-primary">
              {happyClients}
            </div>
            <div className="text-xs font-semibold text-text uppercase tracking-wider">
              Happy Clients
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-surface border border-border text-center shadow-xs hover:-translate-y-1 transition-transform duration-300 space-y-2">
            <div className="flex justify-center text-primary">
              <Heart size={26} />
            </div>
            <div className="font-playfair text-3xl sm:text-4xl font-black text-primary">
              {completedMakeovers}
            </div>
            <div className="text-xs font-semibold text-text uppercase tracking-wider">
              Bridal Makeovers
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-surface border border-border text-center shadow-xs hover:-translate-y-1 transition-transform duration-300 space-y-2">
            <div className="flex justify-center text-primary">
              <BookOpen size={26} />
            </div>
            <div className="font-playfair text-3xl sm:text-4xl font-black text-primary">
              {certificationsCount}
            </div>
            <div className="text-xs font-semibold text-text uppercase tracking-wider">
              Certifications
            </div>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 4. MAKEUP JOURNEY TIMELINE */}
        {/* ====================================================== */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Career Growth</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-text">Makeup Journey Timeline</h2>
            <p className="text-xs sm:text-sm text-text-light">Milestones that shaped our studio excellence over the years.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6 relative border-l-2 border-primary/40 pl-6 sm:pl-8 ml-4 sm:ml-auto">
            {journeyMilestones.map((item, idx) => (
              <div key={idx} className="relative space-y-2 group">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 h-4 w-4 rounded-full bg-primary border-4 border-background" />

                <div className="p-6 rounded-3xl bg-surface border border-border shadow-xs hover:border-primary/50 transition-colors">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary bg-secondary-light px-3 py-1 rounded-full border border-secondary">
                    {item.year}
                  </span>
                  <h3 className="font-playfair text-lg font-bold text-text mt-3">{item.title}</h3>
                  <p className="text-xs text-text-light leading-relaxed mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================== */}
        {/* 5. WHY CHOOSE US */}
        {/* ====================================================== */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Our Commitment</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-text">Why Choose Us</h2>
            <p className="text-xs sm:text-sm text-text-light">The core principles behind our studio experience.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUsFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-surface border border-border shadow-xs hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 space-y-3"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-light text-primary">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-playfair text-lg font-bold text-text">{feat.title}</h3>
                  <p className="text-xs text-text-light leading-relaxed font-light">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ====================================================== */}
        {/* 6. CERTIFICATIONS PREVIEW */}
        {/* ====================================================== */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Accreditations</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-text">Certifications Preview</h2>
            <p className="text-xs sm:text-sm text-text-light">Verified training credentials from leading beauty academies.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-3xl bg-surface border border-border p-5 space-y-4">
                  <div className="h-44 bg-border/60 rounded-2xl w-full" />
                  <div className="h-4 bg-border/60 rounded-full w-2/3" />
                  <div className="h-3 bg-border/40 rounded-full w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {certificates.map((cert, idx) => (
                <div
                  key={cert._id || cert.id || idx}
                  className="group p-5 rounded-3xl bg-surface border border-border shadow-xs hover:-translate-y-1.5 transition-all duration-300 space-y-4"
                >
                  <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-background">
                    <img
                      src={cert.imageUrl || cert.image || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=500&auto=format&fit=crop'}
                      alt={cert.title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {cert.badge && (
                      <span className="absolute top-3 right-3 rounded-full bg-secondary-light text-primary border border-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                        {cert.badge}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-text-light">
                      <span>{cert.institute}</span>
                      <span className="font-bold text-primary">{cert.year}</span>
                    </div>
                    <h3 className="font-playfair text-base font-bold text-text">{cert.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              to="/certificates"
              className="inline-flex items-center gap-2 rounded-full bg-surface border border-border hover:bg-secondary-light text-text px-8 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300"
            >
              <span>View All Certificates</span>
              <Award size={15} className="text-primary" />
            </Link>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 7. CTA SECTION */}
        {/* ====================================================== */}
        <section className="py-4">
          <div className="rounded-3xl bg-gradient-to-r from-background via-secondary-light/40 to-background p-8 sm:p-12 border border-border text-center space-y-5 max-w-4xl mx-auto shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Let's Connect</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-text">
              Ready For Your Dream Look?
            </h2>
            <p className="text-xs sm:text-sm text-text-light max-w-xl mx-auto leading-relaxed">
              Book your appointment today and let us make your special day even more beautiful.
            </p>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-8 py-3.5 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300"
              >
                <Calendar size={16} />
                <span>Book Appointment</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
};

export default About;
