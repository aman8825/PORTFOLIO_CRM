import React from 'react';
import { motion } from 'framer-motion';

export const Skeleton = ({ className, ...props }) => {
  return (
    <motion.div
      className={`bg-slate-800/50 rounded-md overflow-hidden relative ${className}`}
      {...props}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-700/20 to-transparent"
        animate={{ translateX: ['-100%', '100%'] }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
};

export const SkeletonText = ({ lines = 1, className, gap = "gap-2" }) => {
  return (
    <div className={`flex flex-col ${gap}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 w-full ${i === lines - 1 && lines > 1 ? 'w-2/3' : ''} ${className}`} 
        />
      ))}
    </div>
  );
};

export const SkeletonAvatar = ({ size = "w-10 h-10", className }) => (
  <Skeleton className={`rounded-full ${size} ${className}`} />
);

export const SkeletonCard = ({ className }) => (
  <div className={`p-4 bg-surface rounded-xl border border-slate-700/50 flex flex-col gap-4 ${className}`}>
    <div className="flex items-center gap-3">
      <SkeletonAvatar size="w-12 h-12" />
      <SkeletonText lines={2} className="w-32 h-3" />
    </div>
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className }) => (
  <div className={`w-full bg-surface rounded-xl border border-slate-700/50 overflow-hidden ${className}`}>
    <div className="flex gap-4 p-4 border-b border-slate-700/50 bg-slate-800/20">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4 p-4 border-b border-slate-700/50 last:border-0">
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton key={c} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonStats = ({ count = 3, className }) => (
  <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-4 bg-surface rounded-xl border border-slate-700/50 flex flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-1/3 mt-2" />
      </div>
    ))}
  </div>
);

export const SkeletonList = ({ items = 3, className }) => (
  <div className={`flex flex-col gap-4 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3 bg-surface rounded-lg border border-slate-700/50">
        <SkeletonAvatar size="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);
