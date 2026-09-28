import React, { useState, useEffect } from 'react';
import { HardwareShowcaseItem, DEFAULT_HARDWARE_SHOWCASE } from '../../data/hardwareShowcaseData';
import { HardwareDetailModal } from './HardwareDetailModal';
import { Cpu, Layers, ExternalLink, Play, ChevronRight, ChevronLeft, Sparkles, BookOpen, Compass, Shield } from 'lucide-react';

export const HardwareShowcase: React.FC = () => {
  const [items, setItems] = useState<HardwareShowcaseItem[]>(DEFAULT_HARDWARE_SHOWCASE);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [inspectingItem, setInspectingItem] = useState<HardwareShowcaseItem | null>(null);

  useEffect(() => {
    fetch('/api/site-content')
      .then(res => res.json())
      .then(d => {
        if (d.data?.hardware_showcase?.meta?.items && Array.isArray(d.data.hardware_showcase.meta.items) && d.data.hardware_showcase.meta.items.length > 0) {
          setItems(d.data.hardware_showcase.meta.items);
        }
      })
      .catch(() => {
        // Fallback already set
      });
  }, []);

  const currentItem = items[selectedIndex] || items[0] || DEFAULT_HARDWARE_SHOWCASE[0];

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8 sm:my-12">
      {/* Top Cybernetic Nav Tabs for Switching Between Hardware Items */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 px-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
          <span className="text-xs font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
            ACTIVE LAB PROTOTYPES ({items.length})
          </span>
        </div>

        {/* Item Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {items.map((item, idx) => (
            <button
              key={item.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedIndex === idx
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-[#0D1424] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-indigo-600 dark:hover:text-white'
              }`}
            >
              <span>0{idx + 1}.</span>
              <span className="max-w-[140px] truncate">{item.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Hardware Card: Image Beside Component Details */}
      <div className="relative rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-2xl overflow-hidden transition-all duration-500">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-amber-500/10 blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
          {/* Left Column: Image with Floating Controls */}
          <div className="lg:col-span-6 relative group overflow-hidden bg-slate-950 flex items-center justify-center min-h-[320px] sm:min-h-[420px]">
            <img
              src={currentItem.imageUrl}
              alt={currentItem.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Glowing Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

            {/* Bottom Badges on Image */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-900/90 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                {currentItem.category}
              </span>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl backdrop-blur-md border border-slate-700/50">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Previous Hardware"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono font-bold px-1 text-slate-400">
                  {selectedIndex + 1}/{items.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Next Hardware"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Play Button Overlay if embed video exists */}
            {currentItem.embedUrl && (
              <button
                onClick={() => setInspectingItem(currentItem)}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-xl backdrop-blur-xs transform group-hover:scale-110 transition-all border-2 border-white/30 z-10"
                title="Play Video & Inspect"
              >
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </button>
            )}
          </div>

          {/* Right Column: Component Details, How it Works, and Links */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    JSTU LABS // SPECIFICATION
                  </span>
                  {currentItem.badge && (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {currentItem.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {currentItem.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {currentItem.summary}
                </p>
              </div>

              {/* How It Works Snippet */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-[#070B14] border border-indigo-100 dark:border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Cpu className="w-4 h-4" />
                  <span>How It Works & Autonomous Architecture</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans line-clamp-3">
                  {currentItem.howItWorks}
                </p>
              </div>

              {/* Component Details Matrix */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  Core Subsystems & Sensors
                </span>
                <div className="space-y-1.5">
                  {currentItem.components.slice(0, 4).map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800"
                    >
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 truncate mr-2">
                        {c.name}
                      </span>
                      <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                        {c.spec}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions: Inspect Specs + Documentation Link */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setInspectingItem(currentItem)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
              >
                <Layers className="w-4 h-4" />
                <span>Inspect Full Architecture & Specs</span>
              </button>

              {currentItem.docUrl && (
                <a
                  href={currentItem.docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                  title="Open Documentation & Code"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Learn Docs</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inspect Modal */}
      <HardwareDetailModal
        item={inspectingItem}
        onClose={() => setInspectingItem(null)}
      />
    </div>
  );
};
