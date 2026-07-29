import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const GalleryLightbox = ({
  item,
  onClose,
  onPrev,
  onNext,
  currentIndex,
  totalCount
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, onPrev, onNext]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} lightbox modal`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-6 transition-opacity duration-300 animate-fadeIn"
    >
      {/* Top Close Bar */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <span className="text-xs font-semibold text-white/70 bg-white/10 px-3 py-1.5 rounded-full">
          {currentIndex + 1} / {totalCount}
        </span>
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="p-2.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
        >
          <X size={22} />
        </button>
      </div>

      {/* Previous Button */}
      {totalCount > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous image"
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Modal Main Content Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center rounded-3xl bg-surface border border-border/20 overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6"
      >
        {/* Large Image */}
        <div className="relative max-h-[60vh] w-full overflow-hidden rounded-2xl bg-black/40 flex items-center justify-center">
          <img
            src={item.image || item.imageUrl || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop'}
            alt={item.title || 'Gallery makeover photo'}
            className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl"
          />
        </div>

        {/* Metadata Footer */}
        <div className="w-full text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            {item.category && (
              <span className="rounded-full bg-secondary-light border border-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                {item.category}
              </span>
            )}
            {item.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                <Star size={11} className="fill-current" />
                <span>Featured</span>
              </span>
            )}
          </div>

          <h2 className="font-playfair text-xl sm:text-2xl font-bold text-text">
            {item.title}
          </h2>

          {item.description && (
            <p className="text-xs text-text-light leading-relaxed max-w-xl mx-auto">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Next Button */}
      {totalCount > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next image"
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
};

export default GalleryLightbox;
