import React from 'react';

const SkeletonGallery = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl bg-surface border border-border overflow-hidden shadow-xs animate-pulse p-4 space-y-4"
        >
          <div className="h-64 bg-border/60 rounded-2xl w-full" />
          <div className="space-y-2 p-1">
            <div className="h-5 bg-border/80 rounded w-2/3" />
            <div className="h-3 bg-border/50 rounded w-full" />
            <div className="h-3 bg-border/50 rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonGallery;
