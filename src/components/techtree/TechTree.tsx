import React, { useState, useEffect } from 'react';
import { CURRICULUM_DATA, TechSkillNode } from '../../data/curriculumData';
import { CourseDetailModal } from './CourseDetailModal';
import { 
  Cpu, Network, Box, Eye, Layers, Radio, ChevronRight, ExternalLink, 
  BookOpen, Wrench, Sparkles, CheckCircle2, Clock, User, Play, GraduationCap 
} from 'lucide-react';
import { CyberBadge, GlitchHeader } from '../common/CyberPrimitives';

const iconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
  Layers: <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
  Radio: <Radio className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
  Network: <Network className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
  Radar: <Radio className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
  Box: <Box className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
  Eye: <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
};

interface TechTreeProps {
  className?: string;
}

export const TechTree: React.FC<TechTreeProps> = ({ className = '' }) => {
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [inspectingCourse, setInspectingCourse] = useState<TechSkillNode | null>(null);
  const [nodes, setNodes] = useState<TechSkillNode[]>(CURRICULUM_DATA);

  useEffect(() => {
    fetch('/api/site-content')
      .then(r => r.json())
      .then(d => {
        if (d.data?.curriculum?.meta?.nodes && Array.isArray(d.data.curriculum.meta.nodes) && d.data.curriculum.meta.nodes.length > 0) {
          setNodes(d.data.curriculum.meta.nodes);
        }
      })
      .catch(() => {});
  }, []);

  const filteredNodes = selectedTrack === 'all'
    ? nodes
    : nodes.filter((node) => node.track === selectedTrack);

  const trackTabs = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'embedded', label: 'Embedded Systems' },
    { id: 'autonomous', label: 'Autonomous & ROS2' },
    { id: 'cad', label: 'Mechanical & DFM' },
    { id: 'vision', label: 'Edge AI & Vision' },
  ];

  const getLevelVariant = (level: string) => {
    switch (level) {
      case 'Foundation': return 'cyan';
      case 'Intermediate': return 'emerald';
      case 'Advanced': return 'amber';
      default: return 'crimson';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Course
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Upcoming
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <GlitchHeader
          tag="RESEARCH & ACADEMIC HUB"
          title="Curriculum Tech Tree & Courses"
          subtitle="Explore official courses and technical roadmaps launched by the JSTU Robotics Club. Open any course to read full syllabus modules, view lab hardware, and access documentation."
        />

        {/* Track Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs self-start md:self-auto transition-colors">
          {trackTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTrack(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 ${
                selectedTrack === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tech Tree Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNodes.map((node) => {
          return (
            <div
              key={node.id}
              onClick={() => setInspectingCourse(node)}
              className="cursor-pointer rounded-3xl p-6 border transition-all duration-300 relative group overflow-hidden bg-white dark:bg-[#0D1424]/90 hover:bg-slate-50 dark:hover:bg-[#0D1424] border-slate-200 dark:border-slate-800/90 hover:border-indigo-500/50 hover:-translate-y-1.5 shadow-sm dark:shadow-md hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between"
            >
              <div>
                {/* Top Bar with Icon and Badges */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 group-hover:border-indigo-500/40 transition-colors">
                    {iconMap[node.iconName] || <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(node.status)}
                    <CyberBadge variant={getLevelVariant(node.level) as any}>
                      {node.level}
                    </CyberBadge>
                  </div>
                </div>

                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                  {node.trackLabel}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors flex items-center justify-between font-mono">
                  <span>{node.title}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-1" />
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
                  {node.summary}
                </p>

                {/* Course Metadata Pill Row */}
                <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] font-mono text-slate-500">
                  {node.duration && (
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {node.duration}
                    </span>
                  )}
                  {node.syllabus && node.syllabus.length > 0 && (
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 px-2 py-0.5 rounded-md">
                      <BookOpen className="w-3 h-3 text-indigo-500" />
                      {node.syllabus.length} Modules
                    </span>
                  )}
                  {node.videoEmbedUrl && (
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 px-2 py-0.5 rounded-md text-purple-600 dark:text-purple-400 font-bold">
                      <Play className="w-3 h-3" />
                      Lecture Video
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 group-hover:underline">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Read Syllabus & Learn</span>
                </span>

                {node.docUrl && (
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                    <span>Docs</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={inspectingCourse}
        onClose={() => setInspectingCourse(null)}
      />
    </div>
  );
};
