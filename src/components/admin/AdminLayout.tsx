import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, LayoutDashboard, Sliders, Users, FileText,
  FolderGit2, Award, Bell, ChevronLeft, ChevronRight,
  LogOut, ExternalLink, Activity, Sparkles, Sun, Moon, Network, Cpu, Wrench, QrCode
} from 'lucide-react';
import { AdminConfirmModal } from './AdminConfirmModal';
import { CyberBadge } from '../common/CyberPrimitives';

export type AdminTab = 'superpower' | 'hardware' | 'loans' | 'checkins' | 'techtree' | 'content' | 'committees' | 'users' | 'projects' | 'roles' | 'announcements';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  currentUser: any;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  children,
}) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('/logo.jpg');
  const mainContentRef = useRef<HTMLElement>(null);

  // Automatically scroll main viewport to top on tab change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  useEffect(() => {
    fetch('/api/site-content')
      .then(r => r.json())
      .then(d => {
        if (d.data?.site_config?.meta?.branding?.image_url) {
          setLogoUrl(d.data.site_config.meta.branding.image_url);
        } else if (d.data?.branding?.meta?.image_url) {
          setLogoUrl(d.data.branding.meta.image_url);
        }
      })
      .catch(() => {});
  }, []);
  
  // White/Light Theme by Default for Admin Panel (with persistent toggle)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('jstu_admin_theme_mode');
      return saved === 'dark'; // Defaults to false (White/Light Theme)
    } catch {
      return false;
    }
  });

  const toggleAdminTheme = () => {
    const next = !isDark;
    setIsDark(next);
    try {
      localStorage.setItem('jstu_admin_theme_mode', next ? 'dark' : 'light');
    } catch {}
  };

  const menuItems = [
    { id: 'superpower' as AdminTab, label: 'Superpower Matrix', icon: <Sliders className="w-4 h-4" /> },
    { id: 'hardware' as AdminTab, label: 'Hardware Showcase', icon: <Cpu className="w-4 h-4" /> },
    { id: 'loans' as AdminTab, label: 'Equipment Loans', icon: <Wrench className="w-4 h-4" /> },
    { id: 'checkins' as AdminTab, label: 'Workshop Check-In', icon: <QrCode className="w-4 h-4" /> },
    { id: 'techtree' as AdminTab, label: 'Curriculum & Courses', icon: <Network className="w-4 h-4" /> },
    { id: 'content' as AdminTab, label: 'Landing CMS Passages', icon: <FileText className="w-4 h-4" /> },
    { id: 'users' as AdminTab, label: 'Member Directory', icon: <Users className="w-4 h-4" /> },
    { id: 'committees' as AdminTab, label: 'Committee Rosters', icon: <Award className="w-4 h-4" /> },
    { id: 'projects' as AdminTab, label: 'Project Moderation', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'roles' as AdminTab, label: 'Roles & Privileges', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'announcements' as AdminTab, label: 'Notices & Agendas', icon: <Bell className="w-4 h-4" /> },
  ];

  const handleConfirmLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('authUser');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
    } catch (e) {
      // ignore
    }
    setIsLogoutModalOpen(false);
    navigate('/');
    window.location.reload();
  };

  const currentLabel = menuItems.find((m) => m.id === activeTab)?.label || 'Dashboard';

  return (
    <div className={`h-screen flex flex-col font-sans transition-colors duration-200 overflow-hidden ${
      isDark ? 'dark bg-[#070B14] text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Top Command Bar - Fixed at top of viewport */}
      <header className={`h-16 flex-shrink-0 border-b px-4 sm:px-6 flex items-center justify-between z-40 backdrop-blur-md transition-colors ${
        isDark 
          ? 'bg-[#0D1424]/95 border-slate-800 text-white' 
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-xs flex-shrink-0">
              <img
                src={logoUrl}
                alt="JSTU Robotics Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpg';
                }}
              />
            </div>
            <span className={`font-mono font-bold text-sm tracking-wide hidden sm:inline ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              JSTU Robotics Admin
            </span>
          </Link>

          <ChevronRight className={`w-3.5 h-3.5 hidden sm:inline ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold hidden md:inline">
            {currentLabel}
          </span>

          {/* Quick Tab Selector for Mobile / Small Screens */}
          <div className="lg:hidden ml-1">
            <select
              value={activeTab}
              onChange={(e) => onTabChange(e.target.value as AdminTab)}
              className={`text-xs font-mono font-bold px-2 py-1 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-indigo-400' 
                  : 'bg-slate-100 border-slate-300 text-indigo-700'
              }`}
            >
              {menuItems.map(m => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right header controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleAdminTheme}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-indigo-700 border-slate-200 shadow-2xs'
            }`}
            title={isDark ? 'Switch to White Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden md:inline">Dark Theme</span>
              </>
            )}
          </button>

          {/* Cloud Sync Status */}
          <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono ${
            isDark 
              ? 'bg-slate-950 border-slate-800 text-slate-300' 
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SQLITE CLOUD · ONLINE</span>
          </div>

          {/* Live Site Link */}
          <Link
            to="/"
            target="_blank"
            className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors border ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Site</span>
          </Link>

          {/* User Profile & Guarded Logout */}
          <div className={`flex items-center gap-2 pl-2 border-l ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="text-right hidden sm:block">
              <p className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentUser?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                {currentUser?.role || 'Admin'}
              </p>
            </div>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              title="Sign Out of Admin Portal"
              className={`p-2 rounded-xl border transition-colors ${
                isDark 
                  ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-900 border-slate-800' 
                  : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-slate-200'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body with Fixed Viewport Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Fixed Pinned Sidebar - 100% viewport height, never scrolls away! */}
        <aside
          className={`h-full overflow-y-auto flex-shrink-0 z-30 transition-all duration-300 flex flex-col justify-between border-r ${
            isDark 
              ? 'bg-[#0D1424] border-slate-800' 
              : 'bg-white border-slate-200 shadow-xs'
          } ${
            isCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className="p-3 space-y-1.5">
            <div className="px-2 py-1 mb-2 hidden md:block">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {!isCollapsed ? 'Navigation' : 'Nav'}
              </span>
            </div>
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30'
                      : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Sidebar Collapse Toggle */}
          <div className={`p-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-mono flex items-center justify-center gap-2 transition-colors ${
                isDark 
                  ? 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              {!isCollapsed && <span>Collapse Sidebar</span>}
            </button>
          </div>
        </aside>

        {/* Content View Area: Scrolls independently while sidebar stays pinned */}
        <main
          ref={mainContentRef}
          className={`flex-1 h-full overflow-y-auto min-w-0 p-4 sm:p-8 transition-colors ${
            isDark ? 'bg-[#070B14] text-slate-100' : 'bg-slate-50 text-slate-900'
          }`}
        >
          {/* Sticky Horizontal Mobile Tab Bar for rapid navigation without scrolling to top */}
          <div className={`lg:hidden sticky -top-4 sm:-top-8 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 mb-6 z-20 border-b px-3 py-2.5 overflow-x-auto scrollbar-hide flex items-center gap-1.5 backdrop-blur-md transition-colors ${
            isDark ? 'bg-[#0D1424]/95 border-slate-800' : 'bg-white/95 border-slate-200 shadow-xs'
          }`}>
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm'
                      : isDark
                        ? 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
                        : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Guarded Logout Confirmation Modal */}
      <AdminConfirmModal
        isOpen={isLogoutModalOpen}
        title="Sign Out of Admin Portal"
        message="Are you sure you want to end your active administrative session? Unsaved form progress in active editors will be lost."
        variant="info"
        confirmLabel="Confirm Sign Out"
        cancelLabel="Stay in Admin"
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};
