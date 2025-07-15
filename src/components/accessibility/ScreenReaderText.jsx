import React from 'react';

export default function ScreenReaderText({ children, className = '' }) {
  return (
    <span className={`sr-only ${className}`}>
      {children}
    </span>
  );
}

export function SkipLink({ href = "#main-content", children = "Skip to main content" }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {children}
    </a>
  );
}

export function LiveRegion({ 
  children, 
  politeness = 'polite',
  atomic = false,
  className = '' 
}) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  );
}