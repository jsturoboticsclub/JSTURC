import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Cpu, ShieldCheck, LogIn, LogOut, Menu, X, 
  ArrowRight, LayoutDashboard, Sun, Moon, Sparkles, Layers, ChevronRight 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface JSTUHeaderProps {
  currentUser?: any;
  onLogout?: () => void;
  branding?: {
    title?: string;
    badge?: string;
    subtitle?: string;
    image_url?: string;
  };
}

export const JSTUHeader: React.FC<JSTUHeaderProps> = ({ currentUser, onLogout, branding }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [siteBranding, setSiteBranding] = useState(branding || {
    title: 'JSTU Robotics Club',
    badge: 'BOTS & BEYOND',
    subtitle: 'Jamalpur Science & Technology University',
    image_url: '/logo.jpg'
  });

  useEffect(() => {
    if (branding) {
      setSiteBranding(branding);
    } else {
      fetch('/api/site-content')
        .then(r => r.json())
        .then(d => {
          if (d.data?.site_config?.meta?.branding) {
            setSiteBranding(d.data.site_config.meta.branding);
          }
        })
        .catch(() => {});
    }
  }, [branding]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authUser');
    if (onLogout) onLogout();
    navigate('/');
    window.location.reload();
  };

  const [activeSection, setActiveSection] = useState<string>('home');

  useEffect(() => {
    const updateActive = () => {
      if (location.pathname.startsWith('/committees')) {
        setActiveSection('committees');
        return;
      }
      if (location.pathname !== '/') {
        setActiveSection('');
        return;
      }
      const hash = window.location.hash;
      if (hash === '#agenda') setActiveSection('agenda');
      else if (hash === '#projects') setActiveSection('projects');
      else if (hash === '#directory') setActiveSection('directory');
      else if (hash === '#join') setActiveSection('join');
      else {
        const scrollY = window.scrollY;
        if (scrollY < 200) {
          setActiveSection('home');
        }
      }
    };

    updateActive();
    window.addEventListener('hashchange', updateActive);

    const handleScroll = () => {
      if (location.pathname !== '/') return;
      const scrollY = window.scrollY;
      if (scrollY < 200) {
        setActiveSection('home');
        return;
      }
      const sections = [
        { id: 'directory', name: 'directory' },
        { id: 'projects', name: 'projects' },
        { id: 'agenda', name: 'agenda' },
      ];
      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop - 160;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sec.name);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('hashchange', updateActive);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  const navLinks = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'agenda', label: 'About & Agenda', href: '/#agenda' },
    { id: 'projects', label: 'Projects', href: '/#projects' },
    { id: 'committees', label: 'Committees', href: '/committees' },
    { id: 'directory', label: 'Member Directory', href: '/#directory' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#080C16]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300 shadow-xs dark:shadow-md dark:shadow-indigo-950/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 lg:gap-4">
          
          {/* Brand Logo & Name (Admin Configurable) */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 pr-1 lg:pr-2 flex-shrink-0">
            <img
              src={siteBranding.image_url || '/logo.jpg'}
              alt="JSTU Robotics Club Official Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl object-cover shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-all duration-300 border-2 border-indigo-500/40 dark:border-indigo-400/30 flex-shrink-0 bg-white"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.jpg';
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-sm sm:text-base xl:text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                  {siteBranding.title || 'JSTU Robotics'}
                </span>
                <span className="hidden 2xl:inline-flex px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-xs flex-shrink-0">
                  {siteBranding.badge || 'Club'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden 2xl:block truncate max-w-xs">
                {siteBranding.subtitle || 'Jamalpur Science & Technology University'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 xl:p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex-shrink-0">
            {navLinks.map((link) => {
              const isSelected = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setActiveSection(link.id)}
                  className={`h-8 xl:h-9 px-2.5 xl:px-3.5 rounded-xl text-xs xl:text-[13px] font-bold whitespace-nowrap flex items-center justify-center gap-1.5 transition-all duration-200 ease-out select-none ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-indigo-500/30 scale-100'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60 hover:scale-105 active:scale-95 border border-transparent'
                  }`}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse flex-shrink-0" />
                  )}
                  {link.id === 'directory' ? (
                    <span>
                      <span className="hidden xl:inline">Member </span>Directory
                    </span>
                  ) : (
                    <span>{link.label}</span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Actions & Theme Switcher (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 flex-shrink-0">
            {/* Theme Toggle Button - Sleek icon-only toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-amber-300 border border-slate-200/80 dark:border-slate-700/80 transition-all duration-200 text-xs font-bold shadow-xs hover:scale-105 active:scale-95 flex items-center justify-center flex-shrink-0"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle public theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-1.5 xl:gap-2">
                {currentUser.role === 'Admin' && (
                  <Link
                    to="/admin"
                    className="h-8 xl:h-9 flex items-center justify-center gap-1.5 px-2.5 xl:px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-black hover:bg-amber-500/25 hover:scale-105 active:scale-95 transition-all shadow-xs whitespace-nowrap"
                    title="Access Admin CMS"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <span>Admin CMS</span>
                  </Link>
                )}

                <Link
                  to="/dashboard"
                  className="h-8 xl:h-9 flex items-center justify-center gap-1.5 px-2.5 xl:px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:scale-105 active:scale-95 transition-all shadow-xs whitespace-nowrap"
                  title="Member Dashboard"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <span>Dashboard</span>
                </Link>

                <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-800">
                  <img
                    src={currentUser.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
                    alt={currentUser.name}
                    className="w-7 h-7 xl:w-8 xl:h-8 rounded-full border-2 border-indigo-500/40 object-cover shadow-xs"
                  />
                  <div className="text-left hidden 2xl:block">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[90px]">{currentUser.name}</p>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold uppercase">{currentUser.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 hover:scale-110 active:scale-90 transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 xl:gap-2">
                <Link
                  to="/auth"
                  className="h-8 xl:h-9 px-3 xl:px-3.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/90 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap hover:scale-105 active:scale-95 shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <span>Sign In</span>
                </Link>

                <a
                  href="/#join"
                  className="h-8 xl:h-9 px-3.5 xl:px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap group"
                >
                  <span>Apply to Join</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Mobile Actions Bar */}
          <div className="flex lg:hidden items-center gap-1.5">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700 active:scale-95 transition-transform"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 active:scale-95 transition-transform"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden relative z-50 bg-white dark:bg-[#080C16] border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          
          {/* User Status Card (Mobile Drawer Header) */}
          {currentUser && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={currentUser.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/40 shadow-xs flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0 ${
                currentUser.role === 'Admin'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
              }`}>
                {currentUser.role}
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isSelected = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => {
                    setActiveSection(link.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />}
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                </a>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            {/* Mobile Theme Toggle Row */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Theme Appearance</span>
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs border border-slate-200 dark:border-slate-600"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>

            {currentUser ? (
              <div className="space-y-2 pt-1">
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold text-sm border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                    <span>Member Dashboard</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                {currentUser.role === 'Admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-800 dark:text-amber-300 font-black text-sm border border-amber-500/30 shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Admin Supermode CMS</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-sm text-left border border-transparent hover:border-red-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Sign In to Portal
                </Link>
                <a
                  href="/#join"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white font-bold text-sm shadow-md shadow-indigo-500/25"
                >
                  Apply for Membership
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default JSTUHeader;
