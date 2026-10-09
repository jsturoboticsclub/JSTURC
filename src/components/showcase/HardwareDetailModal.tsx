import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, ExternalLink, Play, Cpu, Layers, BookOpen, CheckCircle2, 
  ChevronRight, Share2, Wrench, Clock, Send, AlertCircle, Loader2
} from 'lucide-react';
import { HardwareShowcaseItem } from '../../data/hardwareShowcaseData';
import { Link } from 'react-router-dom';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { getStoredUser, getStoredToken } from '../../lib/auth';

interface HardwareDetailModalProps {
  item: HardwareShowcaseItem | null;
  onClose: () => void;
}

export const HardwareDetailModal: React.FC<HardwareDetailModalProps> = ({ item, onClose }) => {
  useBodyScrollLock(!!item);

  const [showVideo, setShowVideo] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanDuration, setLoanDuration] = useState(7);
  const [projectName, setProjectName] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loanStatus, setLoanStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!item) return null;

  const currentUser = getStoredUser();
  const token = getStoredToken();

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setLoanStatus(null);
    try {
      const res = await fetch('/api/hardware/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          hardware_id: item.id,
          hardware_title: item.title,
          requested_days: loanDuration,
          project_name: projectName,
          purpose: loanPurpose
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLoanStatus({ success: true, message: data.message || 'Loan request submitted! A lab manager will review shortly.' });
        setTimeout(() => {
          setShowLoanModal(false);
          setLoanStatus(null);
          setProjectName('');
          setLoanPurpose('');
        }, 3000);
      } else {
        setLoanStatus({ success: false, message: data.error || 'Failed to submit request' });
      }
    } catch (err: any) {
      setLoanStatus({ success: false, message: err.message || 'Network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item || typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fadeIn overflow-y-auto overscroll-contain"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      onClick={onClose}
    >
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
        <div className="overflow-y-auto overscroll-contain p-6 sm:p-8 space-y-8">
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

              {/* Equipment Loan Requisition Trigger */}
              <div className="pt-2">
                <button
                  onClick={() => setShowLoanModal(!showLoanModal)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Request to Borrow / Lab Loan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Loan Requisition Form */}
          {showLoanModal && (
            <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Wrench className="w-5 h-5" />
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider">Lab Equipment Loan Requisition</h3>
                </div>
                <button 
                  onClick={() => setShowLoanModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!currentUser ? (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                  <span>Sign in as a registered club member to request hardware borrowing.</span>
                  <Link to="/auth" className="font-bold underline ml-2">Sign In</Link>
                </div>
              ) : (
                <form onSubmit={handleLoanSubmit} className="space-y-4">
                  {loanStatus && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      loanStatus.success 
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300' 
                        : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-300'
                    }`}>
                      {loanStatus.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                      <span>{loanStatus.message}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-slate-600 dark:text-slate-400 font-bold mb-1">
                        Loan Duration
                      </label>
                      <select
                        value={loanDuration}
                        onChange={(e) => setLoanDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-emerald-500"
                      >
                        <option value={3}>3 Days (Quick Testing)</option>
                        <option value={7}>7 Days (Standard Sprint)</option>
                        <option value={14}>14 Days (Project Build)</option>
                        <option value={30}>30 Days (Capstone / Competition)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-slate-600 dark:text-slate-400 font-bold mb-1">
                        Project / Competition Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Jamalpur Autonomous Rover"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-600 dark:text-slate-400 font-bold mb-1">
                      Technical Justification & Purpose
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Explain how this equipment will be used in your robotics research..."
                      value={loanPurpose}
                      onChange={(e) => setLoanPurpose(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowLoanModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-mono text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Requisition</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

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
    </div>,
    document.body
  );
};
