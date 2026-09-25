import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, Landmark, Layers, Users, ArrowLeft, Search, ShieldCheck } from 'lucide-react';
import JSTUHeader from '../components/JSTUHeader';

export const NotFoundPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Current session if logged in
  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      <JSTUHeader currentUser={currentUser} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Animated 404 Glitch & Radar Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse" />
            
            <div className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0D1424] border-2 border-indigo-500/30 dark:border-indigo-400/30 shadow-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Error 404 · Signal Lost</span>
              </div>

              <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-400 font-mono">
                404
              </h1>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Trajectory Coordinates Not Found
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed pt-1">
                The robotics rover could not pinpoint the telemetry at:
              </p>

              <div className="inline-block px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold border border-slate-200 dark:border-slate-800 break-all max-w-full">
                {location.pathname}
              </div>
            </div>
          </div>

          {/* Quick Safe Actions Grid */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select an Operational Vector
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/"
                className="p-4 rounded-2xl bg-white dark:bg-[#0D1424] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-left flex items-center gap-3.5 group transition-all shadow-sm hover:shadow-md"
              >
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Club Homepage
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Return to primary robotics base
                  </span>
                </div>
              </Link>

              <Link
                to="/committees"
                className="p-4 rounded-2xl bg-white dark:bg-[#0D1424] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-left flex items-center gap-3.5 group transition-all shadow-sm hover:shadow-md"
              >
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Committees Archive
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    All annual tenures & rosters
                  </span>
                </div>
              </Link>

              <Link
                to="/#projects"
                className="p-4 rounded-2xl bg-white dark:bg-[#0D1424] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-left flex items-center gap-3.5 group transition-all shadow-sm hover:shadow-md"
              >
                <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    Robotics Projects
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Explore terrestrial & aerial bots
                  </span>
                </div>
              </Link>

              <Link
                to="/#directory"
                className="p-4 rounded-2xl bg-white dark:bg-[#0D1424] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-left flex items-center gap-3.5 group transition-all shadow-sm hover:shadow-md"
              >
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Member Directory
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Faculty, leads & researchers
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Back button */}
          <div className="pt-2">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back to Previous Page</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;
