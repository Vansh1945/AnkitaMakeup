import React from 'react';
import { motion } from 'framer-motion';

/**
 * Premium glassmorphism overlay loading screen
 */
const Loading = ({ fullScreen = false }) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-[#faf8f6]/80 backdrop-blur-sm'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        {/* Animated logo/ring */}
        <div className="relative w-16 h-16">
          <motion.span
            className="absolute inset-0 rounded-full border-4 border-primary-100 border-t-primary-500"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: 'linear',
            }}
          />
          <motion.span
            className="absolute inset-2 rounded-full border-4 border-gold-100 border-t-gold-500"
            animate={{ rotate: -360 }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
            }}
          />
        </div>
        
        {/* Styled text */}
        <motion.p
          className="mt-4 font-playfair text-lg italic text-dark-800 tracking-widest"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut',
          }}
        >
          Loading Elegance...
        </motion.p>
      </div>
    </div>
  );
};

export default Loading;
