import React, { useState } from 'react';
import { X, ExternalLink, Play, Cpu, Layers, BookOpen, CheckCircle2, ShieldCheck, ChevronRight, Share2 } from 'lucide-react';
import { HardwareShowcaseItem } from '../../data/hardwareShowcaseData';

interface HardwareDetailModalProps {
  item: HardwareShowcaseItem | null;
  onClose: () => void;
}

export const HardwareDetailModal: React.FC<HardwareDetailModalProps> = ({ item, onClose }) => {
  const [showVideo, setShowVideo] = useState(false);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0A0F1D]/80">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {item.category}
            </span>
            {item.badge && (
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {item.badge}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Close Hardware Inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Main Visual Banner & Quick Spec Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-lg aspect-video flex items-center justify-center">
              {showVideo && item.embedUrl ? (
                <iframe
                  src={item.embedUrl}
                  title={item.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {item.embedUrl && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white flex items-center justify-center shadow-xl backdrop-blur-xs transform hover:scale-110 transition-all border-2 border-white/40"
                      title="Watch Demonstration Video"
                    >
                      <Play className="w-7 h-7 fill-white ml-1" />
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                {item.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.summary}
              </p>

              {/* Quick Metrics */}
              {item.specsQuick && item.specsQuick.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {item.specsQuick.map((sq, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                      <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">{sq.label}</span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">{sq.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section: How It Works & Architecture */}
          <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Cpu className="w-5 h-5" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider">Subsystem Architecture & How It Works</h3>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {item.howItWorks}
            </p>
          </div>

          {/* Section: Component Breakdown Table */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider">Integrated Hardware Components</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {item.components.map((comp, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/40 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                      {comp.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5 leading-snug">
                      {comp.spec}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Embedded Video Player if toggled */}
          {showVideo && item.embedUrl && (
            <div className="pt-2">
              <button
                onClick={() => setShowVideo(false)}
                className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
              >
                ← Return to high-resolution photo
              </button>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0A0F1D]/80 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-mono text-slate-500">
            JSTU Robotics Lab · Hardware Subsystems v2.4
          </span>

          <div className="flex items-center gap-3">
            {item.docUrl && (
              <a
                href={item.docUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>Open Documentation & Research</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
