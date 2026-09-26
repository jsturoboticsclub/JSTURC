import React from 'react';

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-shimmer rounded-xl bg-slate-200/80 dark:bg-slate-800/60 ${className}`} />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="animate-shimmer h-3.5 rounded-md bg-slate-200/80 dark:bg-slate-800/60"
        style={{ width: i === lines - 1 ? '60%' : '100%' }}
      />
    ))}
  </div>
);

export const SkeletonMemberCard: React.FC = () => (
  <div className="p-5 rounded-3xl bg-white/70 dark:bg-[#0D1424]/70 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
    <div className="flex items-center gap-3">
      <SkeletonBox className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5 min-w-0">
        <SkeletonBox className="h-4 w-3/4 rounded-md" />
        <SkeletonBox className="h-3 w-1/2 rounded-md" />
      </div>
    </div>
    <div className="space-y-2">
      <SkeletonBox className="h-3 w-full rounded-md" />
      <SkeletonBox className="h-3 w-5/6 rounded-md" />
    </div>
    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
      <SkeletonBox className="h-5 w-16 rounded-full" />
      <SkeletonBox className="h-5 w-20 rounded-full" />
    </div>
  </div>
);

export const SkeletonProjectCard: React.FC = () => (
  <div className="rounded-3xl overflow-hidden bg-white/70 dark:bg-[#0D1424]/70 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
    <SkeletonBox className="w-full h-48 rounded-none" />
    <div className="p-6 space-y-3 flex-1">
      <div className="flex items-center justify-between">
        <SkeletonBox className="h-5 w-24 rounded-full" />
        <SkeletonBox className="h-3 w-12 rounded-md" />
      </div>
      <SkeletonBox className="h-5 w-4/5 rounded-md" />
      <SkeletonText lines={2} />
    </div>
    <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-4 flex items-center justify-between">
      <SkeletonBox className="h-4 w-28 rounded-md" />
      <SkeletonBox className="h-7 w-20 rounded-xl" />
    </div>
  </div>
);

export const SkeletonHero: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 space-y-8 animate-pulse">
    <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
      <SkeletonBox className="h-6 w-48 rounded-full" />
      <SkeletonBox className="h-10 sm:h-14 w-full rounded-2xl" />
      <SkeletonBox className="h-5 w-3/4 rounded-xl" />
      <div className="flex gap-3 pt-4">
        <SkeletonBox className="h-11 w-36 rounded-xl" />
        <SkeletonBox className="h-11 w-36 rounded-xl" />
      </div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-2xl bg-white/60 dark:bg-[#0D1424]/60 border border-slate-200 dark:border-slate-800 space-y-2 text-center">
          <SkeletonBox className="h-7 w-16 mx-auto rounded-lg" />
          <SkeletonBox className="h-3 w-20 mx-auto rounded-md" />
        </div>
      ))}
    </div>
  </div>
);

export default {
  SkeletonBox,
  SkeletonText,
  SkeletonMemberCard,
  SkeletonProjectCard,
  SkeletonHero
};
