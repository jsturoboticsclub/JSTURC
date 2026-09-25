import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Cpu, Award, Github, Linkedin, Mail, Globe, 
  Layers, CheckCircle2, ShieldAlert, Sparkles, User 
} from 'lucide-react';
import JSTUHeader from '../components/JSTUHeader';

export const MemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/members/${id}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Member not found');
      } else {
        setMember(data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load member profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
        <JSTUHeader currentUser={currentUser} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 p-0.5 animate-spin">
              <div className="w-full h-full bg-white dark:bg-[#0D1424] rounded-[14px] flex items-center justify-center">
                <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Loading Roboticist Profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
        <JSTUHeader currentUser={currentUser} />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">Member Profile Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">{error || 'This member profile does not exist or has not been approved.'}</p>
          <Link
            to="/#directory"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Member Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 selection:bg-indigo-500 selection:text-white">
      <JSTUHeader currentUser={currentUser} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Link */}
        <Link
          to="/#directory"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Member Directory</span>
        </Link>

        {/* Member Profile Card */}
        <div className="bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-xl dark:shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-950/30 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-center md:items-start relative">
            {/* Avatar & Badges */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left flex-shrink-0">
              <div className="relative mb-3 sm:mb-4">
                <img
                  src={member.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.name)}`}
                  alt={member.name}
                  className="w-28 h-28 sm:w-40 sm:h-40 rounded-2xl sm:rounded-3xl object-cover border-4 border-indigo-500/40 shadow-xl"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.name)}`;
                  }}
                />
                <div className="absolute -bottom-2 -right-2 px-2.5 sm:px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[9px] sm:text-[10px] tracking-wider uppercase shadow-md">
                  {member.role}
                </div>
              </div>

              {/* Contact / Social Links */}
              <div className="flex items-center justify-center md:justify-start gap-2 mt-1 sm:mt-2">
                {member.contact_links?.github && (
                  <a
                    href={member.contact_links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
                    title="GitHub Profile"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {member.contact_links?.linkedin && (
                  <a
                    href={member.contact_links.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {member.contact_links?.email && (
                  <a
                    href={`mailto:${member.contact_links.email}`}
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
                    title="Send Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
                {member.contact_links?.website && (
                  <a
                    href={member.contact_links.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
                    title="Portfolio Website"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Profile Overview */}
            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 uppercase tracking-wider">
                  {member.committee_role}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  ID: {member.student_id || `JSTU-${member.id}`}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">
                {member.name}
              </h1>

              <p className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-5 sm:mb-6">
                {member.department} · Jamalpur Science and Technology University
              </p>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Roboticist Biography</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                  {member.bio || 'Member of the JSTU Robotics Club research team.'}
                </p>
              </div>

              {/* Robotics Skills */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  Technical & Engineering Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {member.skills && member.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 shadow-xs"
                    >
                      {skill}
                    </span>
                  ))}
                  {(!member.skills || member.skills.length === 0) && (
                    <span className="text-xs text-slate-400 italic">No skills listed yet.</span>
                  )}
                </div>
              </div>

              {/* Committee Tenures & Academic Sessions Served */}
              {member.committee_history && member.committee_history.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Committee Tenures & Sessions Served</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {member.committee_history.map((ch: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              Committee #{ch.committee_number}
                            </span>
                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                              (Session {ch.session_years})
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                            {ch.designation}
                          </span>
                        </div>
                        {ch.is_current === 1 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300 dark:border-emerald-600/40 flex-shrink-0">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                            Alumni Tenure
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Contributions Section */}
        <div className="bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-md">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Project Contributions</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Robotics prototypes, research tracks, and competition builds</p>
            </div>
          </div>

          <div className="space-y-3">
            {member.project_contributions && member.project_contributions.map((proj: string, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{proj}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">JSTU Robotics Lab Contribution</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">Active</span>
              </div>
            ))}

            {(!member.project_contributions || member.project_contributions.length === 0) && (
              <p className="text-xs text-slate-400 italic py-4 text-center">No specific projects assigned yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MemberDetailPage;
