import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ShieldCheck, Users, Search, ArrowRight, Award, Calendar, 
  ExternalLink, Sparkles, ChevronRight, Layers, ArrowLeft,
  CheckCircle2, Clock, Cpu, Filter, Eye
} from 'lucide-react';
import JSTUHeader from '../components/JSTUHeader';

interface CommitteeItem {
  id: number;
  committee_number: number;
  title: string;
  session_years: string;
  is_current: number;
  theme_motto?: string;
  description?: string;
  banner_url?: string;
  total_members_count?: number;
  president_name?: string;
  advisor_name?: string;
}

interface CommitteeMember {
  id: number;
  committee_id: number;
  user_id?: number;
  name: string;
  email?: string;
  department?: string;
  student_id?: string;
  designation: string;
  category: 'Executive' | 'Lead' | 'Advisor' | 'Member';
  is_override?: number;
  profile_photo?: string;
  bio?: string;
  skills?: string[];
  social_links?: any;
  display_order?: number;
}

export const CommitteesPage: React.FC = () => {
  const { id: paramId } = useParams<{ id?: string }>();
  const [committees, setCommittees] = useState<CommitteeItem[]>([]);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<number | null>(null);
  const [committeeDetails, setCommitteeDetails] = useState<CommitteeItem | null>(null);
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [counts, setCounts] = useState<{ total: number; executive: number; leads: number; advisors: number; members: number }>({
    total: 0,
    executive: 0,
    leads: 0,
    advisors: 0,
    members: 0
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Current session
  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  useEffect(() => {
    fetchCommittees();
  }, []);

  const fetchCommittees = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/committees');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setCommittees(data.data);
        
        // Pick committee based on paramId or default to is_current
        let target = null;
        if (paramId) {
          target = data.data.find((c: CommitteeItem) => c.id.toString() === paramId || c.committee_number.toString() === paramId);
        }
        if (!target) {
          target = data.data.find((c: CommitteeItem) => c.is_current === 1) || data.data[0];
        }

        if (target) {
          setSelectedCommitteeId(target.id);
          fetchCommitteeDetails(target.id);
        }
      }
    } catch (err) {
      console.error('Error fetching committees:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommitteeDetails = async (committeeId: number) => {
    try {
      const res = await fetch(`/api/committees/${committeeId}`);
      const data = await res.json();
      if (data.success) {
        setCommitteeDetails(data.committee);
        setMembers(data.members || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error('Error fetching committee details:', err);
    }
  };

  const handleSelectCommittee = (c: CommitteeItem) => {
    setSelectedCommitteeId(c.id);
    fetchCommitteeDetails(c.id);
    setSelectedCategory('All');
    setSearchQuery('');
  };

  // Filtered members list
  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      m.name.toLowerCase().includes(q) ||
      m.designation.toLowerCase().includes(q) ||
      (m.department && m.department.toLowerCase().includes(q)) ||
      (m.skills && m.skills.some((s: string) => s.toLowerCase().includes(q)));

    if (!matchesSearch) return false;

    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Executive') return m.category === 'Executive';
    if (selectedCategory === 'Lead') return m.category === 'Lead';
    if (selectedCategory === 'Advisor') return m.category === 'Advisor';
    if (selectedCategory === 'Member') return m.category === 'Member';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <JSTUHeader currentUser={currentUser} />

      {/* Hero Banner */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200 dark:border-slate-800/80 overflow-hidden bg-white/50 dark:bg-slate-950/40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-indigo-500/10 via-purple-500/15 to-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-black mb-4 shadow-xs">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>LEADERSHIP ARCHIVE & TENURE REGISTRY</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Committees & Executive Councils
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl font-normal">
              Every academic year, the JSTU Robotics Club passes leadership to an elected executive council, engineering leads, and faculty mentors. Explore past and present committee tenures below.
            </p>

            {currentUser?.role === 'Admin' && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/admin?tab=committees"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>👑 Admin: Manage & Create Committees</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        
        {/* Committee Tenures Grid / Selector */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Select Committee Tenure</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any committee number below to inspect its leadership body and members
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">
              {committees.length} Tenures Recorded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {committees.map((c) => {
              const isSelected = selectedCommitteeId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectCommittee(c)}
                  className={`text-left p-5 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/30 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                      : 'bg-white dark:bg-[#0D1424] border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-indigo-600 text-white">
                        Committee #{c.committee_number}
                      </span>
                      {c.is_current === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Active Tenure</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800">
                          Archived Tenure
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                      Session: {c.session_years}
                    </p>

                    {c.theme_motto && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2 mb-3">
                        "{c.theme_motto}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>👥 {c.total_members_count || 0} Members</span>
                    {c.president_name && (
                      <span className="font-bold truncate max-w-[140px] text-slate-700 dark:text-slate-300">
                        Pres: {c.president_name}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Committee Details & Member Roster */}
        {committeeDetails && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md space-y-8">
            
            {/* Committee Overview Banner */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-indigo-600 text-white">
                    Committee #{committeeDetails.committee_number}
                  </span>
                  <span className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                    Session {committeeDetails.session_years}
                  </span>
                  {committeeDetails.is_current === 1 && (
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Currently Running
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {committeeDetails.title}
                </h2>

                {committeeDetails.theme_motto && (
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    Theme / Vision: {committeeDetails.theme_motto}
                  </p>
                )}

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {committeeDetails.description || 'Official committee governing robotics research, laboratory operations, and member development.'}
                </p>
              </div>

              {/* Quick Stat Counter Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-2.5 w-full md:w-auto flex-shrink-0">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-lg font-black text-slate-900 dark:text-white block">{counts.total}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Body</span>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 text-center">
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 block">{counts.executive}</span>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase">Executive</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40 text-center">
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 block">{counts.leads}</span>
                  <span className="text-[10px] font-bold text-amber-500 uppercase">Leads</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-center">
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block">{counts.advisors}</span>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase">Advisors</span>
                </div>
              </div>
            </div>

            {/* Category Filter Pills & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 sm:pb-0">
                {[
                  { label: 'All Members', value: 'All', count: counts.total },
                  { label: '👑 Executive Council', value: 'Executive', count: counts.executive },
                  { label: '⚡ Technical Leads', value: 'Lead', count: counts.leads },
                  { label: '🎓 Faculty Advisors', value: 'Advisor', count: counts.advisors },
                  { label: '👤 General Members', value: 'Member', count: counts.members }
                ].map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${
                      selectedCategory === cat.value
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                        : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[10px] opacity-80 font-mono">({cat.count})</span>
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, role, department..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>
            </div>

            {/* Member Cards Grid */}
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm">No members found matching the selected filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMembers.map(m => {
                  let categoryBadge = {
                    text: 'Core Member',
                    style: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  };
                  if (m.category === 'Advisor') {
                    categoryBadge = {
                      text: '🎓 Faculty Advisor',
                      style: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    };
                  } else if (m.category === 'Executive') {
                    categoryBadge = {
                      text: '👑 Executive Council',
                      style: 'bg-gradient-to-r from-purple-500/15 to-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                    };
                  } else if (m.category === 'Lead') {
                    categoryBadge = {
                      text: '⚡ Technical Lead',
                      style: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    };
                  }

                  return (
                    <div
                      key={m.id}
                      className="p-5 rounded-3xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Member Header with Photo & Badge */}
                        <div className="flex items-start gap-3.5 mb-3.5">
                          <img
                            src={m.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.name}`}
                            alt={m.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/20 group-hover:border-indigo-500 transition-colors shadow-sm"
                          />
                          <div className="flex-1 min-w-0">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border mb-1.5 ${categoryBadge.style}`}>
                              {categoryBadge.text}
                            </span>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {m.name}
                            </h4>
                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 leading-tight">
                              {m.designation}
                            </p>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 truncate">
                          {m.department || 'Jamalpur Science and Technology University'}
                        </p>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed font-normal">
                          {m.bio || 'Active researcher and engineer advancing autonomous robotics systems at JSTU.'}
                        </p>

                        {/* Skills */}
                        {m.skills && m.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {m.skills.slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700"
                              >
                                {s}
                              </span>
                            ))}
                            {m.skills.length > 3 && (
                              <span className="text-[10px] font-mono text-slate-400 self-center">
                                +{m.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Details */}
                      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-mono text-slate-500">
                          {m.student_id ? `ID: ${m.student_id}` : `Tenure: #${committeeDetails.committee_number}`}
                        </span>

                        <Link
                          to={`/members/${m.user_id || m.id}`}
                          className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline text-xs"
                        >
                          <span>Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default CommitteesPage;
