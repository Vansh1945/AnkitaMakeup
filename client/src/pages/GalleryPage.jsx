import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, AlertCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';
import SEO from '../components/common/SEO';
import GalleryFilter from '../components/gallery/GalleryFilter';
import GalleryCard from '../components/gallery/GalleryCard';
import GalleryLightbox from '../components/gallery/GalleryLightbox';
import SkeletonGallery from '../components/gallery/SkeletonGallery';
import { getGalleryItems } from '../services/galleryApi';

const GalleryPage = () => {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const fetchGalleryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGalleryItems();
      setAllItems(data);
    } catch (err) {
      console.error('Failed to load gallery items:', err);
      setError('Unable to load gallery creations at this moment. Please check back shortly.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, []);

  // Frontend filtering after fetching all data
  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return allItems;
    return allItems.filter(
      (item) => item.category && item.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [allItems, activeCategory]);

  const handleCardClick = (item) => {
    const index = filteredItems.findIndex((i) => (i._id || i.id) === (item._id || item.id));
    setLightboxIndex(index >= 0 ? index : 0);
  };

  const closeLightbox = () => setLightboxIndex(-1);

  const handlePrev = () => {
    setLightboxIndex((prev) => (prev <= 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setLightboxIndex((prev) => (prev >= filteredItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <main className="min-h-screen bg-background text-text font-sans pb-16">
      <SEO
        title="Gallery | Makeup Studio"
        description="Explore our latest bridal, engagement, party and professional makeup transformations by Ankita Sen."
      />

      <div className="mx-auto max-w-[96%] px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-10 sm:space-y-14">

        {/* 1. Hero Section & Breadcrumb */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-light">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-primary font-bold">Gallery</span>
          </nav>

          <div className="inline-flex items-center gap-2 rounded-full bg-secondary-light border border-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles size={14} />
            <span>Visual Portfolio</span>
          </div>

          <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text leading-tight">
            Gallery
          </h1>

          <p className="text-sm sm:text-base text-text-light leading-relaxed max-w-2xl mx-auto">
            Explore our latest bridal, engagement, party and professional makeup transformations.
          </p>
        </section>

        {/* 2. Category Filter */}
        <section>
          <GalleryFilter
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </section>

        {/* 3. Main Content: Loading / Error / Empty State / Responsive Grid */}
        <section className="space-y-6">

          {/* Loading Skeleton */}
          {loading && <SkeletonGallery count={8} />}

          {/* Error State */}
          {!loading && error && (
            <div className="max-w-md mx-auto rounded-3xl bg-surface border border-border p-8 text-center space-y-4 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mx-auto">
                <AlertCircle size={24} />
              </div>
              <h3 className="font-playfair text-xl font-bold text-text">Failed to Load Gallery</h3>
              <p className="text-xs text-text-light leading-relaxed">{error}</p>
              <button
                onClick={fetchGalleryData}
                className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-200"
                aria-label="Retry loading gallery"
              >
                <RefreshCw size={14} />
                <span>Retry Again</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredItems.length === 0 && (
            <div className="max-w-md mx-auto rounded-3xl bg-surface border border-border p-10 text-center space-y-4 shadow-xs">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-light text-primary mx-auto">
                <ImageIcon size={32} />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-text">No Gallery Available</h3>
              <p className="text-xs text-text-light leading-relaxed">
                New makeup work will appear here soon.
              </p>
              {activeCategory !== 'All' && (
                <button
                  onClick={() => setActiveCategory('All')}
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-sm hover:scale-105 transition-all duration-300"
                >
                  View All Creations
                </button>
              )}
            </div>
          )}

          {/* Gallery Grid (Desktop: 4 cols, Tablet: 2 cols, Mobile: 1 col) */}
          {!loading && !error && filteredItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <GalleryCard
                  key={item._id || item.id}
                  item={item}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          )}

        </section>

      </div>

      {/* 4. Lightbox Modal */}
      {lightboxIndex >= 0 && lightboxIndex < filteredItems.length && (
        <GalleryLightbox
          item={filteredItems[lightboxIndex]}
          onClose={closeLightbox}
          onPrev={handlePrev}
          onNext={handleNext}
          currentIndex={lightboxIndex}
          totalCount={filteredItems.length}
        />
      )}
    </main>
  );
};

export default GalleryPage;
