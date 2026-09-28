import React, { useState } from 'react';
import { X, ExternalLink, Play, BookOpen, Clock, User, CheckCircle2, Cpu, Wrench, ShieldCheck, Sparkles } from 'lucide-react';
import { TechSkillNode } from '../../data/curriculumData';

interface CourseDetailModalProps {
  course: TechSkillNode | null;
  onClose: () => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ course, onClose }) => {
  const [showVideo, setShowVideo] = useState(false);

  if (!course) return null;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Course · Open for Enrollment
          </span>
        );
      case 'upcoming':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Upcoming Launch · Next Cohort
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            Archived Syllabus · Self-Study
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Curriculum Course
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0A0F1D]/80">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {course.trackLabel}
            </span>
            {getStatusBadge(course.status)}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Close Course Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Title & Metadata Strip */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              {course.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {course.summary}
            </p>

            {/* Meta Row: Instructor, Duration, Level */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-500" />
                  Lead Instructor
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                  {course.instructor || 'JSTU Robotics Lead'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  Cohort Duration
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                  {course.duration || '4 Weeks'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  Proficiency Level
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono block mt-0.5">
                  {course.level}
                </span>
              </div>
            </div>
          </div>

          {/* Video Demonstration / Lecture if embed available */}
          {course.videoEmbedUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Play className="w-4 h-4 text-purple-500" />
                  Lecture & Lab Demonstration Preview
                </span>
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  {showVideo ? 'Hide Player' : 'Show Video'}
                </button>
              </div>

              {showVideo && (
                <div className="rounded-2xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-800 bg-slate-950">
                  <iframe
                    src={course.videoEmbedUrl}
                    title={course.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}

          {/* Section: Structured Syllabus & Study Modules */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-4 h-4" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                Comprehensive Syllabus & Learning Modules
              </h3>
            </div>

            {course.syllabus && course.syllabus.length > 0 ? (
              <div className="space-y-2">
                {course.syllabus.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3 hover:border-indigo-500/30 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {topic}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-mono italic">
                Syllabus modules are currently being refined by the club lead. Check back soon.
              </p>
            )}
          </div>

          {/* Section: Recommended Lab Hardware & Prerequisites */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {course.recommendedHardware && course.recommendedHardware.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Wrench className="w-3.5 h-3.5 text-amber-500" />
                  Recommended Lab Hardware
                </span>
                <ul className="space-y-1">
                  {course.recommendedHardware.map((hw, i) => (
                    <li key={i} className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {hw}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.skillsAcquired && course.skillsAcquired.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Key Skills You Acquire
                </span>
                <ul className="space-y-1">
                  {course.skillsAcquired.map((skill, i) => (
                    <li key={i} className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0A0F1D]/80 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-mono text-slate-500">
            JSTU Robotics Academy · Open Research Curriculum
          </span>

          <div className="flex items-center gap-3">
            {course.docUrl && (
              <a
                href={course.docUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Full Documentation</span>
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
