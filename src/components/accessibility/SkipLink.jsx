import React from 'react';

export default function SkipLink({ targetId = "main-content" }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-white text-blue-600 px-4 py-2 rounded-lg shadow-lg font-semibold"
    >
      Skip to main content
    </a>
  );
}