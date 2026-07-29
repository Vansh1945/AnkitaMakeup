import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 3 }) => {
  const PulseItem = ({ className }) => (
    <div className={`animate-pulse bg-dark-100 rounded-2xl ${className}`} />
  );

  if (type === 'card') {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(count)].map((_, index) => (
          <div
            key={index}
            className="rounded-3xl bg-white border border-dark-100 p-6 flex flex-col justify-between h-96 shadow-sm overflow-hidden"
          >
            {/* Image Placeholder */}
            <PulseItem className="w-full aspect-[4/3] rounded-2xl mb-4" />
            
            {/* Category */}
            <PulseItem className="h-4 w-1/4 mb-3" />
            
            {/* Title */}
            <PulseItem className="h-6 w-2/3 mb-2" />
            
            {/* Description lines */}
            <div className="space-y-2 mb-6">
              <PulseItem className="h-3 w-full" />
              <PulseItem className="h-3 w-5/6" />
            </div>

            {/* Price Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-dark-50">
              <div className="space-y-1 w-1/3">
                <PulseItem className="h-2 w-1/2" />
                <PulseItem className="h-4 w-3/4" />
              </div>
              <PulseItem className="h-8 w-1/4 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, index) => (
          <div
            key={index}
            className="bg-white border border-dark-100 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-4 flex-grow">
              <PulseItem className="h-12 w-12 rounded-xl flex-shrink-0" />
              <div className="space-y-2 flex-grow">
                <PulseItem className="h-4 w-1/3" />
                <PulseItem className="h-3 w-1/2" />
              </div>
            </div>
            <PulseItem className="h-6 w-16 rounded-full" />
            <PulseItem className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="grid gap-10 lg:grid-cols-12 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-dark-100">
        <div className="lg:col-span-6 rounded-2xl overflow-hidden aspect-[4/3] md:aspect-square bg-dark-100 animate-pulse" />
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <PulseItem className="h-6 w-20 rounded-full" />
            <PulseItem className="h-10 w-3/4" />
            <PulseItem className="h-4 w-1/2" />
            <hr className="border-dark-100 my-4" />
            <div className="space-y-2">
              <PulseItem className="h-3 w-full" />
              <PulseItem className="h-3 w-full" />
              <PulseItem className="h-3 w-4/5" />
            </div>
          </div>
          <PulseItem className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
