import React from 'react';

interface CyberBadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'emerald' | 'amber' | 'crimson';
  pulse?: boolean;
  className?: string;
}

export const CyberBadge: React.FC<CyberBadgeProps> = ({
  children,
  variant = 'cyan',
  pulse = false,
  className = '',
}) => {
  const variantStyles = {
    cyan: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/40 shadow-xs',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40 shadow-xs',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/40 shadow-xs',
    crimson: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/40 shadow-xs',
  };

  const dotStyles = {
    cyan: 'bg-indigo-500 dark:bg-indigo-400',
    emerald: 'bg-emerald-500 dark:bg-emerald-400',
    amber: 'bg-amber-500 dark:bg-amber-400',
    crimson: 'bg-rose-500 dark:bg-rose-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border shadow-xs backdrop-blur-md transition-colors ${variantStyles[variant]} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotStyles[variant]}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotStyles[variant]}`} />
      </span>
      {children}
    </span>
  );
};

interface HudCardProps {
  children: React.ReactNode;
  title?: string;
  badge?: string;
  variant?: 'default' | 'cyan' | 'emerald';
  className?: string;
  glow?: boolean;
}

export const HudCard: React.FC<HudCardProps> = ({
  children,
  title,
  badge,
  variant = 'default',
  className = '',
  glow = false,
}) => {
  const glowClass = glow ? 'hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300' : '';

  return (
    <div className={`rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] text-slate-900 dark:text-slate-100 shadow-sm ${glowClass} ${className}`}>
      {(title || badge) && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
          {title && (
            <h4 className="text-sm font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200 font-mono flex items-center gap-2">
              <span className="w-1.5 h-3 bg-indigo-600 dark:bg-indigo-400 rounded-sm inline-block" />
              {title}
            </h4>
          )}
          {badge && (
            <CyberBadge variant={variant === 'emerald' ? 'emerald' : 'cyan'}>
              {badge}
            </CyberBadge>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

interface GlitchHeaderProps {
  title: string;
  subtitle?: string;
  tag?: string;
  className?: string;
}

export const GlitchHeader: React.FC<GlitchHeaderProps> = ({
  title,
  subtitle,
  tag,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {tag && (
        <div className="flex items-center gap-2">
          <CyberBadge variant="cyan" pulse>
            {tag}
          </CyberBadge>
          <div className="h-px w-12 bg-gradient-to-r from-indigo-500/50 to-transparent" />
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-mono flex items-center gap-3">
        <span className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          {title}
        </span>
      </h2>
      {subtitle && (
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed font-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
};
