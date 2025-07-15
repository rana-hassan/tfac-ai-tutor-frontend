import React from 'react';
import { motion } from 'framer-motion';

const shimmer = {
  initial: { backgroundPosition: '-200px 0' },
  animate: { backgroundPosition: 'calc(200px + 100%) 0' },
  transition: {
    duration: 2,
    ease: 'linear',
    repeat: Infinity,
  }
};

export function SkeletonBox({ className = '', width = 'w-full', height = 'h-4' }) {
  return (
    <motion.div
      className={`${width} ${height} bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-md ${className}`}
      style={{ backgroundSize: '200px 100%' }}
      variants={shimmer}
      initial="initial"
      animate="animate"
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`p-6 bg-white rounded-lg border border-slate-200 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <SkeletonBox width="w-12" height="h-12" className="rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBox height="h-4" width="w-3/4" />
            <SkeletonBox height="h-3" width="w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <SkeletonBox height="h-3" />
          <SkeletonBox height="h-3" width="w-5/6" />
          <SkeletonBox height="h-3" width="w-4/6" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export function SkeletonChart({ className = '' }) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <SkeletonBox width="w-32" height="h-6" />
          <SkeletonBox width="w-20" height="h-8" />
        </div>
        <div className="h-64 flex items-end justify-between gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBox
              key={i}
              width="flex-1"
              height={`h-${Math.floor(Math.random() * 32) + 16}`}
              className="rounded-t-md"
            />
          ))}
        </div>
        <div className="flex justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBox key={i} width="w-8" height="h-3" />
          ))}
        </div>
      </div>
    </div>
  );
}