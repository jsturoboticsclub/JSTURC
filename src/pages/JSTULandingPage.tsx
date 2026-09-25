import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, Zap, Compass, Users, ChevronRight, Award, 
  ExternalLink, Search, CheckCircle2, ShieldCheck, 
  ArrowRight, Sparkles, Terminal, Calendar, Layers, Github,
  Settings, Sliders, ToggleLeft, ToggleRight, Edit3, X, Save, Plus,
  SlidersHorizontal, Check, Eye, EyeOff, Layout
} from 'lucide-react';
import JSTUHeader from '../components/JSTUHeader';

export const JSTULandingPage: React.FC = () => {
  const [siteContent, setSiteContent] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [currentCommittee, setCurrentCommittee] = useState<any>(null);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Directory filter & search
  const [selectedRole, setSelectedRole] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Project category filter
  const [selectedProjectCategory, setSelectedProjectCategory] = useState('All');

  // Join form state
  const [joinForm, setJoinForm] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Computer Science & Engineering',
    student_id: '',
    skills: '',
    bio: ''
  });
  const [joinStatus, setJoinStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current logged in user (if any)
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Admin In-Page Superpower Quick Drawer State
  const [isSuperDrawerOpen, setIsSuperDrawerOpen] = useState(false);
  const [superConfig, setSuperConfig] = useState<any>({
    branding: {
      title: 'JSTU Robotics Club',
      badge: 'BOTS & BEYOND',
      subtitle: 'Jamalpur Science and Technology University',
      image_url: ''
    },
    footer: {
      title: 'Jamalpur Science and Technology University Robotics Club',
      description: 'Official robotics and intelligent automation research club at JSTU.',
      copyright: '© 2026 JSTU Robotics Club · Powered by SQLite Relational Core'
    },
    hero_cta_primary: { text: 'Apply for Membership', link: '#join', show: true },
    hero_cta_secondary: { text: 'Explore Active Bots', link: '#projects', show: true },
    hero_cta_tertiary: { text: 'Member Directory', link: '#directory', show: true },
    sections: {
      agenda: { title: 'Club Agenda & Research Pillars', subtitle: 'Strategic Blueprint', show: true },
      projects: { title: 'Featured Robotics Projects', subtitle: 'Engineering Feats', show: true },
      directory: { title: 'Committee & Member Directory', subtitle: 'Team & Community', show: true },
      join: { title: 'Join the JSTU Robotics Club', subtitle: 'Recruitment 2026', show: true }
    },
    milestones_header: {
      title: 'Upcoming Club Milestones',
      subtitle: 'Scheduled field trials, workshops, and competitions'
    },
    project_categories: ['All', 'Autonomous Terrestrial', 'Aerial Robotics', 'Biomimetic Walking Robots', 'Competitive Robotics'],
    directory_categories: ['All', 'Executive', 'Leads']
  });
  const [newProjectCategory, setNewProjectCategory] = useState('');
  const [newDirCategory, setNewDirCategory] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contentRes, membersRes, projectsRes, agendaRes, rolesRes, committeesRes] = await Promise.all([
        fetch('/api/site-content').then(r => r.json()),
        fetch('/api/members').then(r => r.json()),
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/agenda').then(r => r.json()),
        fetch('/api/roles').then(r => r.json()),
        fetch('/api/committees').then(r => r.json()).catch(() => ({ success: false, data: [] }))
      ]);

      if (contentRes.success) {
        setSiteContent(contentRes.data);
        if (contentRes.data.site_config?.meta) {
          setSuperConfig((prev: any) => ({
            ...prev,
            ...contentRes.data.site_config.meta,
            branding: contentRes.data.site_config.meta.branding || contentRes.data.branding?.meta || prev.branding,
            footer: contentRes.data.site_config.meta.footer || prev.footer,
            milestones_header: {
              title: contentRes.data.milestones_header?.content || contentRes.data.site_config.meta.milestones_header?.title || prev.milestones_header?.title || 'Upcoming Club Milestones',
              subtitle: contentRes.data.milestones_header?.meta?.subtitle || contentRes.data.site_config.meta.milestones_header?.subtitle || prev.milestones_header?.subtitle || 'Scheduled field trials, workshops, and competitions'
            }
          }));
        } else if (contentRes.data.milestones_header) {
          setSuperConfig((prev: any) => ({
            ...prev,
            milestones_header: {
              title: contentRes.data.milestones_header.content || 'Upcoming Club Milestones',
              subtitle: contentRes.data.milestones_header.meta?.subtitle || 'Scheduled field trials, workshops, and competitions'
            }
          }));
        }
      }
      if (membersRes.success) setMembers(membersRes.data);
      if (projectsRes.success) setProjects(projectsRes.data);
      if (agendaRes.success) setAgenda(agendaRes.data);
      if (rolesRes.success) setRoles(rolesRes.data);
      if (committeesRes && committeesRes.success && committeesRes.data.length > 0) {
        setCommittees(committeesRes.data);
        const active = committeesRes.data.find((c: any) => c.is_current === 1) || committeesRes.data[0];
        if (active) {
          setCurrentCommittee(active);
          setSelectedCommitteeId(active.id);
        }
      }
    } catch (err) {
      console.error('Failed to load JSTU data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleSaveSuperConfigLive = async () => {
    setSavingConfig(true);
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ config: superConfig })
      });
      const data = await res.json();
      if (res.ok) {
        if (superConfig.branding) {
          await fetch('/api/admin/site-content', {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({
              key: 'branding',
              title: superConfig.branding.title || 'JSTU Robotics Club',
              content: superConfig.branding.subtitle || 'Jamalpur Science and Technology University',
              meta: superConfig.branding
            })
          });
        }
        if (superConfig.milestones_header) {
          await fetch('/api/admin/site-content', {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({
              key: 'milestones_header',
              title: 'Upcoming Club Milestones',
              content: superConfig.milestones_header.title || 'Upcoming Club Milestones',
              meta: { subtitle: superConfig.milestones_header.subtitle || 'Scheduled field trials, workshops, and competitions' }
            })
          });
        }
        setToastMessage('👑 Superpower configuration saved live!');
        // Update local siteContent so page re-renders instantly
        setSiteContent((prev: any) => ({
          ...prev,
          site_config: {
            ...prev?.site_config,
            meta: superConfig
          },
          branding: {
            ...prev?.branding,
            meta: superConfig.branding
          },
          milestones_header: {
            ...prev?.milestones_header,
            content: superConfig.milestones_header?.title || 'Upcoming Club Milestones',
            meta: { subtitle: superConfig.milestones_header?.subtitle || 'Scheduled field trials, workshops, and competitions' }
          }
        }));
        setTimeout(() => setToastMessage(null), 3500);
      } else {
        alert(data.error || 'Failed to save configuration');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleAddProjectCat = () => {
    if (!newProjectCategory.trim()) return;
    const cat = newProjectCategory.trim();
    if (superConfig.project_categories?.includes(cat)) return;
    setSuperConfig({
      ...superConfig,
      project_categories: [...(superConfig.project_categories || []), cat]
    });
    setNewProjectCategory('');
  };

  const handleRemoveProjectCat = (cat: string) => {
    if (cat === 'All') return;
    setSuperConfig({
      ...superConfig,
      project_categories: superConfig.project_categories.filter((c: string) => c !== cat)
    });
  };

  const handleAddDirCat = () => {
    if (!newDirCategory.trim()) return;
    const cat = newDirCategory.trim();
    if (superConfig.directory_categories?.includes(cat)) return;
    setSuperConfig({
      ...superConfig,
      directory_categories: [...(superConfig.directory_categories || []), cat]
    });
    setNewDirCategory('');
  };

  const handleRemoveDirCat = (cat: string) => {
    if (cat === 'All') return;
    setSuperConfig({
      ...superConfig,
      directory_categories: superConfig.directory_categories.filter((c: string) => c !== cat)
    });
  };

  const handleSwitchCommittee = async (commId: number) => {
    setSelectedCommitteeId(commId);
    const found = committees.find(c => c.id === commId);
    if (found) setCurrentCommittee(found);
    try {
      const res = await fetch(`/api/members?committee_id=${commId}`);
      const data = await res.json();
      if (data.success) {
        setMembers(data.data);
      }
    } catch (err) {
      console.error('Error switching committee:', err);
    }
  };

  const siteConfig = superConfig;
  const projectCategories = siteConfig.project_categories || ['All', 'Autonomous Terrestrial', 'Aerial Robotics', 'Biomimetic Walking Robots', 'Competitive Robotics'];
  const directoryCategories = siteConfig.directory_categories || ['All', 'Executive', 'Leads', 'Advisors'];

  // Filtered members
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.committee_role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.skills && m.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())));

    if (selectedRole === 'All') return matchesSearch;
    if (selectedRole === 'Executive') return matchesSearch && (m.category === 'Executive' || m.committee_role.includes('President') || m.committee_role.includes('Director') || m.committee_role.includes('Vice') || m.committee_role.includes('Secretary'));
    if (selectedRole === 'Leads') return matchesSearch && (m.category === 'Lead' || m.committee_role.includes('Lead'));
    if (selectedRole === 'Advisors') return matchesSearch && (m.category === 'Advisor' || m.committee_role.includes('Advisor') || m.committee_role.includes('Director'));
    return matchesSearch && ((m.category && m.category.toLowerCase() === selectedRole.toLowerCase()) || m.committee_role.toLowerCase().includes(selectedRole.toLowerCase()));
  });

  // Filtered projects
  const filteredProjects = projects.filter(p => {
    if (selectedProjectCategory === 'All') return true;
    return p.category?.toLowerCase() === selectedProjectCategory.toLowerCase();
  });

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setJoinStatus(null);
    try {
      const skillsArray = joinForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...joinForm,
          skills: skillsArray
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setJoinStatus({ success: false, message: data.error || 'Failed to submit application' });
      } else {
        setJoinStatus({ success: true, message: data.message });
        setJoinForm({
          name: '',
          email: '',
          password: '',
          department: 'Computer Science & Engineering',
          student_id: '',
          skills: '',
          bio: ''
        });
      }
    } catch (err: any) {
      setJoinStatus({ success: false, message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const heroTitle = siteContent?.hero_title?.content || 'Jamalpur Science and Technology University Robotics Club';
  const heroSubtitle = siteContent?.hero_title?.meta?.subtitle || 'Engineering Intelligent Machines, Pioneering Autonomous Frontiers';
  const heroBadge = siteContent?.hero_title?.meta?.badge || '⚡ JSTU Robotics Lab Online';
  const heroMission = siteContent?.hero_mission?.content || 'Empowering student engineers at Jamalpur Science and Technology University to design, build, and deploy world-class autonomous systems.';
  const statsList = siteConfig.stats || siteContent?.hero_mission?.meta?.stats || [
    { label: 'Autonomous Bots Built', value: '14+' },
    { label: 'Active Roboticists', value: '92+' },
    { label: 'National Competitions', value: '6 Won' },
    { label: 'Research Tracks', value: '5 Labs' }
  ];
  const agendaOverview = siteContent?.agenda_overview?.content || 'Our club bridges academic research with cutting-edge hands-on robotics engineering across multiple technical domains.';
  const agendaPillars = siteContent?.agenda_overview?.meta?.pillars || [];
  const milestonesTitle = superConfig.milestones_header?.title || siteContent?.milestones_header?.content || 'Upcoming Club Milestones';
  const milestonesSubtitle = superConfig.milestones_header?.subtitle || siteContent?.milestones_header?.meta?.subtitle || 'Scheduled field trials, workshops, and competitions';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-indigo-500 selection:text-white relative">
      {/* Header with theme switcher */}
      <JSTUHeader currentUser={currentUser} />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-sm shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ADMIN SUPERPOWER TOP BAR */}
      {currentUser?.role === 'Admin' && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 px-3 py-2 sm:px-4 sm:py-2.5 shadow-md sticky top-16 sm:top-20 z-40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs font-black">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-950 flex-shrink-0" />
              <span className="truncate">👑 Admin Supermode: Live in-page configuration enabled</span>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center justify-end">
              <button
                onClick={() => setIsSuperDrawerOpen(true)}
                className="w-full sm:w-auto justify-center px-3 py-1.5 sm:py-1 bg-slate-950 text-white rounded-xl hover:bg-slate-900 transition-all flex items-center gap-1.5 font-bold shadow-xs active:scale-95 text-center"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">Quick Editor</span>
              </button>
              <Link
                to="/admin"
                className="w-full sm:w-auto justify-center px-3 py-1.5 sm:py-1 bg-white/90 text-slate-950 rounded-xl hover:bg-white transition-all flex items-center gap-1 font-bold shadow-xs active:scale-95 text-center"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                <span className="truncate">Admin CMS</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON FOR ADMIN (Quick In-Page Superpower Drawer) */}
      {currentUser?.role === 'Admin' && (
        <button
          onClick={() => setIsSuperDrawerOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all max-w-[calc(100vw-2rem)]"
          title="Open Live Superpower Drawer"
        >
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">👑 Superpower Quick Editor</span>
          <span className="sm:hidden inline">👑 Quick Editor</span>
        </button>
      )}

      {/* IN-PAGE SUPERPOWER QUICK DRAWER OVERLAY */}
      {isSuperDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-white dark:bg-[#0D1424] border-l border-slate-200 dark:border-slate-800 h-full overflow-y-auto p-4 sm:p-6 flex flex-col justify-between shadow-2xl">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-black text-sm">
                    👑
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Admin Superpower Control</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Live in-page configuration matrix</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSuperDrawerOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 0. WEBSITE LOGO & BRANDING */}
              <div className="mb-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-500" />
                  <span>0. Logo & Site Branding</span>
                </h4>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Club Header Name</label>
                    <input
                      type="text"
                      value={superConfig.branding?.title || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        branding: { ...superConfig.branding, title: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Navbar Badge Text</label>
                    <input
                      type="text"
                      value={superConfig.branding?.badge || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        branding: { ...superConfig.branding, badge: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Navbar Subtitle</label>
                    <input
                      type="text"
                      value={superConfig.branding?.subtitle || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        branding: { ...superConfig.branding, subtitle: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Custom Logo URL (optional)</label>
                    <input
                      type="url"
                      placeholder="https://... (or empty for default)"
                      value={superConfig.branding?.image_url || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        branding: { ...superConfig.branding, image_url: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 1. SECTION VISIBILITY CONTROLS */}
              <div className="mb-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>1. Section Visibility Toggles</span>
                </h4>
                <div className="space-y-2">
                  {Object.entries(superConfig.sections || {}).map(([key, sec]: [string, any]) => (
                    <div
                      key={key}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize block truncate">
                          {key} Section
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {sec?.title}
                        </span>
                      </div>
                      <button
                        onClick={() => setSuperConfig({
                          ...superConfig,
                          sections: {
                            ...superConfig.sections,
                            [key]: { ...sec, show: sec.show === false ? true : false }
                          }
                        })}
                        className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                          sec?.show !== false
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {sec?.show !== false ? 'Shown' : 'Hidden'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. BUTTON CONTROLS */}
              <div className="mb-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>2. Hero CTA Buttons</span>
                </h4>

                {/* Primary CTA */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Primary Button</span>
                    <button
                      onClick={() => setSuperConfig({
                        ...superConfig,
                        hero_cta_primary: { ...superConfig.hero_cta_primary, show: !superConfig.hero_cta_primary?.show }
                      })}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400"
                    >
                      {superConfig.hero_cta_primary?.show ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={superConfig.hero_cta_primary?.text || ''}
                    onChange={e => setSuperConfig({
                      ...superConfig,
                      hero_cta_primary: { ...superConfig.hero_cta_primary, text: e.target.value }
                    })}
                    placeholder="Button label"
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs mb-1.5 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={superConfig.hero_cta_primary?.link || ''}
                    onChange={e => setSuperConfig({
                      ...superConfig,
                      hero_cta_primary: { ...superConfig.hero_cta_primary, link: e.target.value }
                    })}
                    placeholder="Target link (e.g. #join)"
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* Secondary CTA */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Secondary Button</span>
                    <button
                      onClick={() => setSuperConfig({
                        ...superConfig,
                        hero_cta_secondary: { ...superConfig.hero_cta_secondary, show: !superConfig.hero_cta_secondary?.show }
                      })}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400"
                    >
                      {superConfig.hero_cta_secondary?.show ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={superConfig.hero_cta_secondary?.text || ''}
                    onChange={e => setSuperConfig({
                      ...superConfig,
                      hero_cta_secondary: { ...superConfig.hero_cta_secondary, text: e.target.value }
                    })}
                    placeholder="Button label"
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs mb-1.5 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={superConfig.hero_cta_secondary?.link || ''}
                    onChange={e => setSuperConfig({
                      ...superConfig,
                      hero_cta_secondary: { ...superConfig.hero_cta_secondary, link: e.target.value }
                    })}
                    placeholder="Target link (e.g. #projects)"
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* 3. DYNAMIC CATEGORY MANAGER */}
              <div className="mb-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>3. Project Category Filter Tabs</span>
                </h4>

                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    placeholder="New category..."
                    value={newProjectCategory}
                    onChange={e => setNewProjectCategory(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={handleAddProjectCat}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {superConfig.project_categories?.map((cat: string) => (
                    <span
                      key={cat}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                    >
                      <span>{cat}</span>
                      {cat !== 'All' && (
                        <button
                          onClick={() => handleRemoveProjectCat(cat)}
                          className="hover:text-red-500 ml-1"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4. UPCOMING MILESTONES HEADER */}
              <div className="mb-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>4. Milestones & Events Header</span>
                </h4>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Section Title</label>
                    <input
                      type="text"
                      value={superConfig.milestones_header?.title || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        milestones_header: { ...superConfig.milestones_header, title: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Section Subtitle</label>
                    <input
                      type="text"
                      value={superConfig.milestones_header?.subtitle || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        milestones_header: { ...superConfig.milestones_header, subtitle: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Total events: {agenda.length}</span>
                    <Link
                      to="/admin?tab=content#cms_milestones_section"
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>Manage Events</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* 5. FOOTER TEXT CONTROL */}
              <div className="mb-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-indigo-500" />
                  <span>5. Footer Branding</span>
                </h4>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Footer Title</label>
                    <input
                      type="text"
                      value={superConfig.footer?.title || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        footer: { ...superConfig.footer, title: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Footer Description</label>
                    <textarea
                      rows={2}
                      value={superConfig.footer?.description || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        footer: { ...superConfig.footer, description: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Copyright Line</label>
                    <input
                      type="text"
                      value={superConfig.footer?.copyright || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        footer: { ...superConfig.footer, copyright: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                onClick={handleSaveSuperConfigLive}
                disabled={savingConfig}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingConfig ? 'Applying Superpowers...' : 'Save Live to Public Site'}</span>
              </button>

              <Link
                to="/admin"
                className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs text-center block hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Open Full Superpower Control CMS
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-8 pb-14 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Ambient Gradient Glows - Energetic Indigo, Violet, Cyber Amber */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-gradient-to-r from-indigo-500/15 via-purple-500/20 to-amber-500/15 dark:from-indigo-600/20 dark:via-purple-600/25 dark:to-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-black mb-6 sm:mb-8 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>{heroBadge}</span>
          </div>

          {/* Dynamic Hero Title */}
          <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-4 sm:mb-6 leading-[1.15] sm:leading-[1.1] max-w-5xl mx-auto">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 dark:from-white dark:via-slate-100 dark:to-slate-300">
              {heroTitle}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 dark:from-indigo-400 dark:via-purple-300 dark:to-amber-400 mb-4 sm:mb-6 max-w-3xl mx-auto">
            {heroSubtitle}
          </p>

          {/* Dynamic Mission Text */}
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal px-2 sm:px-0">
            {heroMission}
          </p>

          {/* Dynamic CTA Buttons (Controlled by Admin - Stack on mobile, inline on desktop) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 w-full max-w-sm sm:max-w-none mx-auto">
            {siteConfig.hero_cta_primary?.show !== false && (
              <a
                href={siteConfig.hero_cta_primary?.link || '#join'}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>{siteConfig.hero_cta_primary?.text || 'Apply for Membership'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            )}

            {siteConfig.hero_cta_secondary?.show !== false && (
              <a
                href={siteConfig.hero_cta_secondary?.link || '#projects'}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>{siteConfig.hero_cta_secondary?.text || 'Explore Active Bots'}</span>
                <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </a>
            )}

            {siteConfig.hero_cta_tertiary?.show !== false && (
              <a
                href={siteConfig.hero_cta_tertiary?.link || '#directory'}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs sm:text-base font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{siteConfig.hero_cta_tertiary?.text || 'Member Directory'}</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Dynamic Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 max-w-5xl mx-auto">
            {statsList.map((stat: any, index: number) => (
              <div
                key={index}
                className="p-3.5 sm:p-5 rounded-2xl bg-white/90 dark:bg-[#0D1424]/90 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 group shadow-sm dark:shadow-md"
              >
                <p className="text-2xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 dark:from-indigo-400 dark:via-purple-300 dark:to-amber-400 group-hover:scale-105 transition-transform duration-200 mb-0.5 sm:mb-1">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 leading-tight">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AGENDA & RESEARCH PILLARS SECTION */}
      {siteConfig.sections?.agenda?.show !== false && (
        <section id="agenda" className="py-20 bg-slate-100/70 dark:bg-[#090E1A] border-y border-slate-200 dark:border-slate-800 relative transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xs uppercase tracking-widest px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 rounded-full border border-indigo-200 dark:border-indigo-800/40 inline-block mb-3 font-black">
                {siteConfig.sections?.agenda?.subtitle || 'Strategic Blueprint'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                {siteConfig.sections?.agenda?.title || 'Club Agenda & Research Pillars'}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                {agendaOverview}
              </p>
            </div>

            {/* Pillars Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {agendaPillars.map((pillar: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800/90 hover:border-indigo-500 hover:-translate-y-1 transition-all duration-300 group shadow-sm dark:shadow-md"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/20">
                    0{idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Dynamic Agenda Milestones */}
            <div className="bg-white dark:bg-[#0B1120] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{milestonesTitle}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{milestonesSubtitle}</p>
                  </div>
                </div>

                {currentUser?.role === 'Admin' && (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/admin?tab=content#cms_milestones_section"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-xs"
                      title="Edit this section in Admin CMS"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                      <span>Edit Milestones</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {agenda.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                          {item.badge || 'Event'}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{item.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PROJECTS SHOWCASE */}
      {siteConfig.sections?.projects?.show !== false && (
        <section id="projects" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xs uppercase tracking-widest px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 rounded-full border border-indigo-200 dark:border-indigo-800/40 inline-block mb-3 font-black">
                {siteConfig.sections?.projects?.subtitle || 'Engineering Feats'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {siteConfig.sections?.projects?.title || 'Featured Robotics Projects'}
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 md:mt-0 font-medium">
              Autonomous terrestrial rovers, biomimetic crawlers, and aerial reconnaissance platforms engineered by JSTU student teams.
            </p>
          </div>

          {/* Dynamic Project Category Filter Tabs (Admin Controlled - Swipeable on mobile) */}
          <div className="flex overflow-x-auto no-scrollbar scroll-smooth gap-2 mb-8 pb-3 border-b border-slate-200 dark:border-slate-800 -mx-4 px-4 sm:mx-0 sm:px-0">
            {projectCategories.map((cat: string) => (
              <button
                key={cat}
                onClick={() => setSelectedProjectCategory(cat)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedProjectCategory === cat
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                className="rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800 overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-950/30 hover:-translate-y-1 transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                  <img
                    src={p.image_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80'}
                    alt={p.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30">
                      {p.category}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                      {p.status}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed font-normal">
                      {p.description}
                    </p>
                    
                    {/* Tech stack chips */}
                    <div className="mb-4">
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block mb-1.5 uppercase font-bold">Tech Architecture:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {p.tech_stack && p.tech_stack.map((t: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-xs bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-mono font-bold border border-indigo-200 dark:border-slate-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Engineers: </span>
                      {p.team_members ? p.team_members.join(', ') : 'JSTU Core Team'}
                    </div>
                    {p.github_link && (
                      <a
                        href={p.github_link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
                        title="View GitHub Repository"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* COMMITTEE & MEMBER DIRECTORY */}
      {siteConfig.sections?.directory?.show !== false && (
        <section id="directory" className="py-24 bg-slate-100/70 dark:bg-[#090E1A] border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xs uppercase tracking-widest px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 rounded-full border border-indigo-200 dark:border-indigo-800/40 inline-block mb-3 font-black">
                  {siteConfig.sections?.directory?.subtitle || 'Team & Community'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {siteConfig.sections?.directory?.title || 'Committee & Member Directory'}
                </h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 md:mt-0 font-medium">
                Meet the faculty advisors, executive committee, lead roboticists, and researchers driving robotics at JSTU.
              </p>
            </div>

            {/* Active Committee Tenure Indicator & Quick Switcher */}
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0">
                  #{currentCommittee?.committee_number || '1'}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {currentCommittee?.title || '1st Executive Committee'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      {currentCommittee?.is_current === 1 ? 'Active Running Tenure' : 'Archived Tenure'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Academic Session: <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentCommittee?.session_years || '2025–2026'}</span>
                    {currentCommittee?.theme_motto ? ` · "${currentCommittee.theme_motto}"` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                {committees.length > 1 && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span className="text-[11px] text-slate-400 hidden sm:inline">Switch Tenure:</span>
                    <select
                      value={selectedCommitteeId || ''}
                      onChange={(e) => handleSwitchCommittee(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
                    >
                      {committees.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          Committee #{c.committee_number} ({c.session_years}){c.is_current === 1 ? ' ★ Active' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Link
                  to="/committees"
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-black transition-all flex items-center gap-1 border border-indigo-200/60 dark:border-indigo-800/40 shadow-xs"
                >
                  <span>🏛️ View All Committees Archive</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                {currentUser?.role === 'Admin' && (
                  <Link
                    to="/admin?tab=committees"
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-black transition-all flex items-center gap-1"
                    title="Manage committees in Admin CMS"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>Manage</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Controls: Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
              {/* Filter Tabs (Controlled by Admin - Swipeable on mobile) */}
              <div className="flex overflow-x-auto no-scrollbar scroll-smooth gap-2 w-full sm:w-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0">
                {directoryCategories.map((role: string) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                      selectedRole === role
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300'
                    }`}
                  >
                    {role === 'All' ? 'All Members' : role}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search member, skill, role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-950/30 transition-all duration-300 flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={m.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(m.name)}`}
                        alt={m.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/30 group-hover:border-indigo-500 transition-colors shadow-md"
                        onError={(e) => {
                          e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(m.name)}`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                            m.category === 'Advisor'
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : m.category === 'Executive'
                                ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                : m.category === 'Lead'
                                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}>
                            {m.category === 'Advisor' ? '🎓 Advisor' : m.category === 'Executive' ? '👑 Executive' : m.category === 'Lead' ? '⚡ Lead' : '👤 Member'}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {m.name}
                        </h4>
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-0.5 leading-tight">
                          {m.committee_role}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {m.department}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed font-normal">
                      {m.bio || 'Active member contributing to hardware prototyping and autonomous algorithms.'}
                    </p>

                    {/* Skills tags */}
                    {m.skills && m.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {m.skills.slice(0, 4).map((s: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40"
                          >
                            {s}
                          </span>
                        ))}
                        {m.skills.length > 4 && (
                          <span className="text-[10px] font-mono text-slate-400 self-center">
                            +{m.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* View Details Link */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      ID: {m.student_id || `JSTU-${m.id}`}
                    </span>
                    <Link
                      to={`/members/${m.user_id || m.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group-hover:translate-x-1 duration-200"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-slate-900/30 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-300 font-bold">No members found matching your search.</p>
                <button
                  onClick={() => { setSelectedRole('All'); setSearchQuery(''); }}
                  className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* JOIN THE CLUB RECRUITMENT SECTION */}
      {siteConfig.sections?.join?.show !== false && (
        <section id="join" className="py-16 sm:py-24 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1424] border border-indigo-200 dark:border-indigo-500/30 p-5 sm:p-10 lg:p-12 shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-950/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-amber-500/15 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-2xl mb-6 sm:mb-8 relative">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xs uppercase tracking-widest px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 rounded-full border border-indigo-200 dark:border-indigo-800/40 inline-block mb-3 font-black">
                {siteConfig.sections?.join?.subtitle || 'Recruitment 2026'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3 tracking-tight">
                {siteConfig.sections?.join?.title || 'Join the JSTU Robotics Club'}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed font-normal">
                Step into the lab, collaborate on national rover prototypes, master ROS2 and embedded firmware, and represent Jamalpur Science and Technology University on the national stage.
              </p>
            </div>

            {joinStatus && (
              <div
                className={`p-4 rounded-2xl mb-6 text-sm font-bold ${
                  joinStatus.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/40 text-red-800 dark:text-red-300'
                }`}
              >
                {joinStatus.message}
              </div>
            )}

            <form onSubmit={handleJoinSubmit} className="space-y-4 relative">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Ahmed"
                    value={joinForm.name}
                    onChange={e => setJoinForm({ ...joinForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="youremail@example.com (any email supported)"
                    value={joinForm.email}
                    onChange={e => setJoinForm({ ...joinForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={joinForm.password}
                    onChange={e => setJoinForm({ ...joinForm, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Department
                  </label>
                  <select
                    value={joinForm.department}
                    onChange={e => setJoinForm({ ...joinForm, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Physics & Electronics">Physics & Electronics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Student ID
                  </label>
                  <input
                    type="text"
                    placeholder="JSTU-CSE-XXXX"
                    value={joinForm.student_id}
                    onChange={e => setJoinForm({ ...joinForm, student_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                  Robotics Skills & Tools (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Arduino, ROS2, C++, Python, KiCad, SolidWorks, Soldering..."
                  value={joinForm.skills}
                  onChange={e => setJoinForm({ ...joinForm, skills: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                  Short Bio / Why do you want to join?
                </label>
                <textarea
                  rows={3}
                  placeholder="Share your interest in robotics, past projects, or what you want to build at JSTU..."
                  value={joinForm.bio}
                  onChange={e => setJoinForm({ ...joinForm, bio: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/25 transition-all disabled:opacity-50 hover:-translate-y-0.5"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Membership Application'}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="py-10 sm:py-12 bg-white dark:bg-[#05080E] border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <img
              src="/logo.jpg"
              alt="JSTU Robotics Club Logo"
              className="w-9 h-9 rounded-xl object-cover border border-indigo-200 dark:border-indigo-800 flex-shrink-0 bg-white shadow-xs"
            />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block text-sm sm:text-xs">
                {superConfig.footer?.title || 'Jamalpur Science and Technology University Robotics Club'}
              </span>
              {superConfig.footer?.description && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block max-w-md">
                  {superConfig.footer.description}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 font-bold text-xs">
            <Link to="/auth" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Portal Sign In</Link>
            <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Member Panel</Link>
            <Link to="/admin" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Admin Supermode</Link>
          </div>
          <p className="font-mono text-center sm:text-right text-[11px]">
            {superConfig.footer?.copyright || '© 2026 JSTU Robotics Club · Powered by SQLite Relational Core'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default JSTULandingPage;
