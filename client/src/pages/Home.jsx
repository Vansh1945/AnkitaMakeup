import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Award,
  Heart,
  Star,
  Clock,
  Calendar,
  Smile,
  Phone,
  User,
  Image as ImageIcon,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import SEO from '../components/common/SEO';
import { useSettings } from '../context/SettingsContext';
import { getServices } from '../services/serviceApi';
import { getApprovedReviews } from '../services/reviewApi';
import api from '../services/api';

const Home = () => {
  const { settings } = useSettings();

  // Dynamic Data States
  const [featuredServices, setFeaturedServices] = useState([]);
  const [totalServicesCount, setTotalServicesCount] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);
  const [totalGalleryCount, setTotalGalleryCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch All Home Page Data Dynamically from Backend
  const fetchHomeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [servicesData, galleryData, reviewsData] = await Promise.allSettled([
        getServices(),
        api.get('/gallery'),
        getApprovedReviews()
      ]);

      // Services (Take count of all services, feature first 3)
      if (servicesData.status === 'fulfilled' && Array.isArray(servicesData.value)) {
        setTotalServicesCount(servicesData.value.length);
        setFeaturedServices(servicesData.value.slice(0, 3));
      } else {
        setTotalServicesCount(0);
        setFeaturedServices([]);
      }

      // Gallery (All backend gallery images)
      if (galleryData.status === 'fulfilled') {
        const res = galleryData.value;
        let list = [];
        if (Array.isArray(res)) list = res;
        else if (res && Array.isArray(res.data)) list = res.data;
        else if (res && Array.isArray(res.items)) list = res.items;
        else if (res && Array.isArray(res.gallery)) list = res.gallery;
        setTotalGalleryCount(list.length);
        setGalleryImages(list);
      } else {
        setGalleryImages([]);
      }

      // Reviews (Take first 3 approved)
      if (reviewsData.status === 'fulfilled' && Array.isArray(reviewsData.value)) {
        setReviews(reviewsData.value.slice(0, 3));
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Error fetching home page data:', err);
      setError('Unable to load some data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const ownerName = settings?.ownerName || 'Ankita Sen';
  const experienceYears = settings?.yearsOfExperience || '8+';
  const happyClients = settings?.happyClientsCount || '500+';
  const bridalMakeovers = settings?.bridalMakeoversCount || settings?.completedMakeovers || '10+';
  const certificationsCount = settings?.certificationsCount || '15+';
  const shortBio =
    settings?.heroDescription ||
    settings?.shortDescription ||
    'Professional Makeup Artist & Hairstylist specializing in royal bridal makeovers, high-definition airbrush makeup, and commercial fashion styling.';
  const heroTitle = settings?.heroTitle || 'Glow With Confidence';
  const heroSubtitle = settings?.heroSubtitle || 'Professional Bridal & Party Makeup Artist';
  const heroBannerImg =
    settings?.heroBannerImage ||
    settings?.aboutImage ||
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop';

  return (
    <main className="min-h-screen bg-background text-text font-sans pb-16">
      <SEO
        title={`${settings?.websiteName || 'Ankita Makeup'} | Professional Makeup Artist`}
        description={shortBio}
      />

      <div className="mx-auto max-w-[96%] px-4 sm:px-6 lg:px-8 space-y-14 sm:space-y-20 pt-6 sm:pt-10">

        {/* ====================================================== */}
        {/* 1. HERO SECTION */}
        {/* ====================================================== */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface via-secondary-light/30 to-surface border border-border p-6 sm:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary-light border border-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles size={14} />
                <span>Professional Makeup Artist</span>
              </div>

              <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text leading-tight">
                {heroTitle} <br />
                <span className="text-primary font-bold">{heroSubtitle}</span>
              </h1>

              <div className="space-y-2 max-w-2xl mx-auto lg:mx-0">
                <p className="text-sm sm:text-base text-text-light leading-relaxed">
                  {shortBio}
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-text pt-1">
                  <span className="inline-flex items-center gap-1.5 text-primary">
                    <CheckCircle size={14} />
                    <span>{ownerName}</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5 text-primary">
                    <Award size={14} />
                    <span>{experienceYears} Years Experience</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-7 py-3.5 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <Calendar size={16} />
                  <span>Book Appointment</span>
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-surface border border-border hover:bg-secondary-light text-text px-7 py-3.5 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <Phone size={15} className="text-primary" />
                  <span>Contact Now</span>
                </Link>
              </div>
            </div>

            {/* Right Professional Makeup Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative overflow-hidden rounded-3xl bg-background p-3 border border-border shadow-md w-full max-w-md group">
                <img
                  src={heroBannerImg}
                  alt={ownerName}
                  loading="lazy"
                  className="h-[420px] w-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-black/75 backdrop-blur-xl p-4 border border-white/20 shadow-xl text-center">
                  <span className="font-playfair text-lg font-bold text-white block tracking-wide drop-shadow-sm">{ownerName}</span>
                  <p className="text-[11px] text-pink-300 font-bold uppercase tracking-wider mt-0.5">Professional Makeup & Hair Duo</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ====================================================== */}
        {/* 2. STATISTICS SECTION */}
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
              {bridalMakeovers}
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
        {/* 3. FEATURED SERVICES PREVIEW */}
        {/* ====================================================== */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Signature Offerings</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-text">Featured Services</h2>
            <p className="text-xs sm:text-sm text-text-light">Handcrafted makeup and hairstyling packages using 100% authentic luxury cosmetics.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-3xl bg-surface border border-border p-5 space-y-4">
                  <div className="h-48 bg-border/60 rounded-2xl w-full" />
                  <div className="h-4 bg-border/60 rounded-full w-2/3" />
                  <div className="h-3 bg-border/40 rounded-full w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {featuredServices.map((service, idx) => (
                <div
                  key={service._id || service.id || idx}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-surface border border-border shadow-xs hover:-translate-y-2 hover:shadow-md transition-all duration-300"
                >
                  <div className="relative h-56 w-full overflow-hidden bg-background">
                    <img
                      src={service.image || service.coverImage || 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=800&auto=format&fit=crop'}
                      alt={service.name || service.title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {service.price && (
                      <span className="absolute top-4 right-4 rounded-full bg-surface/95 backdrop-blur-sm border border-secondary px-3.5 py-1 text-xs font-bold text-primary shadow-xs">
                        {service.price}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6 space-y-4">
                    <div className="space-y-2">
                      {service.duration && (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-light">
                          <Clock size={13} className="text-primary" />
                          <span>{service.duration}</span>
                        </div>
                      )}
                      <h3 className="font-playfair text-lg font-bold text-text leading-snug">
                        {service.name || service.title}
                      </h3>
                      <p className="text-xs text-text-light leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    </div>

                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-between w-full rounded-2xl bg-background hover:bg-secondary-light text-primary px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-colors duration-200"
                    >
                      <span>Book Now</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-8 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300"
            >
              <span>View All Services</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>


        {/* ====================================================== */}
        {/* 5. FEATURED GALLERY PREVIEW */}
        {/* ====================================================== */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Portfolio Showcase</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-text">Featured Gallery</h2>
            <p className="text-xs sm:text-sm text-text-light">A glimpse into recent bridal, engagement, and editorial transformations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((img, idx) => (
              <div
                key={img.id || img._id || idx}
                className="group relative h-72 overflow-hidden rounded-3xl bg-surface border border-border shadow-xs"
              >
                <img
                  src={img.imageUrl || img.image || img.url || 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600&auto=format&fit=crop'}
                  alt={img.title || 'Gallery Image'}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-text/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center text-white">
                  <span className="font-playfair text-base font-bold tracking-wider">{img.title || 'Makeover Look'}</span>
                  {img.category && (
                    <span className="text-[11px] uppercase tracking-widest text-secondary-light font-medium mt-1">{img.category}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-8 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300"
            >
              <span>Explore Full Portfolio</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 6. TESTIMONIALS PREVIEW */}
        {/* ====================================================== */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Customer Stories</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-text">Client Testimonials</h2>
            <p className="text-xs sm:text-sm text-text-light">Read genuine experiences shared by our brides and clients.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev, idx) => (
              <div
                key={rev._id || rev.id || idx}
                className="p-6 rounded-3xl bg-surface border border-border shadow-xs hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                        <Star key={i} size={15} className="fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                      Verified Client
                    </span>
                  </div>

                  <p className="text-xs text-text-light leading-relaxed italic border-l-2 border-primary/40 pl-3 py-1">
                    "{rev.comment || rev.review || rev.description}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                  <div className="h-10 w-10 rounded-full bg-secondary-light border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {(rev.name || rev.clientName || 'C')[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-playfair text-sm font-bold text-text">{rev.name || rev.clientName || 'Valued Client'}</h4>
                    <p className="text-[11px] text-primary font-medium">{rev.serviceName || rev.category || 'Makeup Booking'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              to="/reviews"
              className="inline-flex items-center gap-2 rounded-full bg-surface border border-border hover:bg-secondary-light text-text px-8 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300"
            >
              <span>Read All Reviews</span>
              <Star size={15} className="text-primary fill-primary" />
            </Link>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 7. CALL TO ACTION (SIMPLE BANNER) */}
        {/* ====================================================== */}
        <section className="py-4">
          <div className="rounded-3xl bg-gradient-to-r from-background via-secondary-light/40 to-background p-8 sm:p-12 border border-border text-center space-y-5 max-w-4xl mx-auto shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Reserve Your Date</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-text">
              Ready To Transform Your Look?
            </h2>
            <p className="text-xs sm:text-sm text-text-light max-w-xl mx-auto leading-relaxed">
              Book your makeup appointment today for bridal, engagement, or party glam. Limited slots available.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-8 py-3.5 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300"
              >
                <Calendar size={16} />
                <span>Book Appointment</span>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-surface border border-border hover:bg-secondary-light text-text px-8 py-3.5 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300"
              >
                <Phone size={15} className="text-primary" />
                <span>Contact Now</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
};

export default Home;
