import React, { useState, useEffect } from 'react';
import { CURRICULUM_DATA, TechSkillNode } from '../../data/curriculumData';
import { 
  Save, Plus, Edit2, Trash2, X, Check, Activity, Network, 
  BookOpen, Clock, User, Play, ExternalLink, Sparkles, CheckCircle2, Shield 
} from 'lucide-react';
import { AdminModalWrapper } from './AdminModalWrapper';

export const AdminTechTreeManager: React.FC = () => {
  const [nodes, setNodes] = useState<TechSkillNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingNode, setEditingNode] = useState<TechSkillNode | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/site-content')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.curriculum?.meta?.nodes && Array.isArray(data.data.curriculum.meta.nodes)) {
          setNodes(data.data.curriculum.meta.nodes);
        } else {
          setNodes(CURRICULUM_DATA);
        }
      })
      .catch(err => {
        console.error('Failed to load tech tree nodes', err);
        setNodes(CURRICULUM_DATA);
      })
      .finally(() => setLoading(false));
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async (updatedNodes?: TechSkillNode[]) => {
    const dataToSave = updatedNodes || nodes;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          key: 'curriculum',
          title: 'Curriculum Tech Tree & Courses Hub',
          content: 'Dynamic Robotics Curriculum and Course Offerings',
          meta: { nodes: dataToSave }
        })
      });
      if (!res.ok) throw new Error('Failed to save curriculum courses');
      showToast('success', 'Curriculum & course configurations saved live to database!');
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this course/node?')) {
      const updated = nodes.filter(n => n.id !== id);
      setNodes(updated);
      handleSave(updated);
    }
  };

  const handleEdit = (node: TechSkillNode) => {
    setEditingNode({
      ...node,
      syllabus: node.syllabus ? [...node.syllabus] : [],
      skillsAcquired: node.skillsAcquired ? [...node.skillsAcquired] : [],
      recommendedHardware: node.recommendedHardware ? [...node.recommendedHardware] : []
    });
  };

  const handleAddNew = () => {
    const newNode: TechSkillNode = {
      id: `course_${Date.now()}`,
      title: 'New Robotics Course',
      summary: 'Comprehensive overview and study objectives of this curriculum course...',
      track: 'autonomous',
      trackLabel: 'Autonomous & ROS2',
      level: 'Foundation',
      status: 'active',
      isLaunched: true,
      duration: '4 Weeks',
      instructor: 'JSTU Robotics Instructor',
      iconName: 'Network',
      skillsAcquired: ['Core Competency 1', 'Core Competency 2'],
      recommendedHardware: ['Embedded DevKit'],
      syllabus: [
        'Week 1: Fundamentals & Environment Setup',
        'Week 2: Core Architecture & Hands-on Implementation',
        'Week 3: Sensor Fusion & Telemetry Testing',
        'Week 4: Final Capstone Lab Project'
      ],
      docUrl: 'https://docs.ros.org/en/humble/',
      videoEmbedUrl: '',
      prerequisites: [],
      activeProjects: []
    };
    setEditingNode(newNode);
  };

  const toggleCourseStatus = (nodeId: string) => {
    const updated = nodes.map(n => {
      if (n.id === nodeId) {
        const nextStatus: 'active' | 'upcoming' | 'completed' = 
          n.status === 'active' ? 'upcoming' : n.status === 'upcoming' ? 'completed' : 'active';
        return { ...n, status: nextStatus, isLaunched: nextStatus === 'active' };
      }
      return n;
    });
    setNodes(updated);
    handleSave(updated);
  };

  const saveEdit = () => {
    if (!editingNode) return;
    let nextNodes: TechSkillNode[];
    const exists = nodes.some(n => n.id === editingNode.id);
    if (exists) {
      nextNodes = nodes.map(n => (n.id === editingNode.id ? editingNode : n));
    } else {
      nextNodes = [...nodes, editingNode];
    }
    setNodes(nextNodes);
    setEditingNode(null);
    handleSave(nextNodes);
  };

  // Syllabus helper methods
  const addSyllabusModule = () => {
    if (!editingNode) return;
    const current = editingNode.syllabus || [];
    setEditingNode({
      ...editingNode,
      syllabus: [...current, `Module ${current.length + 1}: Enter topic description...`]
    });
  };

  const updateSyllabusModule = (index: number, text: string) => {
    if (!editingNode) return;
    const current = [...(editingNode.syllabus || [])];
    current[index] = text;
    setEditingNode({ ...editingNode, syllabus: current });
  };

  const removeSyllabusModule = (index: number) => {
    if (!editingNode) return;
    const current = (editingNode.syllabus || []).filter((_, i) => i !== index);
    setEditingNode({ ...editingNode, syllabus: current });
  };

  const filteredList = nodes.filter(n => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'active') return n.status === 'active';
    if (selectedFilter === 'upcoming') return n.status === 'upcoming';
    if (selectedFilter === 'completed') return n.status === 'completed';
    return n.track === selectedFilter;
  });

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-mono">Loading Curriculum & Courses Manager...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className={`p-4 rounded-xl text-xs font-mono font-bold fixed top-20 right-6 z-50 shadow-xl border ${
          toastMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500 text-rose-400'
        }`}>
          {toastMessage.text}
        </div>
      )}

      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Curriculum Courses & Tech Tree CMS</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Launch courses for club members, curate syllabus topics, toggle cohort status, and provide documentation references.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Launch New Course</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200 dark:border-slate-800">
        {[
          { id: 'all', label: 'All Courses' },
          { id: 'active', label: 'Active / Launched' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Archived' },
          { id: 'embedded', label: 'Embedded Track' },
          { id: 'autonomous', label: 'Autonomous Track' },
          { id: 'cad', label: 'CAD Track' },
          { id: 'vision', label: 'Vision Track' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
              selectedFilter === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map(node => (
          <div
            key={node.id}
            className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {node.trackLabel}
                </span>

                {/* Status Toggle Button */}
                <button
                  onClick={() => toggleCourseStatus(node.id)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border transition-all ${
                    node.status === 'active'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : node.status === 'upcoming'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-500/10 border-slate-500/30 text-slate-500'
                  }`}
                  title="Click to toggle status (Active -> Upcoming -> Archived)"
                >
                  {node.status === 'active' ? '🟢 Active' : node.status === 'upcoming' ? '🟡 Upcoming' : '⚪ Archived'}
                </button>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                {node.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                {node.summary}
              </p>

              {/* Course Meta Info */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs font-mono text-slate-500">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Lead:</span>
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                    {node.instructor || 'JSTU Lead'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Duration:</span>
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {node.duration || '4 Weeks'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                    <span>Syllabus:</span>
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {node.syllabus?.length || 0} Modules
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400">
                Level: {node.level}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(node)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(node.id)}
                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Editor Modal */}
      {editingNode && (
        <AdminModalWrapper isOpen={!!editingNode} onClose={() => setEditingNode(null)}>
          <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 my-auto max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {nodes.some(n => n.id === editingNode.id) ? 'Edit Curriculum Course' : 'Create & Launch New Course'}
                </h3>
                <p className="text-xs text-slate-500">Configure course syllabus, launch status, lead instructor, and study links.</p>
              </div>
              <button onClick={() => setEditingNode(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={editingNode.title}
                    onChange={e => setEditingNode({ ...editingNode, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Launch Status
                  </label>
                  <select
                    value={editingNode.status || 'active'}
                    onChange={e => setEditingNode({ 
                      ...editingNode, 
                      status: e.target.value as any, 
                      isLaunched: e.target.value === 'active' 
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  >
                    <option value="active">Active · Open for Enrollment</option>
                    <option value="upcoming">Upcoming · Next Cohort</option>
                    <option value="completed">Archived · Self-Study</option>
                    <option value="draft">Draft · Internal Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Discipline Track
                  </label>
                  <select
                    value={editingNode.track}
                    onChange={e => {
                      const track = e.target.value as any;
                      const labels: Record<string, string> = {
                        embedded: 'Embedded Systems',
                        autonomous: 'Autonomous & ROS2',
                        cad: 'Mechanical & DFM',
                        vision: 'Edge AI & Vision'
                      };
                      setEditingNode({ ...editingNode, track, trackLabel: labels[track] || 'Robotics' });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  >
                    <option value="embedded">Embedded Systems</option>
                    <option value="autonomous">Autonomous & ROS2</option>
                    <option value="cad">Mechanical & DFM</option>
                    <option value="vision">Edge AI & Vision</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Proficiency Level
                  </label>
                  <select
                    value={editingNode.level}
                    onChange={e => setEditingNode({ ...editingNode, level: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  >
                    <option value="Foundation">Foundation</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={editingNode.duration || ''}
                    placeholder="e.g. 4 Weeks"
                    onChange={e => setEditingNode({ ...editingNode, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Instructor / Project Head
                  </label>
                  <input
                    type="text"
                    value={editingNode.instructor || ''}
                    placeholder="e.g. JSTU Autonomous Systems Lead"
                    onChange={e => setEditingNode({ ...editingNode, instructor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Documentation URL
                  </label>
                  <input
                    type="text"
                    value={editingNode.docUrl || ''}
                    placeholder="https://..."
                    onChange={e => setEditingNode({ ...editingNode, docUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Video Lecture / Lab Demonstration Embed URL (YouTube embed)
                </label>
                <input
                  type="text"
                  value={editingNode.videoEmbedUrl || ''}
                  placeholder="https://www.youtube.com/embed/..."
                  onChange={e => setEditingNode({ ...editingNode, videoEmbedUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Course Summary & Objectives
                </label>
                <textarea
                  rows={2}
                  value={editingNode.summary}
                  onChange={e => setEditingNode({ ...editingNode, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed"
                />
              </div>

              {/* Dynamic Syllabus Outline Editor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Course Syllabus & Study Modules ({editingNode.syllabus?.length || 0})</span>
                  </label>
                  <button
                    type="button"
                    onClick={addSyllabusModule}
                    className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Module</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editingNode.syllabus?.map((topic, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-mono text-xs font-black flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={topic}
                        onChange={e => updateSyllabusModule(idx, e.target.value)}
                        placeholder={`Week ${idx + 1}: Module description...`}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => removeSyllabusModule(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingNode(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
              >
                <Save className="w-4 h-4" />
                <span>Save & Launch Course</span>
              </button>
            </div>
          </div>
        </AdminModalWrapper>
      )}
    </div>
  );
};
