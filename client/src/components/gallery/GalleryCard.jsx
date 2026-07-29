import React from 'react';
import { Star, Maximize2 } from 'lucide-react';

const GalleryCard = ({ item, onClick }) => {
  return (
    <article
      onClick={() => onClick(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(item);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View ${item.title} image in full view`}
      className="group rounded-3xl bg-surface border border-border overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Image Container */}
        <div className="relative h-64 w-full overflow-hidden bg-background">
          <img
            src={item.image || item.imageUrl || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop'}
            alt={item.title || 'Gallery makeover transformation'}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Category Badge (Top Left) */}
          {item.category && (
            <span className="absolute top-3 left-3 rounded-full bg-surface/90 backdrop-blur-md border border-border px-3 py-1 text-[11px] font-semibold text-text shadow-xs capitalize">
              {item.category
                .split(' ')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' ')}
            </span>
          )}

          {/* Featured Badge (Top Right) */}
          {item.featured && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-primary text-white px-3 py-1 text-[11px] font-bold shadow-xs uppercase tracking-wider">
              <Star size={11} className="fill-current" />
              <span>Featured</span>
            </span>
          )}

          {/* Hover Overlay Icon */}
          <div className="absolute inset-0 bg-text/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-primary shadow-sm">
              <Maximize2 size={18} />
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-2">
          <h3 className="font-playfair text-lg font-bold text-text group-hover:text-primary transition-colors duration-200">
            {item.title}
          </h3>

          {item.description && (
            <p className="text-xs text-text-light leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

export default GalleryCard;
