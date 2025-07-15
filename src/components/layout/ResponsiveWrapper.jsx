import React from 'react';
import { motion } from 'framer-motion';

export default function ResponsiveWrapper({ 
  children, 
  maxWidth = '7xl',
  padding = 'p-4 sm:p-6 lg:p-8',
  className = '' 
}) {
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  };

  return (
    <div className={`min-h-screen bg-slate-50 ${padding}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto ${className}`}>
        {children}
      </div>
    </div>
  );
}

export function ResponsiveGrid({ 
  children, 
  cols = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = 'gap-4 sm:gap-6',
  className = '' 
}) {
  const gridCols = `grid-cols-${cols.default} sm:grid-cols-${cols.sm} lg:grid-cols-${cols.lg} xl:grid-cols-${cols.xl}`;
  
  return (
    <div className={`grid ${gridCols} ${gap} ${className}`}>
      {children}
    </div>
  );
}

export function ResponsiveCard({ 
  children, 
  hover = true,
  className = '' 
}) {
  return (
    <motion.div
      className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}
      whileHover={hover ? { y: -2, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}