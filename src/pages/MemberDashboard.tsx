import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, LayoutDashboard, Bell, ShieldCheck, Cpu, 
  Save, Sparkles, CheckCircle2, AlertCircle, ExternalLink, 
  Plus, X, Image as ImageIcon, Github, Linkedin, Mail, ArrowRight, Upload, Camera,
  Trophy, BookOpen, GraduationCap, Globe, Trash2, Award, Compass, Eye, Layers,
  QrCode, CreditCard, Copy, Check, Wrench, Clock, Share2, FileText, CheckCircle, RefreshCw
} from 'lucide-react';
import JSTUHeader from '../components/JSTUHeader';
import { fileToBase64Image } from '../utils/imageHelper';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

type TabKey = 'overview' | 'profile' | 'loans' | 'projects';

export const MemberDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Instant local profile state to prevent header flashing/logout appearance
  const [profile, setProfile] = useState<any>(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [myProposals, setMyProposals] = useState<any[]>([]);
  const [myLoans, setMyLoans] = useState<any[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [loading, setLoading] = useState(!profile);

  // Digital Pass & QR state
  const [qrMode, setQrMode] = useState<'profile' | 'lab'>('profile');
  const [copiedPassToken, setCopiedPassToken] = useState(false);
  const [copiedProfileUrl, setCopiedProfileUrl] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // Proposal modal state
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    title: '',
    category: 'Autonomous Terrestrial',
    description: '',
    tech_stack: '',
    team_members: '',
    github_link: '',
    image_url: ''
  });
  const [proposalStatus, setProposalStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // Lock background scroll when any modal is open
  useBodyScrollLock(isProposalModalOpen || isPassModalOpen);

  // Edit form state initialized from local cache
  const [formData, setFormData] = useState(() => {
    try {
      const u = localStorage.getItem('user');
      const p = u ? JSON.parse(u) : null;
      return {
        username: p?.username || '',
        name: p?.name || '',
        headline: p?.headline || '',
        department: p?.department || '',
        student_id: p?.student_id || '',
        bio: p?.bio || '',
        profile_photo: p?.profile_photo || '',
        cover_photo: p?.cover_photo || '',
        cover_position: p?.cover_position != null ? Number(p.cover_position) : 50,
        skillsString: Array.isArray(p?.skills) ? p.skills.join(', ') : '',
        research_interests: Array.isArray(p?.research_interests) ? p.research_interests : [],
        achievements: Array.isArray(p?.achievements) ? p.achievements : [],
        github: p?.contact_links?.github || '',
        linkedin: p?.contact_links?.linkedin || '',
        google_scholar: p?.contact_links?.google_scholar || '',
        researchgate: p?.contact_links?.researchgate || '',
        website: p?.contact_links?.website || '',
        twitter: p?.contact_links?.twitter || '',
      };
    } catch {
      return {
        username: '',
        name: '',
        headline: '',
        department: '',
        student_id: '',
        bio: '',
        profile_photo: '',
        cover_photo: '',
        cover_position: 50,
        skillsString: '',
        research_interests: [] as string[],
        achievements: [] as Array<{ title: string; year: string; issuer: string; link?: string }>,
        github: '',
        linkedin: '',
        google_scholar: '',
        researchgate: '',
        website: '',
        twitter: '',
      };
    }
  });

  const [newResearchTag, setNewResearchTag] = useState('');
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    year: '',
    issuer: '',
    link: ''
  });

  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isProcessingCover, setIsProcessingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{ available?: boolean; error?: string; message?: string } | null>(null);

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingImage(true);
    setImageError(null);
    try {
      const base64 = await fileToBase64Image(file);
      setFormData(prev => ({ ...prev, profile_photo: base64 }));
    } catch (err: any) {
      setImageError(err.message || 'Failed to process image');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingCover(true);
    setCoverError(null);
    try {
      const base64 = await fileToBase64Image(file, 1920, 600, 0.88);
      setFormData(prev => ({ ...prev, cover_photo: base64 }));
    } catch (err: any) {
      setCoverError(err.message || 'Failed to process cover banner image');
    } finally {
      setIsProcessingCover(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleUsernameChange = async (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setFormData(prev => ({ ...prev, username: clean }));
    setUsernameStatus(null);
    if (!clean || clean.length < 3) return;
    
    try {
      setUsernameChecking(true);
      const res = await fetch(`/api/members/check-username/${clean}?userId=${profile?.id || 0}`);
      const data = await res.json();
      setUsernameStatus(data);
    } catch (e) {
      // ignore
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleAddResearchTag = (tagToAdd?: string) => {
    const tag = (tagToAdd || newResearchTag).trim();
    if (!tag) return;
    if (formData.research_interests.includes(tag)) {
      setNewResearchTag('');
      return;
    }
    setFormData(prev => ({
      ...prev,
      research_interests: [...prev.research_interests, tag]
    }));
    setNewResearchTag('');
  };

  const handleRemoveResearchTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      research_interests: prev.research_interests.filter(t => t !== tagToRemove)
    }));
  };

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchievement.title.trim()) return;
    setFormData(prev => ({
      ...prev,
      achievements: [
        ...prev.achievements,
        {
          title: newAchievement.title.trim(),
          year: newAchievement.year.trim() || new Date().getFullYear().toString(),
          issuer: newAchievement.issuer.trim(),
          link: newAchievement.link.trim()
        }
      ]
    }));
    setNewAchievement({ title: '', year: '', issuer: '', link: '' });
  };

  const handleRemoveAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, idx) => idx !== index)
    }));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    try {
      if (!profile) setLoading(true);
      const res = await fetch('/api/member/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/auth');
          return;
        }
        throw new Error('Failed to load dashboard data');
      }

      const data = await res.json();
      if (data.data?.profile) {
        const p = data.data.profile;
        setProfile(p);
        localStorage.setItem('user', JSON.stringify(p));
        setAnnouncements(data.data.announcements || []);
        setActiveProjects(data.data.activeProjects || []);
        setMyProposals(data.data.myProposals || []);

        setFormData({
          username: p.username || '',
          name: p.name || '',
          headline: p.headline || '',
          department: p.department || '',
          student_id: p.student_id || '',
          bio: p.bio || '',
          profile_photo: p.profile_photo || '',
          cover_photo: p.cover_photo || '',
          cover_position: p.cover_position != null ? Number(p.cover_position) : 50,
          skillsString: Array.isArray(p.skills) ? p.skills.join(', ') : '',
          research_interests: Array.isArray(p.research_interests) ? p.research_interests : [],
          achievements: Array.isArray(p.achievements) ? p.achievements : [],
          github: p.contact_links?.github || '',
          linkedin: p.contact_links?.linkedin || '',
          google_scholar: p.contact_links?.google_scholar || '',
          researchgate: p.contact_links?.researchgate || '',
          website: p.contact_links?.website || '',
          twitter: p.contact_links?.twitter || '',
        });
      }

      // Fetch member's loans
      fetchMyLoans();
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyLoans = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      setLoadingLoans(true);
      const res = await fetch('/api/hardware/loans/mine', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyLoans(data.loans || []);
      }
    } catch (e) {
      console.error('Failed to fetch personal loans:', e);
    } finally {
      setLoadingLoans(false);
    }
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProposal(true);
    setProposalStatus(null);
    const token = localStorage.getItem('token');
    try {
      const techStack = proposalForm.tech_stack.split(',').map(s => s.trim()).filter(Boolean);
      const team = proposalForm.team_members.split(',').map(s => s.trim()).filter(Boolean);

      const res = await fetch('/api/member/project-proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...proposalForm,
          tech_stack: techStack,
          team_members: team
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setProposalStatus({ success: false, message: data.error || 'Failed to submit proposal' });
      } else {
        setProposalStatus({ success: true, message: '🎉 Proposal submitted! Pending Super Admin review & approval.' });
        setProposalForm({
          title: '',
          category: 'Autonomous Terrestrial',
          description: '',
          tech_stack: '',
          team_members: '',
          github_link: '',
          image_url: ''
        });
        fetchDashboardData();
        setTimeout(() => {
          setIsProposalModalOpen(false);
          setProposalStatus(null);
        }, 1800);
      }
    } catch (err: any) {
      setProposalStatus({ success: false, message: err.message });
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    const token = localStorage.getItem('token');

    try {
      const skillsArray = formData.skillsString
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const contact_links = {
        email: profile?.email || '',
        github: formData.github.trim(),
        linkedin: formData.linkedin.trim(),
        google_scholar: formData.google_scholar.trim(),
        researchgate: formData.researchgate.trim(),
        website: formData.website.trim(),
        twitter: formData.twitter.trim()
      };

      const res = await fetch('/api/member/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          name: formData.name,
          headline: formData.headline,
          department: formData.department,
          student_id: formData.student_id,
          bio: formData.bio,
          profile_photo: formData.profile_photo,
          cover_photo: formData.cover_photo,
          cover_position: formData.cover_position,
          skills: skillsArray,
          research_interests: formData.research_interests,
          achievements: formData.achievements,
          contact_links
        })
      });

      const result = await res.json();
      if (!res.ok) {
        setSaveStatus({ success: false, message: result.error || 'Failed to save profile' });
      } else {
        setSaveStatus({ success: true, message: result.message || 'Profile updated successfully!' });
        setProfile(result.data);
        localStorage.setItem('user', JSON.stringify(result.data));
        // Also update local formData if username updated
        if (result.data.username) {
          setFormData(prev => ({ ...prev, username: result.data.username }));
        }
      }
    } catch (err: any) {
      setSaveStatus({ success: false, message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // QR and ID Pass helpers
  const profileSlug = formData.username || profile?.username || (profile?.id ? `members/${profile.id}` : '');
  const publicProfileUrl = typeof window !== 'undefined' ? `${window.location.origin}/${profileSlug}` : `/${profileSlug}`;
  const labPassToken = `JSTU-ROBOTICS-MBR:${profile?.id || '0'}:${profile?.student_id || 'VERIFIED'}:${profile?.name || 'MEMBER'}`;
  
  const activeQrData = qrMode === 'profile' ? publicProfileUrl : labPassToken;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(activeQrData)}&margin=1`;

  const handleCopyPassToken = () => {
    navigator.clipboard.writeText(labPassToken);
    setCopiedPassToken(true);
    setTimeout(() => setCopiedPassToken(false), 2000);
  };

  const handleCopyProfileUrl = () => {
    navigator.clipboard.writeText(publicProfileUrl);
    setCopiedProfileUrl(true);
    setTimeout(() => setCopiedProfileUrl(false), 2000);
  };

  const calculateProfileScore = () => {
    let score = 20; // baseline
    if (profile?.profile_photo) score += 20;
    if (profile?.cover_photo) score += 15;
    if (profile?.student_id) score += 15;
    if (profile?.bio) score += 10;
    if (profile?.skills && profile.skills.length > 0) score += 10;
    if (profile?.contact_links && (profile.contact_links.github || profile.contact_links.linkedin)) score += 10;
    return Math.min(100, score);
  };

  const profileScore = calculateProfileScore();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
        <JSTUHeader currentUser={profile} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 p-0.5 animate-spin">
              <div className="w-full h-full bg-white dark:bg-[#0D1424] rounded-[14px] flex items-center justify-center">
                <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Loading Member Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 selection:bg-indigo-500 selection:text-white">
      <JSTUHeader currentUser={profile} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Executive Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                Member Command Center
              </span>
              <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                profile?.status === 'approved'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
              }`}>
                ● {profile?.status === 'approved' ? 'Active & Verified' : `Status: ${profile?.status}`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome back, {profile?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Role: <strong className="text-indigo-600 dark:text-indigo-400">{profile?.committee_role || 'General Member'}</strong> ({profile?.role}) · {profile?.department || 'Department of Robotics & CSE'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsPassModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm border border-slate-700 active:scale-95"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Digital Pass QR</span>
            </button>

            <Link
              to="/loans"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <Wrench className="w-4 h-4" />
              <span>Request Equipment Loan</span>
            </Link>

            <button
              onClick={() => setIsProposalModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Proposal</span>
            </button>

            <Link
              to={`/${profileSlug}`}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>View Public Card</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Dashboard Navigation Tabs Bar */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-[#0D1424] border border-slate-300/60 dark:border-slate-800 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview & Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Edit Profile & Public Card</span>
            {profileScore < 100 && (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('loans')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'loans'
                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Equipment & Project Loans</span>
            {myLoans.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                {myLoans.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'projects'
                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Project Proposals</span>
            {myProposals.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400">
                {myProposals.length}
              </span>
            )}
          </button>
        </div>

        {/* =========================================================================
            TAB 1: OVERVIEW & DIGITAL ID COCKPIT
           ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Quick KPI Stat Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Digital Pass</span>
                  <CreditCard className="w-4 h-4 text-cyan-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Active</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">● Verified</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  ID: {profile?.student_id || `JSTU-${profile?.id}`}
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Active Loans</span>
                  <Wrench className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{myLoans.length}</span>
                  <span className="text-[11px] font-bold text-slate-500">items checked out</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Universal Lab Requisitions
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">My Proposals</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{myProposals.length}</span>
                  <span className="text-[11px] font-bold text-slate-500">submitted builds</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Robotics Hardware Submissions
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Card Health</span>
                  <User className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{profileScore}%</span>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Complete</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${profileScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Main 2-Column Command Cockpit */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left 2 Columns */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* 1. Official Holographic Digital Member Pass with Scannable QR */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1222] via-[#0f172a] to-[#1a1c3b] border border-indigo-500/30 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20">
                  {/* Holographic glowing lines & background decoration */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-indigo-500" />

                  {/* Top Bar of Pass */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-white/10 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-cyan-500/20">
                        🤖
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400">
                            JSTU ROBOTICS CLUB
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                            VERIFIED 2026
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                          Official Digital Member Pass & Quick Pass
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQrMode(qrMode === 'profile' ? 'lab' : 'profile')}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5 border border-white/15"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Mode: {qrMode === 'profile' ? 'Public Portfolio' : 'Lab Station ID'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Pass Grid: Member Identity Info & QR Code */}
                  <div className="grid md:grid-cols-5 gap-6 items-center relative z-10">
                    {/* Left Member Info (3 cols) */}
                    <div className="md:col-span-3 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {profile?.profile_photo ? (
                            <img
                              src={profile.profile_photo}
                              alt={profile.name}
                              className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/20"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-indigo-600/40 border-2 border-cyan-400/60 flex items-center justify-center text-2xl font-black text-white">
                              {profile?.name?.charAt(0) || 'M'}
                            </div>
                          )}
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0c1222] flex items-center justify-center text-[9px] text-white">
                            ✓
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                            {profile?.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-cyan-300 font-mono font-bold">
                            @{formData.username || profile?.username || 'unassigned'}
                          </p>
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
                            {profile?.committee_role || 'General Member'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">Student ID</span>
                          <span className="text-xs sm:text-sm font-bold font-mono text-white">
                            {profile?.student_id || 'Not Linked'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">Department</span>
                          <span className="text-xs sm:text-sm font-bold text-white truncate block">
                            {profile?.department || 'Robotics & CSE'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 italic">
                        "{profile?.headline || profile?.bio || 'Active researcher and robotics engineering member at JSTU.'}"
                      </p>
                    </div>

                    {/* Right Scannable QR Code Frame (2 cols) */}
                    <div className="md:col-span-2 flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md">
                      <div className="p-2.5 bg-white rounded-xl shadow-xl">
                        <img
                          src={qrCodeUrl}
                          alt="Scannable Member ID QR Code"
                          className="w-36 h-36 object-contain rounded"
                        />
                      </div>

                      <div className="mt-3 text-center">
                        <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-center gap-1">
                          <QrCode className="w-3.5 h-3.5" />
                          {qrMode === 'profile' ? 'Scan for Public Portfolio' : 'Scan for Lab Check-in'}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Scannable by phone camera or lab gate
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pass Quick Action Bar */}
                  <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 relative z-10">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleCopyPassToken}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        {copiedPassToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                        <span>{copiedPassToken ? 'Token Copied!' : 'Copy Lab Pass Token'}</span>
                      </button>

                      <button
                        onClick={handleCopyProfileUrl}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        {copiedProfileUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-300" />}
                        <span>{copiedProfileUrl ? 'Link Copied!' : 'Copy Profile URL'}</span>
                      </button>

                      <button
                        onClick={() => setIsPassModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs font-bold text-cyan-300 transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Fullscreen Pass</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setActiveTab('profile')}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
                    >
                      <span>Customise Member Card</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 2. Active Equipment & Project Loans Widget */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          Lab & Equipment Loans Tracker
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Requisitions for complete projects, microcontrollers, or prototyping consumables
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/loans"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 w-fit active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Requisition</span>
                    </Link>
                  </div>

                  {myLoans.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70">
                      <Wrench className="w-10 h-10 mx-auto mb-2 text-slate-400/60" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        No active equipment or project loans checked out.
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                        Need an Arduino, ESP32, jumper wires, sensors, or an entire flagship robotics project for research? Use our universal requisition system.
                      </p>
                      <Link
                        to="/loans"
                        className="inline-flex items-center gap-1.5 mt-3.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                      >
                        <span>Open Equipment Requisition System</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myLoans.slice(0, 3).map((loan) => (
                        <div
                          key={loan.id}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                {loan.item_type}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {loan.item_name}
                              </h4>
                              <span className="text-xs font-mono text-slate-500 font-bold">
                                (Qty: {loan.quantity})
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                              Purpose: {loan.purpose}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            {loan.return_due_date && (
                              <div className="text-right">
                                <span className="block text-[10px] uppercase font-bold text-slate-400">Due Date</span>
                                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                                  {new Date(loan.return_due_date).toLocaleDateString()}
                                </span>
                              </div>
                            )}

                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                              loan.status === 'approved'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                                : loan.status === 'rejected'
                                ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/40'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
                            }`}>
                              {loan.status}
                            </span>
                          </div>
                        </div>
                      ))}

                      {myLoans.length > 3 && (
                        <button
                          onClick={() => setActiveTab('loans')}
                          className="w-full py-2 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View all {myLoans.length} loans in Loans tab →
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. My Submitted Project Proposals Summary */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          Robotics Project Proposals
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Track review and live approval of your robotics submissions
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsProposalModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1 w-fit active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Submit Proposal</span>
                    </button>
                  </div>

                  {myProposals.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70">
                      <Cpu className="w-10 h-10 mx-auto mb-2 text-slate-400/60" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        You haven't submitted any robotics project proposals yet.
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                        Have a concept for an autonomous rover, hexapod, swarm bot, or AI drone? Propose it to get club funding, components, and live showcase status.
                      </p>
                      <button
                        onClick={() => setIsProposalModalOpen(true)}
                        className="mt-3.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        + Submit your first robotics proposal
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myProposals.slice(0, 3).map((prop) => (
                        <div
                          key={prop.id}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                {prop.category}
                              </span>
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{prop.title}</h4>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider w-fit border ${
                              prop.approval_status === 'approved'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                                : prop.approval_status === 'rejected'
                                ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/40'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 animate-pulse'
                            }`}>
                              {prop.approval_status === 'approved'
                                ? '✅ Approved & Live'
                                : prop.approval_status === 'rejected'
                                ? '❌ Needs Revision'
                                : '⏳ Pending Review'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                            {prop.description}
                          </p>
                        </div>
                      ))}

                      {myProposals.length > 3 && (
                        <button
                          onClick={() => setActiveTab('projects')}
                          className="w-full py-2 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View all {myProposals.length} proposals in Proposals tab →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Profile Health, Announcements & Shortcuts */}
              <div className="space-y-6">
                
                {/* Profile Health & Customization Quick Action */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Public Member Card</h4>
                        <p className="text-[11px] text-slate-500">Live directory representation</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{profileScore}%</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    Your public member card is searchable across the university network. Update your custom cover banner, research interests, and social portfolio.
                  </p>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Open Full Profile & Card Editor</span>
                  </button>
                </div>

                {/* Club Announcements */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
                  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Club Announcements</h4>
                      <p className="text-[11px] text-slate-500">Official Committee Broadcasts</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {announcements.map((a) => (
                      <div
                        key={a.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            a.priority === 'high' 
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30' 
                              : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {a.priority}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span>
                        </div>
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs mb-1">{a.title}</h5>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{a.content}</p>
                        <span className="block mt-2 text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">By {a.author_name}</span>
                      </div>
                    ))}

                    {announcements.length === 0 && (
                      <p className="text-xs text-slate-500 italic py-2 text-center">No active announcements right now.</p>
                    )}
                  </div>
                </div>

                {/* Active Projects Tracker */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
                  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Active Lab Projects</h4>
                      <p className="text-[11px] text-slate-500">Live JSTU Robotics Builds</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeProjects.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{p.title}</span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">{p.status}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: EDIT PROFILE & PUBLIC CARD
           ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-sm dark:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Edit Your Public Member Card & Profile</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Updates will sync live across the JSTU directory and QR pass</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all"
                  >
                    ← Back to Overview
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    ID: {profile?.student_id || `JSTU-${profile?.id}`}
                  </span>
                </div>
              </div>

              {saveStatus && (
                <div
                  className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-2 ${
                    saveStatus.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/40 text-red-800 dark:text-red-300'
                  }`}
                >
                  {saveStatus.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                  <span>{saveStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleProfileSave} className="space-y-6">
                {/* 1. Identity & Handle Details */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                      Display Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide flex items-center justify-between">
                      <span>Unique Username</span>
                      {usernameChecking && <span className="text-[10px] text-indigo-500 lowercase font-normal">checking...</span>}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 text-xs font-mono font-bold">@</span>
                      <input
                        type="text"
                        placeholder="e.g. nahid, alex_robotics"
                        value={formData.username}
                        onChange={e => handleUsernameChange(e.target.value)}
                        className={`w-full pl-7 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border text-slate-900 dark:text-white text-xs font-mono focus:outline-none shadow-xs ${
                          usernameStatus?.available === false
                            ? 'border-red-500 focus:border-red-500'
                            : usernameStatus?.available === true
                            ? 'border-emerald-500 focus:border-emerald-500'
                            : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500'
                        }`}
                      />
                      {usernameStatus?.available === true && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-2.5" />
                      )}
                      {usernameStatus?.available === false && (
                        <AlertCircle className="w-4 h-4 text-red-500 absolute right-2.5 top-2.5" />
                      )}
                    </div>
                    {usernameStatus && (
                      <p className={`text-[10px] mt-1 font-medium ${usernameStatus.available ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {usernameStatus.message}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Your link: <span className="font-mono text-indigo-500">localhost:8081/@{formData.username || 'username'}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                      Student ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 210101"
                      value={formData.student_id}
                      onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 shadow-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science & Engineering"
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Autonomous Drone Researcher & Embedded Enthusiast"
                      value={formData.headline}
                      onChange={e => setFormData({ ...formData, headline: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                </div>

                {/* 2. Visual Media: Avatar & Cover Banner */}
                <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  {/* Avatar Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                      Member Avatar Photo
                    </label>
                    <div className="flex items-center gap-3">
                      {formData.profile_photo ? (
                        <img
                          src={formData.profile_photo}
                          alt="Avatar Preview"
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 border border-dashed border-slate-400 flex items-center justify-center text-slate-400 flex-shrink-0">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs">
                          <Camera className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{isProcessingImage ? 'Processing...' : 'Upload Avatar'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoFileChange}
                            disabled={isProcessingImage}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-slate-400 mt-1">Recommended: Square PNG/JPG (auto-compressed)</p>
                      </div>
                    </div>
                    {imageError && <p className="text-[10px] text-red-500 font-bold mt-1">{imageError}</p>}
                  </div>

                   {/* Cover Banner Upload & Reposition */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                      Profile Cover Banner
                    </label>

                    {/* Widescreen interactive preview */}
                    {formData.cover_photo ? (
                      <div className="relative w-full rounded-2xl overflow-hidden mb-3" style={{ aspectRatio: '16/5' }}>
                        <img
                          src={formData.cover_photo}
                          alt="Cover Preview"
                          className="w-full h-full object-cover select-none"
                          style={{ objectPosition: `center ${formData.cover_position}%` }}
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none rounded-2xl" />
                        <div className="absolute bottom-2 left-3 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-cyan-300 font-mono text-[11px] font-bold border border-white/10">
                            Position: {formData.cover_position}%
                          </span>
                        </div>
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-xl bg-black/50 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                          👁 Preview (16:5)
                        </div>
                      </div>
                    ) : (
                      <div className="w-full rounded-2xl bg-slate-200 dark:bg-slate-800 border border-dashed border-slate-400 flex items-center justify-center text-slate-400 mb-3" style={{ aspectRatio: '16/5' }}>
                        <div className="flex flex-col items-center gap-1">
                          <ImageIcon className="w-8 h-8 opacity-40" />
                          <span className="text-[11px]">No cover photo yet</span>
                        </div>
                      </div>
                    )}

                    {/* Vertical position slider */}
                    {formData.cover_photo && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Vertical Position</span>
                          <div className="flex gap-1.5">
                            {[['Top', 10], ['Center', 50], ['Bottom', 90]].map(([label, val]) => (
                              <button
                                key={label as string}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, cover_position: val as number }))}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                                  Math.abs(formData.cover_position - (val as number)) < 15
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                                }`}
                              >{label as string}</button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={formData.cover_position}
                          onChange={e => setFormData(prev => ({ ...prev, cover_position: Number(e.target.value) }))}
                          className="w-full h-1.5 rounded-full accent-indigo-600 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">0% = top of image · 100% = bottom · Saved with your profile</p>
                      </div>
                    )}

                    {/* Upload button */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs">
                          <Upload className="w-3.5 h-3.5 text-cyan-500" />
                          <span>{isProcessingCover ? 'Compressing...' : 'Upload Cover Banner'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverFileChange}
                            disabled={isProcessingCover}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-slate-400 mt-1">1920×600 banner auto-saved to Cloudinary</p>
                      </div>
                    </div>
                    {coverError && <p className="text-[10px] text-red-500 font-bold mt-1">{coverError}</p>}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    About / Bio
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief intro about your background, research journey, robotics projects, and aspirations..."
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 shadow-xs resize-none"
                  />
                </div>

                {/* Technical Skills String */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Core Technical Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ROS2, Python, C++, Computer Vision, Arduino, Soldering, SolidWorks"
                    value={formData.skillsString}
                    onChange={e => setFormData({ ...formData, skillsString: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>

                {/* Research Interests Tags */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                    Research Pillars & Interests
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.research_interests.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveResearchTag(tag)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {formData.research_interests.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No research tags added yet. Add below!</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add tag (e.g. SLAM, Swarm Robotics, Quadrotors)"
                      value={newResearchTag}
                      onChange={e => setNewResearchTag(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddResearchTag();
                        }
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddResearchTag()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      + Add Tag
                    </button>
                  </div>
                </div>

                {/* Achievements Manager */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                    Academic & Robotics Achievements
                  </label>
                  
                  {formData.achievements.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {formData.achievements.map((ach, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{ach.title}</span>
                            <span className="text-slate-500 dark:text-slate-400 ml-2">({ach.issuer} · {ach.year})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAchievement(idx)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Title (e.g. 1st Runner Up RoboCup)"
                      value={newAchievement.title}
                      onChange={e => setNewAchievement({ ...newAchievement, title: e.target.value })}
                      className="sm:col-span-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Issuer (e.g. BUET / JSTU)"
                      value={newAchievement.issuer}
                      onChange={e => setNewAchievement({ ...newAchievement, issuer: e.target.value })}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Year"
                        value={newAchievement.year}
                        onChange={e => setNewAchievement({ ...newAchievement, year: e.target.value })}
                        className="w-20 px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddAchievement}
                        className="flex-1 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Social & Academic Portfolio Links */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                    Social & Academic Profiles
                  </label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        <Github className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                        <span>GitHub Profile</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={formData.github}
                        onChange={e => setFormData({ ...formData, github: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                        <span>LinkedIn Profile</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={formData.linkedin}
                        onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Google Scholar</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://scholar.google.com/..."
                        value={formData.google_scholar}
                        onChange={e => setFormData({ ...formData, google_scholar: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                        <span>ResearchGate</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://researchgate.net/profile/..."
                        value={formData.researchgate}
                        onChange={e => setFormData({ ...formData, researchgate: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        <Globe className="w-3.5 h-3.5 text-purple-500" />
                        <span>Personal Website</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://yourname.me"
                        value={formData.website}
                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        <span className="font-mono font-bold text-xs">𝕏</span>
                        <span>Twitter / X Profile</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://x.com/username"
                        value={formData.twitter}
                        onChange={e => setFormData({ ...formData, twitter: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Footer Bar */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <Link
                    to={`/${profileSlug}`}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview My Public Profile Page</span>
                  </Link>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving Changes...' : 'Save & Publish Profile'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: EQUIPMENT & PROJECT LOANS
           ========================================================================= */}
        {activeTab === 'loans' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-sm dark:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Lab & Equipment Loans Matrix
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Manage all your hardware requests, check-outs, and return schedules
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/loans"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Universal Loan Request</span>
                  </Link>
                </div>
              </div>

              {myLoans.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="w-12 h-12 mx-auto mb-3 text-slate-400/50" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No active equipment requisitions</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Members can request any item needed for research or prototyping: entire finished robotics projects, microcontrollers, motor drivers, sensors, or consumables like jumper wires.
                  </p>
                  <Link
                    to="/loans"
                    className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit Your First Loan Request</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            {loan.item_type}
                          </span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {loan.item_name}
                          </h4>
                          <span className="text-xs font-mono font-bold text-slate-500">
                            (Quantity: {loan.quantity})
                          </span>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider w-fit border ${
                          loan.status === 'approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                            : loan.status === 'rejected'
                            ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/40'
                            : loan.status === 'returned'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 animate-pulse'
                        }`}>
                          {loan.status === 'approved'
                            ? '✅ Approved / Ready at Lab'
                            : loan.status === 'rejected'
                            ? '❌ Requisition Declined'
                            : loan.status === 'returned'
                            ? '📦 Returned & Inspected'
                            : '⏳ Pending Lab Admin Review'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                        <strong className="text-slate-900 dark:text-white">Purpose:</strong> {loan.purpose}
                      </p>

                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                        <div className="flex items-center gap-4">
                          <span>Requisitioned: {new Date(loan.created_at).toLocaleDateString()}</span>
                          {loan.return_due_date && (
                            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Return Due: {new Date(loan.return_due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {loan.admin_notes && (
                          <span className="italic text-[11px] text-slate-600 dark:text-slate-300">
                            Admin Note: "{loan.admin_notes}"
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: PROJECT PROPOSALS
           ========================================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-sm dark:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      My Robotics Project Proposals
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Submit engineering proposals to get live showcase approval & research support
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsProposalModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit New Proposal</span>
                </button>
              </div>

              {myProposals.length === 0 ? (
                <div className="text-center py-12">
                  <Cpu className="w-12 h-12 mx-auto mb-3 text-slate-400/50" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No proposals submitted yet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Proposals allow you to pitch robotics builds directly to club leadership and feature them on the official JSTU showcase.
                  </p>
                  <button
                    onClick={() => setIsProposalModalOpen(true)}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    + Submit New Proposal
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myProposals.map((prop) => (
                    <div
                      key={prop.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            {prop.category}
                          </span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{prop.title}</h4>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider w-fit border ${
                          prop.approval_status === 'approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                            : prop.approval_status === 'rejected'
                            ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/40'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 animate-pulse'
                        }`}>
                          {prop.approval_status === 'approved'
                            ? '✅ Approved & Live on Showcase'
                            : prop.approval_status === 'rejected'
                            ? '❌ Rejected / Needs Revision'
                            : '⏳ Pending Super Admin Review'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                        {prop.description}
                      </p>

                      {prop.tech_stack && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(Array.isArray(prop.tech_stack) ? prop.tech_stack : JSON.parse(prop.tech_stack || '[]')).map((t: string) => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <span>Submitted on {new Date(prop.created_at || Date.now()).toLocaleDateString()}</span>
                        {prop.github_link && (
                          <a
                            href={prop.github_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>GitHub / CAD Repository</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            FULLSCREEN DIGITAL PASS MODAL
           ========================================================================= */}
        {isPassModalOpen && typeof document !== 'undefined' && createPortal(
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsPassModalOpen(false)}
          >
            <div 
              className="relative w-full max-w-md rounded-3xl bg-gradient-to-br from-[#0c1222] via-[#0f172a] to-[#1e1b4b] border border-indigo-500/40 p-6 sm:p-8 text-white shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setIsPassModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white text-xl font-black mx-auto mb-2 shadow-lg shadow-cyan-500/20">
                  🤖
                </div>
                <h3 className="text-lg font-black tracking-tight text-white">JSTU ROBOTICS CLUB</h3>
                <p className="text-[11px] font-mono uppercase text-cyan-400 tracking-wider">
                  Official Verified Pass · 2026
                </p>
              </div>

              {/* QR Image Box */}
              <div className="p-4 bg-white rounded-2xl mx-auto w-fit shadow-2xl">
                <img
                  src={qrCodeUrl}
                  alt="Member QR Code"
                  className="w-48 h-48 object-contain rounded"
                />
              </div>

              <div className="text-center mt-5 space-y-1">
                <h4 className="text-xl font-black text-white">{profile?.name}</h4>
                <p className="text-xs font-mono text-cyan-300">@{formData.username || profile?.username || 'member'}</p>
                <p className="text-xs text-slate-300">
                  {profile?.committee_role || 'General Member'} · {profile?.department}
                </p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                  ID: {profile?.student_id || `JSTU-${profile?.id}`}
                </span>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={handleCopyPassToken}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
                >
                  {copiedPassToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                  <span>{copiedPassToken ? 'Token Copied' : 'Copy Pass Token'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all"
                >
                  Print / Save Pass
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* =========================================================================
            SUBMIT PROJECT PROPOSAL MODAL
           ========================================================================= */}
        {isProposalModalOpen && typeof document !== 'undefined' && createPortal(
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsProposalModalOpen(false)}
          >
            <div 
              className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-xl w-full shadow-2xl max-h-[92vh] overflow-y-auto relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Submit New Project Proposal</h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Proposals go to Super Admin review before live publication</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsProposalModalOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {proposalStatus && (
                <div
                  className={`p-4 rounded-2xl mb-4 text-xs font-bold flex items-center gap-2 ${
                    proposalStatus.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/40 text-red-800 dark:text-red-300'
                  }`}
                >
                  {proposalStatus.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{proposalStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleProposalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swarm Quadrotor Synchronizer"
                    value={proposalForm.title}
                    onChange={e => setProposalForm({ ...proposalForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">
                    Robotics Category *
                  </label>
                  <select
                    value={proposalForm.category}
                    onChange={e => setProposalForm({ ...proposalForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Autonomous Terrestrial">Autonomous Terrestrial</option>
                    <option value="Aerial Robotics">Aerial Robotics</option>
                    <option value="Biomimetic Walking Robots">Biomimetic Walking Robots</option>
                    <option value="Competitive Robotics">Competitive Robotics</option>
                    <option value="Underwater & Submersibles">Underwater & Submersibles</option>
                    <option value="IoT & Automation">IoT & Automation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">
                    Abstract & Engineering Objective *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe problem, robotics architecture, sensors, mechanics, and expected innovation..."
                    value={proposalForm.description}
                    onChange={e => setProposalForm({ ...proposalForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">
                      Tech Stack (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ROS2, Python, LiDAR, OpenCV"
                      value={proposalForm.tech_stack}
                      onChange={e => setProposalForm({ ...proposalForm, tech_stack: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">
                      Co-Investigators / Team
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nahid Hasan, Tahmid Rayan"
                      value={proposalForm.team_members}
                      onChange={e => setProposalForm({ ...proposalForm, team_members: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">
                      GitHub Repo or CAD Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={proposalForm.github_link}
                      onChange={e => setProposalForm({ ...proposalForm, github_link: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">
                      Prototype / Robot Photo URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={proposalForm.image_url}
                      onChange={e => setProposalForm({ ...proposalForm, image_url: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProposalModalOpen(false)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingProposal}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center active:scale-98"
                  >
                    {isSubmittingProposal ? 'Submitting...' : 'Submit to Super Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </main>
    </div>
  );
};

export default MemberDashboard;
