import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw,
  Star,
  RotateCcw
} from 'lucide-react';
import SEO from '../components/common/SEO';
import { getServices } from '../services/serviceApi';
import GalleryFilter from '../components/gallery/GalleryFilter';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Category Filter State
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchServicesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getServices();
      setServices(data || []);
    } catch (err) {
      console.error('Failed to load services:', err);
      setError('Unable to load services at this moment. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesData();
  }, []);

  // Filter services by selected category
  const filteredServices = useMemo(() => {
    if (selectedCategory === 'All') return services;
    return services.filter((service) => {
      const cat = (service.category || '').trim().toLowerCase();
      return cat === selectedCategory.trim().toLowerCase();
    });
  }, [services, selectedCategory]);

  return (
    <main className="min-h-screen bg-background text-text font-sans pb-16">
      <SEO
        title="Our Makeup Services | Luxury Makeup Studio"
        description="Discover our professional makeup services designed for every special occasion. Every service is professionally delivered using authentic premium products."
      />

      <div className="mx-auto max-w-[96%] px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-10 sm:space-y-14">

        {/* 1. Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary-light border border-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles size={14} />
            <span>Professional Beauty Artistry</span>
          </div>

          <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text leading-tight">
            Our Makeup Services
          </h1>

          <p className="text-sm sm:text-base text-text-light leading-relaxed max-w-2xl mx-auto">
            Discover our professional makeup services designed for every special occasion.
          </p>

          <div className="pt-2 flex justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-7 py-3 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300"
              aria-label="Book Appointment for makeup service"
            >
              <Calendar size={16} />
              <span>Book Appointment</span>
            </Link>
          </div>
        </section>

        {/* 2. Category Filter — using shared GalleryFilter component */}
        {!loading && !error && (
          <section className="max-w-5xl mx-auto">
            <GalleryFilter
              activeCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </section>
        )}

        {/* 3. Services Grid & Dynamic States */}
        <section className="space-y-6">

          {/* Loading Skeleton State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="rounded-3xl bg-surface border border-border overflow-hidden shadow-xs animate-pulse space-y-4 p-4"
                >
                  <div className="h-56 bg-border/60 rounded-2xl w-full" />
                  <div className="space-y-2 p-2">
                    <div className="h-4 bg-border/60 rounded w-1/3" />
                    <div className="h-6 bg-border/80 rounded w-3/4" />
                    <div className="h-3 bg-border/50 rounded w-full" />
                    <div className="h-3 bg-border/50 rounded w-2/3" />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border/60 p-2">
                    <div className="h-5 bg-border/80 rounded w-1/4" />
                    <div className="h-8 bg-border/80 rounded-full w-1/3" />
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
              <h3 className="font-playfair text-xl font-bold text-text">Unable to load services</h3>
              <p className="text-xs text-text-light leading-relaxed">Please try again later.</p>
              <button
                type="button"
                onClick={fetchServicesData}
                className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 cursor-pointer"
                aria-label="Retry loading services"
              >
                <RefreshCw size={14} />
                <span>Retry Again</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredServices.length === 0 && (
            <div className="max-w-md mx-auto rounded-3xl bg-surface border border-border p-10 text-center space-y-4 shadow-xs">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-light text-primary mx-auto">
                <Sparkles size={28} />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-text">No Services Available</h3>
              <p className="text-xs text-text-light leading-relaxed">
                {selectedCategory !== 'All'
                  ? `No services found in the "${selectedCategory}" category.`
                  : 'Please check back later.'}
              </p>
              {selectedCategory !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className="inline-flex items-center gap-2 rounded-full bg-surface border border-border hover:bg-secondary-light text-text px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Show All Services</span>
                </button>
              )}
            </div>
          )}

          {/* Services Grid */}
          {!loading && !error && filteredServices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredServices.map((service) => {
                const priceFormatted =
                  typeof service.price === 'number'
                    ? `₹${service.price.toLocaleString('en-IN')}`
                    : service.price
                    ? `₹${service.price.toString().replace(/^₹/, '')}`
                    : '';

                const rawCat = (service.category || '').trim();
                const matchedDbCat = categories.find(
                  (c) => c !== 'All' && (c.toLowerCase() === rawCat.toLowerCase() || c.toLowerCase().startsWith(rawCat.toLowerCase()))
                );
                const displayCategory = matchedDbCat || (rawCat ? rawCat.charAt(0).toUpperCase() + rawCat.slice(1) : '');

                return (
                  <article
                    key={service._id || service.id}
                    className="group rounded-3xl bg-surface border border-border overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Service Top Image Container */}
                      <div className="relative h-56 w-full overflow-hidden bg-background">
                        <img
                          src={
                            service.image ||
                            service.coverImage ||
                            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop'
                          }
                          alt={service.title || service.name || 'Makeup Service'}
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Category Badge (Top Left) */}
                        {displayCategory && (
                          <span className="absolute top-3 left-3 rounded-full bg-surface/90 backdrop-blur-md border border-border px-3 py-1 text-[11px] font-semibold text-text shadow-xs">
                            {displayCategory}
                          </span>
                        )}

                        {/* Featured Badge (Top Right) */}
                        {service.featured && (
                          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-primary text-white px-3 py-1 text-[11px] font-bold shadow-xs uppercase tracking-wider">
                            <Star size={11} className="fill-current" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>

                      {/* Card Content Body */}
                      <div className="p-6 space-y-3">
                        <h2 className="font-playfair text-xl font-bold text-text group-hover:text-primary transition-colors duration-200">
                          {service.title || service.name}
                        </h2>

                        <p className="text-xs text-text-light leading-relaxed line-clamp-3 font-light">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer: Price, Duration & Book Button */}
                    <div className="px-6 pb-6 pt-3 border-t border-border/60 flex items-center justify-between gap-4 mt-auto">
                      <div>
                        {priceFormatted && (
                          <div className="space-y-0.5">
                            <span className="block text-[10px] uppercase font-bold tracking-wider text-text-light">Starting Price</span>
                            <div className="font-playfair text-xl font-extrabold text-primary">
                              {priceFormatted}
                            </div>
                          </div>
                        )}
                        {service.duration && (
                          <div className="inline-flex items-center gap-1 text-[11px] text-text-light font-medium mt-1">
                            <Clock size={12} className="text-primary shrink-0" />
                            <span>Approx Duration: {service.duration}</span>
                          </div>
                        )}
                      </div>

                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-xs transition-colors duration-200"
                        aria-label={`Book appointment for ${service.title || service.name}`}
                      >
                        <Calendar size={14} />
                        <span>Book Now</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        </section>

      </div>
    </main>
  );
};

export default Services;
