import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, LayoutDashboard, Bell, ShieldCheck, Cpu, 
  Save, Sparkles, CheckCircle2, AlertCircle, ExternalLink, 
  Plus, X, Image as ImageIcon, Github, Linkedin, Mail, ArrowRight 
} from 'lucide-react';
import JSTUHeader from '../components/JSTUHeader';

export const MemberDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [myProposals, setMyProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Edit form state
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    student_id: '',
    bio: '',
    profile_photo: '',
    skillsString: '',
    github: '',
    linkedin: '',
  });

  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      setLoading(true);
      const res = await fetch('/api/member/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          navigate('/auth');
          return;
        }
        throw new Error('Failed to load dashboard');
      }

      const data = await res.json();
      const p = data.data.profile;
      setProfile(p);
      setAnnouncements(data.data.announcements || []);
      setActiveProjects(data.data.activeProjects || []);
      setMyProposals(data.data.myProposals || []);

      setFormData({
        name: p.name || '',
        department: p.department || '',
        student_id: p.student_id || '',
        bio: p.bio || '',
        profile_photo: p.profile_photo || '',
        skillsString: p.skills ? p.skills.join(', ') : '',
        github: p.contact_links?.github || '',
        linkedin: p.contact_links?.linkedin || '',
      });
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
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
        email: profile.email,
        github: formData.github.trim(),
        linkedin: formData.linkedin.trim()
      };

      const res = await fetch('/api/member/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          department: formData.department,
          student_id: formData.student_id,
          bio: formData.bio,
          profile_photo: formData.profile_photo,
          skills: skillsArray,
          contact_links
        })
      });

      const result = await res.json();
      if (!res.ok) {
        setSaveStatus({ success: false, message: result.error || 'Failed to save profile' });
      } else {
        setSaveStatus({ success: true, message: result.message });
        setProfile(result.data);
        localStorage.setItem('user', JSON.stringify(result.data));
      }
    } catch (err: any) {
      setSaveStatus({ success: false, message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 uppercase tracking-wider">
                Member User Panel
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                profile?.status === 'approved'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
              }`}>
                ● Status: {profile?.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome back, {profile?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Role: <strong className="text-indigo-600 dark:text-indigo-400">{profile?.committee_role}</strong> ({profile?.role}) · {profile?.department}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsProposalModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Project Proposal</span>
            </button>

            <Link
              to={`/members/${profile?.id}`}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>View Public Directory Card</span>
              <ExternalLink className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left 2 Columns: Profile Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-sm dark:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Edit Your Public Member Card</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Updates will sync live across the JSTU directory</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-slate-400">
                  ID: {profile?.student_id || `JSTU-${profile?.id}`}
                </span>
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

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                      Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                      Student ID / Roll
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. JSTU-EEE-20111221"
                      value={formData.student_id}
                      onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Profile Photo URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.profile_photo}
                      onChange={e => setFormData({ ...formData, profile_photo: e.target.value })}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                    {formData.profile_photo && (
                      <img
                        src={formData.profile_photo}
                        alt="Preview"
                        className="w-11 h-11 rounded-xl object-cover border-2 border-indigo-500/40 shadow-xs"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Robotics Skills (comma-separated tags)
                  </label>
                  <input
                    type="text"
                    placeholder="ROS2, Python, C++, Arduino, SolidWorks, KiCad..."
                    value={formData.skillsString}
                    onChange={e => setFormData({ ...formData, skillsString: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    These appear as skill badges on your public directory card and member profile.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Roboticist Bio & Contributions
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your engineering passions, projects you worked on, or lab responsibilities..."
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={formData.github}
                      onChange={e => setFormData({ ...formData, github: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={formData.linkedin}
                      onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving Changes...' : 'Save & Update Public Card'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Member's Submitted Project Proposals */}
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-sm dark:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">My Robotics Project Proposals</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Track review status of your submitted project proposals</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsProposalModalOpen(true)}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1 shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Proposal</span>
                </button>
              </div>

              {myProposals.length === 0 ? (
                <div className="text-center py-6">
                  <Cpu className="w-10 h-10 mx-auto mb-2 text-slate-400/60" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">You haven't submitted any project proposals yet.</p>
                  <button
                    onClick={() => setIsProposalModalOpen(true)}
                    className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Submit your first robotics proposal
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myProposals.map((prop) => (
                    <div
                      key={prop.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            {prop.category}
                          </span>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">{prop.title}</h3>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider w-fit border ${
                          prop.approval_status === 'approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                            : prop.approval_status === 'rejected'
                            ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/40'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 animate-pulse'
                        }`}>
                          {prop.approval_status === 'approved'
                            ? '✅ Approved & Published Live'
                            : prop.approval_status === 'rejected'
                            ? '❌ Rejected / Needs Revision'
                            : '⏳ Pending Super Admin Review'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                        {prop.description}
                      </p>

                      {prop.tech_stack && (
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(prop.tech_stack) ? prop.tech_stack : JSON.parse(prop.tech_stack || '[]')).map((t: string) => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Announcements & Status */}
          <div className="space-y-6">
            {/* Announcements Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-sm dark:shadow-md">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Club Announcements</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Broadcasts from Committee</p>
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
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">{a.title}</h4>
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
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800/90 shadow-sm dark:shadow-md">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Lab Projects</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Current JSTU Robotics builds</p>
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

        {/* Submit Project Proposal Modal */}
        {isProposalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-xl w-full shadow-2xl max-h-[92vh] overflow-y-auto relative">
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
                    Project Proposal Description & Mission *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe robot capabilities, mechanical structure, sensor payload, and real-world application..."
                    value={proposalForm.description}
                    onChange={e => setProposalForm({ ...proposalForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">
                      Tech Stack (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="ROS2, Python, LiDAR, OpenCV, STM32..."
                      value={proposalForm.tech_stack}
                      onChange={e => setProposalForm({ ...proposalForm, tech_stack: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">
                      Team Members (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Tanvir, Nusrat, Fahim..."
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
          </div>
        )}
      </main>
    </div>
  );
};

export default MemberDashboard;
