import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Cpu, Award, Github, Linkedin, Mail, Globe, 
  Layers, CheckCircle2, ShieldAlert, Sparkles, User,
  GraduationCap, BookOpen, Twitter, Share2, Check, ExternalLink,
  Edit3, Compass, Trophy, Bookmark, School, CheckCircle, Camera
} from 'lucide-react';
import JSTUHeader from '../components/JSTUHeader';
import { getStoredUser } from '../lib/auth';

export const MemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentUser = getStoredUser();

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

  const handleShare = () => {
    if (navigator.clipboard && member) {
      const shareUrl = member.username
        ? `${window.location.origin}/${member.username}`
        : `${window.location.origin}/members/${member.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
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
            to="/"
            state={{ scrollTo: 'directory' }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Member Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const contactLinks = typeof member.contact_links === 'string'
    ? (() => { try { return JSON.parse(member.contact_links); } catch(e) { return {}; } })()
    : (member.contact_links || {});

  const researchInterests: string[] = Array.isArray(member.research_interests)
    ? member.research_interests
    : typeof member.research_interests === 'string'
    ? (() => { try { return JSON.parse(member.research_interests); } catch(e) { return member.research_interests.split(',').map((s: string) => s.trim()).filter(Boolean); } })()
    : [];

  const achievements: any[] = Array.isArray(member.achievements)
    ? member.achievements
    : typeof member.achievements === 'string'
    ? (() => { try { return JSON.parse(member.achievements); } catch(e) { return []; } })()
    : [];

  const isOwnerOrAdmin = currentUser && (
    currentUser.id === member.id ||
    currentUser.student_id === member.student_id ||
    currentUser.role === 'admin'
  );

  const hasScholarlyLinks = contactLinks.github || contactLinks.linkedin || contactLinks.google_scholar || contactLinks.researchgate || contactLinks.website || contactLinks.twitter || contactLinks.email;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 selection:bg-indigo-500 selection:text-white">
      <JSTUHeader currentUser={currentUser} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Navigation & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link
            to="/"
            state={{ scrollTo: 'directory' }}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Member Directory</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-xs transition-all active:scale-95"
              title="Copy public profile link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Profile</span>
                </>
              )}
            </button>

            {isOwnerOrAdmin && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Link>
            )}
          </div>
        </div>

        {/* Hero Cover Banner & Identity Header */}
        <div className="bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xl dark:shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-950/30 overflow-hidden mb-8">
          {/* Cover Banner */}
          <div className="relative h-44 sm:h-56 md:h-64 w-full bg-slate-900 overflow-hidden">
            {member.cover_photo ? (
              <img
                src={member.cover_photo}
                alt={`${member.name} Cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 relative">
                {/* Algorithmic circuit pattern fallback */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-indigo-300 font-mono text-[10px] tracking-wider uppercase">
                  <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span>JSTU Robotics Lab</span>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            
            {isOwnerOrAdmin && (
              <Link
                to="/dashboard"
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/85 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-all shadow-lg active:scale-95 z-10"
                title="Change cover banner in your dashboard"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Change Cover</span>
              </Link>
            )}
          </div>

          {/* Profile Identity Details (Negative margin overlay) */}
          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-end -mt-16 sm:-mt-20 mb-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0 group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl p-1 bg-white dark:bg-[#0D1424] shadow-2xl relative">
                  <img
                    src={member.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.name)}`}
                    alt={member.name}
                    className="w-full h-full rounded-[22px] object-cover border-2 border-indigo-500/40 shadow-inner"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.name)}`;
                    }}
                  />
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-extrabold text-[9px] sm:text-[10px] tracking-wider uppercase shadow-md whitespace-nowrap">
                    {member.role || 'Member'}
                  </div>
                </div>
              </div>

              {/* Title & Headline */}
              <div className="flex-1 text-center md:text-left pt-2 md:pt-0">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 uppercase tracking-wider">
                    {member.committee_role || 'Active Member'}
                  </span>
                  {member.username && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                      @{member.username}
                    </span>
                  )}
                  {member.student_id && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      ID: {member.student_id}
                    </span>
                  )}
                  {member.session && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40">
                      Session: {member.session}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                  {member.name}
                </h1>

                {/* Professional Headline */}
                {member.headline ? (
                  <p className="text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400 max-w-3xl leading-snug">
                    {member.headline}
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {member.department || 'Engineering Student'} · Jamalpur Science and Technology University
                  </p>
                )}
              </div>
            </div>

            {/* Social & Scholarly Links Strip */}
            {hasScholarlyLinks && (
              <div className="pt-5 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
                {contactLinks.github && (
                  <a
                    href={contactLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-900 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-xs group"
                  >
                    <Github className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 group-hover:text-white" />
                    <span>GitHub</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}
                {contactLinks.linkedin && (
                  <a
                    href={contactLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-300 text-xs font-bold transition-all shadow-xs group border border-blue-200/50 dark:border-blue-900/40"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}
                {contactLinks.google_scholar && (
                  <a
                    href={contactLinks.google_scholar}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all shadow-xs group border border-indigo-200/50 dark:border-indigo-900/40"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:text-white" />
                    <span>Google Scholar</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}
                {contactLinks.researchgate && (
                  <a
                    href={contactLinks.researchgate}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all shadow-xs group border border-emerald-200/50 dark:border-emerald-900/40"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                    <span>ResearchGate</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}
                {contactLinks.website && (
                  <a
                    href={contactLinks.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-300 text-xs font-bold transition-all shadow-xs group border border-purple-200/50 dark:border-purple-900/40"
                  >
                    <Globe className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:text-white" />
                    <span>Portfolio</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}
                {contactLinks.twitter && (
                  <a
                    href={contactLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-sky-500 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-xs group"
                  >
                    <Twitter className="w-3.5 h-3.5 group-hover:text-white" />
                    <span>X / Twitter</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}
                {contactLinks.email && (
                  <a
                    href={`mailto:${contactLinks.email}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Contact Email</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column (Biography, Research Focus, Honors & Awards, Projects) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biography */}
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4 text-slate-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h2 className="text-base font-extrabold tracking-wide uppercase">Roboticist Biography</h2>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                {member.bio || 'Member of the Jamalpur Science and Technology University (JSTU) Robotics Club, actively contributing to technical developments and research.'}
              </p>
            </div>

            {/* Research & Technical Focus Tracks */}
            {researchInterests.length > 0 && (
              <div className="bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4 text-slate-900 dark:text-white">
                  <Compass className="w-4 h-4 text-cyan-500" />
                  <div>
                    <h2 className="text-base font-extrabold tracking-wide uppercase">Research & Technical Focus</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Specialized technical interests and robotics domains</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {researchInterests.map((interest: string, idx: number) => (
                    <div
                      key={idx}
                      className="px-3.5 py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-transparent border border-indigo-500/25 dark:border-indigo-400/20 text-indigo-700 dark:text-indigo-300 flex items-center gap-2 shadow-xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>{interest}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Honors, Awards & Certifications */}
            {achievements.length > 0 && (
              <div className="bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <div>
                      <h2 className="text-base font-extrabold tracking-wide uppercase">Honors, Awards & Certifications</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Recognitions, competition victories, and verified credentials</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                    {achievements.length} Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {achievements.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.issuer || 'Awarded Credential'} {item.year ? `· ${item.year}` : ''}
                          </p>
                        </div>
                      </div>

                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 self-start sm:self-center transition-colors"
                        >
                          <span>Credential</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Contributions */}
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold tracking-wide uppercase text-slate-900 dark:text-white">Project Contributions</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Robotics prototypes, hardware setups, and research builds</p>
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
          </div>

          {/* Sidebar Column (Technical Skills, Academic Info, Committee History) */}
          <div className="space-y-8">
            {/* Academic & University Profile */}
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
                <School className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Academic Affiliation
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">University</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Jamalpur Science & Technology University</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Department</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{member.department || 'Not specified'}</span>
                </div>

                {member.session && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Academic Session</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{member.session}</span>
                  </div>
                )}

                {member.student_id && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Student ID</span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{member.student_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Skills */}
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                <span>Technical Skills</span>
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

            {/* Committee Tenures & Academic Sessions */}
            {member.committee_history && member.committee_history.length > 0 && (
              <div className="bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Committee Tenures</span>
                </h3>
                <div className="space-y-2.5">
                  {member.committee_history.map((ch: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            Committee #{ch.committee_number}
                          </span>
                          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            ({ch.session_years})
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
                          Alumni
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MemberDetailPage;

