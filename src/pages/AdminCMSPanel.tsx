import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Users, Edit3, Trash2, CheckCircle2, 
  XCircle, Plus, Save, AlertCircle, RefreshCw, 
  Layers, Bell, Tag, FileText, Globe, ArrowLeft, Cpu,
  Sliders, ToggleLeft, ToggleRight, Sparkles, Layout, Eye, EyeOff, Calendar,
  Landmark, Copy, Crown, Award, Check, ExternalLink, GraduationCap, ChevronRight, Camera, Upload
} from 'lucide-react';
import JSTUHeader from '../components/JSTUHeader';
import { fileToBase64Image } from '../utils/imageHelper';

export const AdminCMSPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'superpower' | 'committees' | 'content' | 'users' | 'projects' | 'roles' | 'announcements'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash.includes('cms_') || window.location.search.includes('tab=content')) {
        return 'content';
      }
      if (window.location.search.includes('tab=committees')) {
        return 'committees';
      }
    }
    return 'superpower';
  });
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleImageFileToBase64 = async (file: File, onSuccess: (base64: string) => void) => {
    try {
      const base64 = await fileToBase64Image(file);
      onSuccess(base64);
      showToast('success', 'Image processed & ready to save!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to process image');
    }
  };

  // Current admin session
  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  // Data states
  const [siteContent, setSiteContent] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [editingAgendaItem, setEditingAgendaItem] = useState<any | null>(null);
  const [newAgendaItem, setNewAgendaItem] = useState({
    title: '',
    description: '',
    date: '',
    badge: 'Workshop',
    order_num: 0
  });

  // Committee Management States
  const [committees, setCommittees] = useState<any[]>([]);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<number | null>(null);
  const [committeeMembers, setCommitteeMembers] = useState<any[]>([]);
  const [committeeDetails, setCommitteeDetails] = useState<any | null>(null);
  const [committeeSearch, setCommitteeSearch] = useState('');
  const [committeeCategoryFilter, setCommitteeCategoryFilter] = useState<'All' | 'Executive' | 'Lead' | 'Advisor' | 'Member'>('All');

  // Committee Modals
  const [isAddCommitteeModalOpen, setIsAddCommitteeModalOpen] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<any | null>(null);
  const [newCommittee, setNewCommittee] = useState({
    committee_number: 1,
    title: '',
    session_years: '',
    is_current: 0,
    theme_motto: '',
    description: '',
    banner_url: ''
  });

  // Committee Member Modals
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [editingCommitteeMember, setEditingCommitteeMember] = useState<any | null>(null);
  const [newCommitteeMember, setNewCommitteeMember] = useState<{
    user_id: string;
    name: string;
    email: string;
    department: string;
    student_id: string;
    designation: string;
    category: string;
    bio: string;
    skills: string;
    profile_photo: string;
    display_order: number;
    target_committee_ids: number[];
  }>({
    user_id: '',
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    student_id: '',
    designation: '',
    category: 'Auto',
    bio: '',
    skills: '',
    profile_photo: '',
    display_order: 0,
    target_committee_ids: []
  });

  // User Session Multi-Committee Assignment Modal
  const [assigningSessionUser, setAssigningSessionUser] = useState<any | null>(null);
  const [assignedSessionIds, setAssignedSessionIds] = useState<number[]>([]);
  const [assignedSessionRole, setAssignedSessionRole] = useState<string>('');
  const [assignedSessionCategory, setAssignedSessionCategory] = useState<string>('Auto');

  // Clone past committee
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState<number | ''>('');

  // Dynamic Custom Categories for Committees
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jstu_custom_committee_categories');
      return saved ? JSON.parse(saved) : ['Executive', 'Lead', 'Advisor', 'Member'];
    } catch (e) {
      return ['Executive', 'Lead', 'Advisor', 'Member'];
    }
  });
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const handleCreateNewCategory = (catName: string) => {
    const trimmed = catName.trim();
    if (!trimmed) return;
    if (!customCategories.includes(trimmed)) {
      const updated = [...customCategories, trimmed];
      setCustomCategories(updated);
      try { localStorage.setItem('jstu_custom_committee_categories', JSON.stringify(updated)); } catch (e) {}
    }
    setCommitteeCategoryFilter(trimmed);
    showToast('success', `Category "${trimmed}" created!`);
    setIsCreateCategoryModalOpen(false);
    setNewCategoryName('');
  };

  // Superpower State
  const [superConfig, setSuperConfig] = useState<any>({
    branding: {
      title: 'JSTU Robotics Club',
      badge: 'BOTS & BEYOND',
      subtitle: 'Jamalpur Science and Technology University',
      image_url: ''
    },
    footer: {
      title: 'Jamalpur Science and Technology University Robotics Club',
      description: 'Official robotics, autonomous systems, and intelligent automation research club at JSTU.',
      copyright: '© 2026 Jamalpur Science and Technology University Robotics Club · Powered by SQLite Relational Core'
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
    project_categories: ['All', 'Autonomous Terrestrial', 'Aerial Robotics', 'Biomimetic Walking Robots', 'Competitive Robotics'],
    directory_categories: ['All', 'Executive', 'Leads']
  });

  const [newProjectCategory, setNewProjectCategory] = useState('');
  const [newDirCategory, setNewDirCategory] = useState('');

  // User search & filters
  const [userSearch, setUserSearch] = useState('');

  // Edit User modal state
  const [editingUser, setEditingUser] = useState<any>(null);

  // Edit Project modal state
  const [editingProject, setEditingProject] = useState<any>(null);

  // New Project form state
  const [newProject, setNewProject] = useState({
    title: '',
    category: 'Autonomous Terrestrial',
    description: '',
    status: 'Active',
    image_url: '',
    github_link: '',
    tech_stack: '',
    team_members: ''
  });

  // New Role state
  const [newRole, setNewRole] = useState({ name: '', priority: 5, category: 'Technical' });

  // New Announcement state
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'normal' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === 'portfolio-demo-token') {
      if (token === 'portfolio-demo-token') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('authUser');
      }
      navigate('/auth?redirect=/admin');
      return;
    }

    if (currentUser && currentUser.role !== 'Admin') {
      navigate('/dashboard');
      return;
    }

    fetchAllAdminData();

    if (typeof window !== 'undefined' && window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(hashId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchAllAdminData = async () => {
    try {
      setLoading(true);
      const [contentRes, usersRes, projectsRes, rolesRes, dashRes, proposalsRes, agendaRes, committeesRes] = await Promise.all([
        fetch('/api/site-content').then(r => r.json()),
        fetch('/api/admin/users', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/roles').then(r => r.json()),
        fetch('/api/member/dashboard', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/admin/project-proposals', { headers: getHeaders() }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/agenda').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/committees').then(r => r.json()).catch(() => ({ success: false, data: [] }))
      ]);

      if (usersRes.status === 401 || (usersRes.error && usersRes.error.includes('expired'))) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth?redirect=/admin');
        return;
      }

      if (usersRes.error && (usersRes.error.includes('privileges') || usersRes.error.includes('Administrator privileges required') || usersRes.error.includes('Forbidden'))) {
        navigate('/dashboard');
        return;
      }

      if (contentRes.success) {
        setSiteContent(contentRes.data);
        if (contentRes.data.site_config?.meta) {
          setSuperConfig((prev: any) => ({
            ...prev,
            ...contentRes.data.site_config.meta,
            branding: contentRes.data.site_config.meta.branding || contentRes.data.branding?.meta || prev.branding,
            footer: contentRes.data.site_config.meta.footer || prev.footer
          }));
        }
      }
      if (usersRes.success) setUsers(usersRes.data);
      if (projectsRes.success) setProjects(projectsRes.data);
      if (proposalsRes && proposalsRes.success) setProposals(proposalsRes.data);
      if (rolesRes.success) setRoles(rolesRes.data);
      if (dashRes.success) setAnnouncements(dashRes.data.announcements || []);
      if (agendaRes && agendaRes.success) setAgenda(agendaRes.data);
      if (committeesRes && committeesRes.success) {
        setCommittees(committeesRes.data);
        if (committeesRes.data.length > 0) {
          setSelectedCommitteeId(prev => {
            if (prev && committeesRes.data.some((c: any) => c.id === prev)) return prev;
            const current = committeesRes.data.find((c: any) => c.is_current === 1);
            return current ? current.id : committeesRes.data[0].id;
          });
        }
      }
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommitteeDetails = async (cId: number) => {
    try {
      const res = await fetch(`/api/committees/${cId}`);
      const data = await res.json();
      if (data.success) {
        setCommitteeDetails(data.committee || data.data);
        setCommitteeMembers(data.members || data.data?.members || []);
      }
    } catch (err) {
      console.error('Error fetching committee details:', err);
    }
  };

  useEffect(() => {
    if (selectedCommitteeId) {
      fetchCommitteeDetails(selectedCommitteeId);
    }
  }, [selectedCommitteeId]);

  useEffect(() => {
    if (committeeMembers && committeeMembers.length > 0) {
      const found = committeeMembers.map((m: any) => m.category).filter(Boolean);
      const merged = Array.from(new Set([...customCategories, ...found]));
      if (merged.length > customCategories.length) {
        setCustomCategories(merged);
        try { localStorage.setItem('jstu_custom_committee_categories', JSON.stringify(merged)); } catch (e) {}
      }
    }
  }, [committeeMembers]);


  const showToast = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // --- Superpower Site Config Handler ---
  const handleSaveSuperConfig = async () => {
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ config: superConfig })
      });
      const data = await res.json();
      if (res.ok) {
        // Also persist branding explicitly
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
        showToast('success', '👑 Superpower configuration & logo branding saved! Live on public landing page.');
      } else {
        showToast('error', data.error || 'Failed to update site configuration');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const addProjectCategory = () => {
    if (!newProjectCategory.trim()) return;
    if (superConfig.project_categories.includes(newProjectCategory.trim())) return;
    const updated = {
      ...superConfig,
      project_categories: [...superConfig.project_categories, newProjectCategory.trim()]
    };
    setSuperConfig(updated);
    setNewProjectCategory('');
  };

  const removeProjectCategory = (cat: string) => {
    if (cat === 'All') return;
    const updated = {
      ...superConfig,
      project_categories: superConfig.project_categories.filter((c: string) => c !== cat)
    };
    setSuperConfig(updated);
  };

  const addDirCategory = () => {
    if (!newDirCategory.trim()) return;
    if (superConfig.directory_categories.includes(newDirCategory.trim())) return;
    const updated = {
      ...superConfig,
      directory_categories: [...superConfig.directory_categories, newDirCategory.trim()]
    };
    setSuperConfig(updated);
    setNewDirCategory('');
  };

  const removeDirCategory = (cat: string) => {
    if (cat === 'All') return;
    const updated = {
      ...superConfig,
      directory_categories: superConfig.directory_categories.filter((c: string) => c !== cat)
    };
    setSuperConfig(updated);
  };

  // --- Content Management Handlers ---
  const handleSaveContent = async (key: string, title: string, content: string, meta?: any) => {
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ key, title, content, meta })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', `Saved '${key}'! Changes are live on the public landing page.`);
        setSiteContent((prev: any) => ({
          ...prev,
          [key]: {
            ...prev[key],
            title,
            content,
            meta: meta || prev[key]?.meta
          }
        }));
      } else {
        showToast('error', data.error || 'Failed to update content');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // --- Agenda Milestones Handlers ---
  const handleAddAgendaItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/agenda', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newAgendaItem)
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', '✨ New milestone event created and published live!');
        setNewAgendaItem({ title: '', description: '', date: '', badge: 'Workshop', order_num: 0 });
        fetchAllAdminData();
      } else {
        showToast('error', data.error || 'Failed to add milestone');
      }
    } catch (err) {
      showToast('error', 'Network error adding milestone');
    }
  };

  const handleUpdateAgendaItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgendaItem) return;
    try {
      const res = await fetch(`/api/admin/agenda/${editingAgendaItem.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(editingAgendaItem)
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', '✅ Milestone event updated live!');
        setEditingAgendaItem(null);
        fetchAllAdminData();
      } else {
        showToast('error', data.error || 'Failed to update milestone');
      }
    } catch (err) {
      showToast('error', 'Network error updating milestone');
    }
  };

  const handleDeleteAgendaItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this club milestone event?')) return;
    try {
      const res = await fetch(`/api/admin/agenda/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', '🗑️ Milestone event deleted.');
        fetchAllAdminData();
      } else {
        showToast('error', data.error || 'Failed to delete milestone');
      }
    } catch (err) {
      showToast('error', 'Network error deleting milestone');
    }
  };

  // --- User Management Handlers ---
  const handleUpdateRole = async (userId: number, role: 'Admin' | 'Member') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        showToast('success', `User role changed to ${role}`);
        setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleUpdateStatus = async (userId: number, status: 'approved' | 'pending' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast('success', `User status changed to ${status}`);
        setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', 'User deleted successfully');
        setUsers(users.filter(u => u.id !== userId));
      } else {
        showToast('error', data.error || 'Failed to delete user');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleQuickUserCategoryChange = async (userId: number, category: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/committee-category`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ category })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', `User committee category set to ${category}`);
        setUsers(users.map(u => u.id === userId ? { ...u, committee_category: category } : u));
      } else {
        showToast('error', data.error || 'Failed to update user category');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleSaveUserModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(editingUser)
      });
      if (res.ok) {
        showToast('success', 'User profile updated successfully!');
        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        setEditingUser(null);
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // --- Committee Management Handlers ---
  const handleSetCurrentCommittee = async (id: number, numberVal: number) => {
    try {
      const res = await fetch(`/api/admin/committees/${id}/set-current`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `⭐ Committee #${numberVal} is now the LIVE running committee on the website!`);
        fetchAllAdminData();
        if (selectedCommitteeId === id) {
          fetchCommitteeDetails(id);
        }
      } else {
        showToast('error', data.error || 'Failed to switch running committee');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleCreateCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/committees', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newCommittee)
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `🎉 Committee #${newCommittee.committee_number} created successfully!`);
        setIsAddCommitteeModalOpen(false);
        setNewCommittee({
          committee_number: (committees.length + 1) || 1,
          title: '',
          session_years: '',
          is_current: 0,
          theme_motto: '',
          description: '',
          banner_url: ''
        });
        fetchAllAdminData();
        if (data.data?.id) {
          setSelectedCommitteeId(data.data.id);
        }
      } else {
        showToast('error', data.error || 'Failed to create committee');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleUpdateCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommittee) return;
    try {
      const res = await fetch(`/api/admin/committees/${editingCommittee.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(editingCommittee)
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Committee details updated!');
        setEditingCommittee(null);
        fetchAllAdminData();
        if (selectedCommitteeId === editingCommittee.id) {
          fetchCommitteeDetails(editingCommittee.id);
        }
      } else {
        showToast('error', data.error || 'Failed to update committee');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleDeleteCommittee = async (id: number, numberVal: number) => {
    if (!confirm(`Are you sure you want to delete Committee #${numberVal} and all its member records? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/committees/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Committee #${numberVal} removed.`);
        fetchAllAdminData();
        const remaining = committees.filter(c => c.id !== id);
        if (remaining.length > 0) {
          setSelectedCommitteeId(remaining[0].id);
        } else {
          setSelectedCommitteeId(null);
          setCommitteeMembers([]);
        }
      } else {
        showToast('error', data.error || 'Failed to delete committee');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleAddCommitteeMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetIds = (newCommitteeMember.target_committee_ids && newCommitteeMember.target_committee_ids.length > 0)
      ? newCommitteeMember.target_committee_ids
      : (selectedCommitteeId ? [selectedCommitteeId] : []);

    if (targetIds.length === 0) {
      showToast('error', 'Please select at least one committee session');
      return;
    }

    try {
      const primaryId = targetIds[0];
      const res = await fetch(`/api/admin/committees/${primaryId}/members`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...newCommitteeMember,
          target_committee_ids: targetIds,
          is_override: newCommitteeMember.category !== 'Auto' ? 1 : 0
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `👤 ${newCommitteeMember.name} added to ${targetIds.length} committee session(s)!`);
        setIsAddMemberModalOpen(false);
        setNewCommitteeMember({
          user_id: '',
          name: '',
          email: '',
          department: 'Computer Science & Engineering',
          student_id: '',
          designation: '',
          category: 'Auto',
          bio: '',
          skills: '',
          profile_photo: '',
          display_order: 0,
          target_committee_ids: []
        });
        if (selectedCommitteeId) fetchCommitteeDetails(selectedCommitteeId);
        fetchAllAdminData();
      } else {
        showToast('error', data.error || 'Failed to add member');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleUpdateCommitteeMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommitteeMember) return;
    try {
      const res = await fetch(`/api/admin/committees/members/${editingCommitteeMember.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          ...editingCommitteeMember,
          committee_id: editingCommitteeMember.committee_id,
          is_override: editingCommitteeMember.category !== 'Auto' ? 1 : 0
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Committee member updated successfully!');
        const targetCommId = editingCommitteeMember.committee_id || selectedCommitteeId;
        setEditingCommitteeMember(null);
        if (targetCommId) {
          setSelectedCommitteeId(targetCommId);
          fetchCommitteeDetails(targetCommId);
        }
        fetchAllAdminData();
      } else {
        showToast('error', data.error || 'Failed to update committee member');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleOpenAssignSessionModal = async (u: any) => {
    setAssigningSessionUser(u);
    setAssignedSessionRole(u.committee_role || 'Executive Member');
    setAssignedSessionCategory(u.committee_category || 'Auto');
    try {
      const res = await fetch(`/api/admin/users/${u.id}/committees`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAssignedSessionIds(data.data.map((a: any) => a.committee_id));
      } else {
        setAssignedSessionIds(selectedCommitteeId ? [selectedCommitteeId] : []);
      }
    } catch (err) {
      setAssignedSessionIds(selectedCommitteeId ? [selectedCommitteeId] : []);
    }
  };

  const handleSaveUserSessionAssignments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningSessionUser) return;
    try {
      const assignments = assignedSessionIds.map(cId => ({
        committee_id: cId,
        designation: assignedSessionRole,
        category: assignedSessionCategory
      }));
      const res = await fetch(`/api/admin/users/${assigningSessionUser.id}/assign-committees`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ committee_assignments: assignments })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Session assignments updated for ${assigningSessionUser.name}!`);
        setAssigningSessionUser(null);
        if (selectedCommitteeId) fetchCommitteeDetails(selectedCommitteeId);
        fetchAllAdminData();
      } else {
        showToast('error', data.error || 'Failed to update session assignments');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleQuickMemberCategoryChange = async (memberId: number, category: string) => {
    if (!selectedCommitteeId) return;
    let targetCat = category;
    if (category === '__CUSTOM__') {
      const input = prompt('Enter new category name (e.g. Autonomous Flight Wing, Sub-Executive):');
      if (!input || !input.trim()) return;
      targetCat = input.trim();
      handleCreateNewCategory(targetCat);
    }
    try {
      const res = await fetch(`/api/admin/committees/members/${memberId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          category: targetCat,
          is_override: targetCat === 'Auto' ? 0 : 1
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Category set to: ${data.data?.category || targetCat} ${targetCat === 'Auto' ? '(Inferred)' : '(Admin Set)'}`);
        fetchCommitteeDetails(selectedCommitteeId);
        fetchAllAdminData();
      } else {
        showToast('error', data.error || 'Failed to update category');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleDeleteCommitteeMember = async (memberId: number) => {
    if (!confirm('Remove this member from this committee tenure?')) return;
    try {
      const res = await fetch(`/api/admin/committees/members/${memberId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Member removed from committee');
        if (selectedCommitteeId) {
          fetchCommitteeDetails(selectedCommitteeId);
        }
        fetchAllAdminData();
      } else {
        showToast('error', data.error || 'Failed to remove member');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleCloneRoster = async () => {
    if (!selectedCommitteeId || !cloneSourceId) return;
    try {
      const res = await fetch(`/api/admin/committees/${selectedCommitteeId}/copy-from/${cloneSourceId}`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Copied ${data.copied_count} members from previous committee!`);
        setIsCloneModalOpen(false);
        setCloneSourceId('');
        fetchCommitteeDetails(selectedCommitteeId);
        fetchAllAdminData();
      } else {
        showToast('error', data.error || 'Failed to clone committee members');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };


  // --- Projects Management Handlers ---
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const techStack = newProject.tech_stack.split(',').map(s => s.trim()).filter(Boolean);
      const team = newProject.team_members.split(',').map(s => s.trim()).filter(Boolean);

      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...newProject,
          tech_stack: techStack,
          team_members: team
        })
      });
      if (res.ok) {
        showToast('success', 'Project added to robotics showcase!');
        setNewProject({
          title: '',
          category: 'Autonomous Terrestrial',
          description: '',
          status: 'Active',
          image_url: '',
          github_link: '',
          tech_stack: '',
          team_members: ''
        });
        fetchAllAdminData();
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await fetch(`/api/admin/projects/${id}`, { method: 'DELETE', headers: getHeaders() });
      showToast('success', 'Project removed');
      setProjects(projects.filter(p => p.id !== id));
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      const techStack = Array.isArray(editingProject.tech_stack)
        ? editingProject.tech_stack
        : (editingProject.tech_stack || '').split(',').map((s: string) => s.trim()).filter(Boolean);
      const team = Array.isArray(editingProject.team_members)
        ? editingProject.team_members
        : (editingProject.team_members || '').split(',').map((s: string) => s.trim()).filter(Boolean);

      const res = await fetch(`/api/admin/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          ...editingProject,
          tech_stack: techStack,
          team_members: team
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', 'Project updated successfully!');
        setEditingProject(null);
        fetchAllAdminData();
      } else {
        showToast('error', data.error || 'Failed to update project');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleProposalDecision = async (id: number, decision: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/project-proposals/${id}/decision`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ decision })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', `Proposal ${decision === 'approved' ? 'Approved & Published Live to Showcase!' : 'Marked as Rejected'}`);
        fetchAllAdminData();
      } else {
        showToast('error', data.error || 'Failed to update proposal');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // --- Roles Management Handlers ---
  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name) return;
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newRole)
      });
      if (res.ok) {
        showToast('success', 'Role added to directory list');
        setNewRole({ name: '', priority: 5, category: 'Technical' });
        fetchAllAdminData();
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleDeleteRole = async (id: number) => {
    try {
      await fetch(`/api/admin/roles/${id}`, { method: 'DELETE', headers: getHeaders() });
      showToast('success', 'Role deleted');
      setRoles(roles.filter(r => r.id !== id));
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // --- Announcements Handlers ---
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newAnnouncement)
      });
      if (res.ok) {
        showToast('success', 'Announcement broadcasted to members!');
        setNewAnnouncement({ title: '', content: '', priority: 'normal' });
        fetchAllAdminData();
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE', headers: getHeaders() });
      showToast('success', 'Announcement deleted');
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.committee_role?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.department?.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] flex flex-col items-center justify-center p-6 text-slate-900 dark:text-slate-100">
        <div className="relative mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 dark:bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>
          <div className="absolute -inset-1 rounded-2xl border border-indigo-500/20 animate-ping pointer-events-none" />
        </div>
        <h3 className="text-base font-black tracking-tight mb-1">Authenticating Admin Matrix</h3>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Loading dynamic database control records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col selection:bg-indigo-500 selection:text-white">
      <JSTUHeader currentUser={currentUser} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Admin Superpower CMS
              </span>
              <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">JSTU Full Control Matrix</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Dynamic Site & System Manager
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>View Live Website</span>
            </Link>
          </div>
        </div>

        {/* Action Toast Alert */}
        {actionMessage && (
          <div
            className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-2 shadow-lg transition-all ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-500/50 text-red-800 dark:text-red-300'
            }`}
          >
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* DYNAMIC MOBILE TAB NAVIGATION (md:hidden) - Zero horizontal scrolling needed */}
        <div className="md:hidden mb-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
            <span className="uppercase tracking-wider">Select Admin Section</span>
            <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">All 6 Visible</span>
          </div>

          {/* Quick Dropdown Selector */}
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#0D1424] border-2 border-indigo-500/50 dark:border-indigo-400/50 text-slate-900 dark:text-white text-sm font-black shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="superpower">👑 Superpower Settings</option>
              <option value="committees">🏛️ Committees & Tenures ({committees.length})</option>
              <option value="content">📄 Landing Page Text CMS</option>
              <option value="users">👥 User Registry ({users.length})</option>
              <option value="projects">🚀 Projects CMS ({projects.length}){proposals.length > 0 ? ` [${proposals.length} Pending]` : ''}</option>
              <option value="roles">🏷️ Directory Roles ({roles.length})</option>
              <option value="announcements">🔔 Announcements ({announcements.length})</option>
            </select>
          </div>

          {/* 2-Column Touch Grid - Immediate tap access to every tab */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setActiveTab('superpower')}
              className={`p-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 text-left ${
                activeTab === 'superpower'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span className="truncate">👑 Superpower</span>
            </button>

            <button
              onClick={() => setActiveTab('committees')}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-left ${
                activeTab === 'committees'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Landmark className="w-4 h-4 flex-shrink-0 text-indigo-400" />
              <span className="truncate">Committees ({committees.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-left ${
                activeTab === 'content'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4 flex-shrink-0 text-indigo-400" />
              <span className="truncate">Landing CMS</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-left ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4 flex-shrink-0 text-indigo-400" />
              <span className="truncate">Users ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-1 text-left ${
                activeTab === 'projects'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Layers className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                <span className="truncate">Projects ({projects.length})</span>
              </div>
              {proposals.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 flex-shrink-0 animate-pulse">
                  {proposals.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('roles')}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-left ${
                activeTab === 'roles'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Tag className="w-4 h-4 flex-shrink-0 text-indigo-400" />
              <span className="truncate">Roles ({roles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('announcements')}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-left col-span-2 ${
                activeTab === 'announcements'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Bell className="w-4 h-4 flex-shrink-0 text-indigo-400" />
              <span className="truncate">Notices & Announcements ({announcements.length})</span>
            </button>
          </div>
        </div>

        {/* DESKTOP TAB NAVIGATION (hidden md:flex) */}
        <div className="hidden md:flex overflow-x-auto no-scrollbar scroll-smooth gap-2 mb-8 p-1.5 bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-full">
          <button
            onClick={() => setActiveTab('superpower')}
            className={`px-4 py-2 rounded-xl text-sm font-black whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-2 ${
              activeTab === 'superpower'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>👑 Superpower Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('committees')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-2 ${
              activeTab === 'committees'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Committees & Tenures ({committees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-2 ${
              activeTab === 'content'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Landing Page Text</span>
          </button>


          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Registry ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Projects CMS ({projects.length})</span>
            {proposals.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-pulse">
                {proposals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-2 ${
              activeTab === 'roles'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Directory Roles</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-2 ${
              activeTab === 'announcements'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Announcements</span>
          </button>
        </div>

        {/* TAB 0: SUPERPOWER SETTINGS */}
        {activeTab === 'superpower' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span>Admin Superpower: Buttons, Categories & Section Visibility</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    You have total control. Customize CTA buttons, section headings, filter categories, and toggle visibility on the public site in real time.
                  </p>
                </div>

                <button
                  onClick={handleSaveSuperConfig}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 flex-shrink-0 active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Superpower Config</span>
                </button>
              </div>

              {/* 0. Website Logo & Header Branding Control */}
              <div className="mb-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-500" />
                  0. Website Logo & Header Branding
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Change the website logo, club title, status badge, and subtitle displayed across the navbar header and public pages.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Club Name / Header Title
                      </label>
                      <input
                        type="text"
                        value={superConfig.branding?.title || ''}
                        onChange={e => setSuperConfig({
                          ...superConfig,
                          branding: { ...superConfig.branding, title: e.target.value }
                        })}
                        placeholder="JSTU Robotics Club"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Header Status Badge
                      </label>
                      <input
                        type="text"
                        value={superConfig.branding?.badge || ''}
                        onChange={e => setSuperConfig({
                          ...superConfig,
                          branding: { ...superConfig.branding, badge: e.target.value }
                        })}
                        placeholder="BOTS & BEYOND"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Header Subtitle / University Affiliation
                      </label>
                      <input
                        type="text"
                        value={superConfig.branding?.subtitle || ''}
                        onChange={e => setSuperConfig({
                          ...superConfig,
                          branding: { ...superConfig.branding, subtitle: e.target.value }
                        })}
                        placeholder="Jamalpur Science and Technology University"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Custom Logo Image URL (Optional)
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="url"
                          value={superConfig.branding?.image_url || ''}
                          onChange={e => setSuperConfig({
                            ...superConfig,
                            branding: { ...superConfig.branding, image_url: e.target.value }
                          })}
                          placeholder="https://... (Leave blank to use default energetic CPU logo)"
                          className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        />
                        {superConfig.branding?.image_url && (
                          <img
                            src={superConfig.branding.image_url}
                            alt="Logo preview"
                            className="w-9 h-9 rounded-lg object-contain border border-slate-300 dark:border-slate-700 bg-white"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Hero Buttons Customizer */}
              <div className="mb-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  1. Hero Call-To-Action (CTA) Buttons
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Primary CTA */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Primary Button</span>
                      <button
                        onClick={() => setSuperConfig({
                          ...superConfig,
                          hero_cta_primary: { ...superConfig.hero_cta_primary, show: !superConfig.hero_cta_primary?.show }
                        })}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                      >
                        {superConfig.hero_cta_primary?.show ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                    <label className="block text-[11px] text-slate-400 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={superConfig.hero_cta_primary?.text || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        hero_cta_primary: { ...superConfig.hero_cta_primary, text: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs mb-2 text-slate-900 dark:text-white"
                    />
                    <label className="block text-[11px] text-slate-400 mb-1">Link Target</label>
                    <input
                      type="text"
                      value={superConfig.hero_cta_primary?.link || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        hero_cta_primary: { ...superConfig.hero_cta_primary, link: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Secondary CTA */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Secondary Button</span>
                      <button
                        onClick={() => setSuperConfig({
                          ...superConfig,
                          hero_cta_secondary: { ...superConfig.hero_cta_secondary, show: !superConfig.hero_cta_secondary?.show }
                        })}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                      >
                        {superConfig.hero_cta_secondary?.show ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                    <label className="block text-[11px] text-slate-400 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={superConfig.hero_cta_secondary?.text || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        hero_cta_secondary: { ...superConfig.hero_cta_secondary, text: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs mb-2 text-slate-900 dark:text-white"
                    />
                    <label className="block text-[11px] text-slate-400 mb-1">Link Target</label>
                    <input
                      type="text"
                      value={superConfig.hero_cta_secondary?.link || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        hero_cta_secondary: { ...superConfig.hero_cta_secondary, link: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Tertiary CTA */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Tertiary Button</span>
                      <button
                        onClick={() => setSuperConfig({
                          ...superConfig,
                          hero_cta_tertiary: { ...superConfig.hero_cta_tertiary, show: !superConfig.hero_cta_tertiary?.show }
                        })}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                      >
                        {superConfig.hero_cta_tertiary?.show ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                    <label className="block text-[11px] text-slate-400 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={superConfig.hero_cta_tertiary?.text || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        hero_cta_tertiary: { ...superConfig.hero_cta_tertiary, text: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs mb-2 text-slate-900 dark:text-white"
                    />
                    <label className="block text-[11px] text-slate-400 mb-1">Link Target</label>
                    <input
                      type="text"
                      value={superConfig.hero_cta_tertiary?.link || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        hero_cta_tertiary: { ...superConfig.hero_cta_tertiary, link: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Section Titles & Visibility */}
              <div className="mb-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  2. Section Headings & Visibility Controls
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Agenda Section */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Agenda & Blueprint Section</span>
                      <button
                        onClick={() => setSuperConfig({
                          ...superConfig,
                          sections: {
                            ...superConfig.sections,
                            agenda: { ...superConfig.sections?.agenda, show: !superConfig.sections?.agenda?.show }
                          }
                        })}
                        className={`text-xs font-bold ${superConfig.sections?.agenda?.show !== false ? 'text-emerald-500' : 'text-slate-400'}`}
                      >
                        {superConfig.sections?.agenda?.show !== false ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={superConfig.sections?.agenda?.title || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        sections: {
                          ...superConfig.sections,
                          agenda: { ...superConfig.sections?.agenda, title: e.target.value }
                        }
                      })}
                      placeholder="Section Title"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs mb-2 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={superConfig.sections?.agenda?.subtitle || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        sections: {
                          ...superConfig.sections,
                          agenda: { ...superConfig.sections?.agenda, subtitle: e.target.value }
                        }
                      })}
                      placeholder="Section Subtitle / Badge"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Projects Section */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Robotics Projects Showcase</span>
                      <button
                        onClick={() => setSuperConfig({
                          ...superConfig,
                          sections: {
                            ...superConfig.sections,
                            projects: { ...superConfig.sections?.projects, show: !superConfig.sections?.projects?.show }
                          }
                        })}
                        className={`text-xs font-bold ${superConfig.sections?.projects?.show !== false ? 'text-emerald-500' : 'text-slate-400'}`}
                      >
                        {superConfig.sections?.projects?.show !== false ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={superConfig.sections?.projects?.title || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        sections: {
                          ...superConfig.sections,
                          projects: { ...superConfig.sections?.projects, title: e.target.value }
                        }
                      })}
                      placeholder="Section Title"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs mb-2 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={superConfig.sections?.projects?.subtitle || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        sections: {
                          ...superConfig.sections,
                          projects: { ...superConfig.sections?.projects, subtitle: e.target.value }
                        }
                      })}
                      placeholder="Section Subtitle / Badge"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Directory Section */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Committee Directory Section</span>
                      <button
                        onClick={() => setSuperConfig({
                          ...superConfig,
                          sections: {
                            ...superConfig.sections,
                            directory: { ...superConfig.sections?.directory, show: !superConfig.sections?.directory?.show }
                          }
                        })}
                        className={`text-xs font-bold ${superConfig.sections?.directory?.show !== false ? 'text-emerald-500' : 'text-slate-400'}`}
                      >
                        {superConfig.sections?.directory?.show !== false ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={superConfig.sections?.directory?.title || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        sections: {
                          ...superConfig.sections,
                          directory: { ...superConfig.sections?.directory, title: e.target.value }
                        }
                      })}
                      placeholder="Section Title"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs mb-2 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={superConfig.sections?.directory?.subtitle || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        sections: {
                          ...superConfig.sections,
                          directory: { ...superConfig.sections?.directory, subtitle: e.target.value }
                        }
                      })}
                      placeholder="Section Subtitle / Badge"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Join Section */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Recruitment & Join Section</span>
                      <button
                        onClick={() => setSuperConfig({
                          ...superConfig,
                          sections: {
                            ...superConfig.sections,
                            join: { ...superConfig.sections?.join, show: !superConfig.sections?.join?.show }
                          }
                        })}
                        className={`text-xs font-bold ${superConfig.sections?.join?.show !== false ? 'text-emerald-500' : 'text-slate-400'}`}
                      >
                        {superConfig.sections?.join?.show !== false ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={superConfig.sections?.join?.title || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        sections: {
                          ...superConfig.sections,
                          join: { ...superConfig.sections?.join, title: e.target.value }
                        }
                      })}
                      placeholder="Section Title"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs mb-2 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={superConfig.sections?.join?.subtitle || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        sections: {
                          ...superConfig.sections,
                          join: { ...superConfig.sections?.join, subtitle: e.target.value }
                        }
                      })}
                      placeholder="Section Subtitle / Badge"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Category Manager */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  3. Dynamic Filter Categories (Public Tabs)
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Project Categories */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Robotics Project Filter Tabs
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="New category (e.g. Swarm Robotics)..."
                        value={newProjectCategory}
                        onChange={e => setNewProjectCategory(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={addProjectCategory}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {superConfig.project_categories?.map((cat: string) => (
                        <span
                          key={cat}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-xs"
                        >
                          <span>{cat}</span>
                          {cat !== 'All' && (
                            <button
                              onClick={() => removeProjectCategory(cat)}
                              className="text-slate-400 hover:text-red-500 ml-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Directory Categories */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Member Directory Filter Tabs
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="New tab (e.g. Research Fellows)..."
                        value={newDirCategory}
                        onChange={e => setNewDirCategory(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={addDirCategory}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {superConfig.directory_categories?.map((cat: string) => (
                        <span
                          key={cat}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-xs"
                        >
                          <span>{cat}</span>
                          {cat !== 'All' && (
                            <button
                              onClick={() => removeDirCategory(cat)}
                              className="text-slate-400 hover:text-red-500 ml-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Dynamic Live Stats Metrics */}
              <div className="mt-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  4. Dynamic Stats & Achievements Counters
                </h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {(superConfig.stats || [
                    { label: 'Autonomous Bots Built', value: '14+' },
                    { label: 'Active Roboticists', value: '92+' },
                    { label: 'National Competitions', value: '6 Won' },
                    { label: 'Research Tracks', value: '5 Labs' }
                  ]).map((stat: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Metric {idx + 1} Value</label>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => {
                          const currentStats = superConfig.stats ? [...superConfig.stats] : [
                            { label: 'Autonomous Bots Built', value: '14+' },
                            { label: 'Active Roboticists', value: '92+' },
                            { label: 'National Competitions', value: '6 Won' },
                            { label: 'Research Tracks', value: '5 Labs' }
                          ];
                          currentStats[idx] = { ...currentStats[idx], value: e.target.value };
                          setSuperConfig({ ...superConfig, stats: currentStats });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white mb-2"
                      />
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Metric Label</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => {
                          const currentStats = superConfig.stats ? [...superConfig.stats] : [
                            { label: 'Autonomous Bots Built', value: '14+' },
                            { label: 'Active Roboticists', value: '92+' },
                            { label: 'National Competitions', value: '6 Won' },
                            { label: 'Research Tracks', value: '5 Labs' }
                          ];
                          currentStats[idx] = { ...currentStats[idx], label: e.target.value };
                          setSuperConfig({ ...superConfig, stats: currentStats });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Footer Information Customizer */}
              <div className="mt-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-indigo-500" />
                  5. Website Footer Information
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Customize the title, descriptive mission text, and copyright disclaimer rendered at the bottom of every page.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Footer Title
                      </label>
                      <input
                        type="text"
                        value={superConfig.footer?.title || ''}
                        onChange={e => setSuperConfig({
                          ...superConfig,
                          footer: { ...superConfig.footer, title: e.target.value }
                        })}
                        placeholder="Jamalpur Science and Technology University Robotics Club"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Copyright Text
                      </label>
                      <input
                        type="text"
                        value={superConfig.footer?.copyright || ''}
                        onChange={e => setSuperConfig({
                          ...superConfig,
                          footer: { ...superConfig.footer, copyright: e.target.value }
                        })}
                        placeholder="© 2026 JSTU Robotics Club · Powered by SQLite Relational Core"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Footer Mission & Description
                    </label>
                    <textarea
                      rows={4}
                      value={superConfig.footer?.description || ''}
                      onChange={e => setSuperConfig({
                        ...superConfig,
                        footer: { ...superConfig.footer, description: e.target.value }
                      })}
                      placeholder="Official robotics and intelligent automation research club at JSTU..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Save Superpower Config Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveSuperConfig}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Superpower Config</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: COMMITTEES & TENURES MANAGEMENT */}
        {activeTab === 'committees' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* 1. Active Running Committee Live Status Hero */}
            {(() => {
              const currentCommittee = committees.find(c => c.is_current === 1) || committees[0];
              const selectedComm = committees.find(c => c.id === selectedCommitteeId) || currentCommittee;
              const excomCount = committeeMembers.filter(m => m.category === 'Executive').length;
              const leadCount = committeeMembers.filter(m => m.category === 'Lead').length;
              const advisorCount = committeeMembers.filter(m => m.category === 'Advisor').length;
              const generalCount = committeeMembers.filter(m => m.category === 'Member').length;

              return (
                <div className="space-y-6">
                  {/* Top Live Banner */}
                  <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-500/30 text-white shadow-xl">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Live Active Running Committee
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-white border border-white/10">
                            Committee #{currentCommittee?.committee_number || 1}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                            {currentCommittee?.session_years || 'Active'}
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                          {currentCommittee?.title || 'Executive Committee'}
                        </h2>
                        
                        {currentCommittee?.theme_motto && (
                          <p className="text-sm text-indigo-200/90 italic font-medium">
                            "{currentCommittee.theme_motto}"
                          </p>
                        )}
                        <p className="text-xs text-slate-300 line-clamp-2">
                          {currentCommittee?.description || 'Official managing and advisory executive body for the Jamalpur Science and Technology University Robotics Club.'}
                        </p>
                      </div>

                      {/* Top Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => {
                            setNewCommittee({
                              committee_number: (committees.length + 1) || 1,
                              title: `${committees.length + 1}${committees.length === 1 ? 'nd' : committees.length === 2 ? 'rd' : 'th'} Executive Committee`,
                              session_years: '2026–2027',
                              is_current: 0,
                              theme_motto: '',
                              description: '',
                              banner_url: ''
                            });
                            setIsAddCommitteeModalOpen(true);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-lg flex items-center gap-2 transition-all active:scale-95"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>+ New Committee Tenure</span>
                        </button>

                        <Link
                          to="/committees"
                          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all flex items-center gap-2"
                        >
                          <Landmark className="w-4 h-4 text-indigo-300" />
                          <span>View Public Archive</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                        </Link>
                      </div>
                    </div>

                    {/* Stats Ribbon */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-800/40">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-indigo-200/70 block">Total Tenures</span>
                        <span className="text-xl sm:text-2xl font-black text-white">{committees.length}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-purple-200/70 block">Selected ExCom</span>
                        <span className="text-xl sm:text-2xl font-black text-purple-300">{excomCount}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-cyan-200/70 block">Selected Leads</span>
                        <span className="text-xl sm:text-2xl font-black text-cyan-300">{leadCount}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-amber-200/70 block">Selected Advisors</span>
                        <span className="text-xl sm:text-2xl font-black text-amber-300">{advisorCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. All Committee Tenures Cards Grid */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Landmark className="w-5 h-5 text-indigo-500" />
                          <span>Committee Tenures Archive ({committees.length})</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Every year gets a numbered committee. 1-click switch changes the live committee on the public website.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setNewCommittee({
                              committee_number: (committees.length + 1) || 1,
                              title: `${committees.length + 1}${committees.length === 1 ? 'nd' : committees.length === 2 ? 'rd' : 'th'} Executive Committee`,
                              session_years: '2026–2027',
                              is_current: 0,
                              theme_motto: '',
                              description: '',
                              banner_url: ''
                            });
                            setIsAddCommitteeModalOpen(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Tenure</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {committees.map((comm) => {
                        const isCurrent = comm.is_current === 1;
                        const isSelected = selectedCommitteeId === comm.id;

                        return (
                          <div
                            key={comm.id}
                            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Header Pill */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-indigo-600 text-white">
                                  #{comm.committee_number}
                                </span>

                                {isCurrent ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active Running
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    Archived
                                  </span>
                                )}
                              </div>

                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                                  {comm.title}
                                </h4>
                                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 block mt-0.5">
                                  Session {comm.session_years}
                                </span>
                              </div>

                              {comm.theme_motto && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1">
                                  "{comm.theme_motto}"
                                </p>
                              )}

                              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                                <Users className="w-3.5 h-3.5 text-indigo-500" />
                                <span>{comm.total_members_count || 0} Members in Roster</span>
                              </div>
                            </div>

                            {/* Tenure Action Buttons */}
                            <div className="space-y-2 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => setSelectedCommitteeId(comm.id)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                    isSelected
                                      ? 'bg-indigo-600 text-white shadow-xs'
                                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                                  }`}
                                >
                                  <span>Manage Roster</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>

                                {!isCurrent ? (
                                  <button
                                    onClick={() => handleSetCurrentCommittee(comm.id, comm.committee_number)}
                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/40 text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                                    title="Set this committee as the LIVE running committee"
                                  >
                                    <Sparkles className="w-3 h-3 text-emerald-500" />
                                    <span>Set as Active</span>
                                  </button>
                                ) : (
                                  <div className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center justify-center gap-1">
                                    <Check className="w-3 h-3" />
                                    <span>Live Now</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between gap-1 pt-1">
                                <Link
                                  to={`/committees/${comm.id}`}
                                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                >
                                  <span>Public View</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setEditingCommittee(comm)}
                                    className="p-1.5 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                    title="Edit Committee Details"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  {committees.length > 1 && (
                                    <button
                                      onClick={() => handleDeleteCommittee(comm.id, comm.committee_number)}
                                      className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400"
                                      title="Delete Committee"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Selected Committee Roster & Member Management */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    {/* Top Selected Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-600 text-white">
                            Committee #{selectedComm?.committee_number || 1}
                          </span>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {selectedComm?.session_years}
                          </span>
                          {selectedComm?.is_current === 1 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-600/40">
                              Active Running
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                          Roster Management: {selectedComm?.title || 'Selected Committee'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          View, add, edit, or override categories for each member in this committee tenure.
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            setNewCommitteeMember({
                              user_id: '',
                              name: '',
                              email: '',
                              department: 'Computer Science & Engineering',
                              student_id: '',
                              designation: '',
                              category: 'Auto',
                              bio: '',
                              skills: '',
                              profile_photo: '',
                              display_order: (committeeMembers.length + 1),
                              target_committee_ids: selectedCommitteeId ? [selectedCommitteeId] : []
                            });
                            setIsAddMemberModalOpen(true);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>+ Add Member to this Committee</span>
                        </button>

                        {committees.length > 1 && (
                          <button
                            onClick={() => {
                              const otherComm = committees.find(c => c.id !== selectedCommitteeId);
                              setCloneSourceId(otherComm ? otherComm.id : '');
                              setIsCloneModalOpen(true);
                            }}
                            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
                            title="Clone members from previous year"
                          >
                            <Copy className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Clone Past Roster</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Explainer: Automatic Categorization & Admin Power */}
                    <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            🤖 Smart Auto-Categorization & 1-Click Admin Override
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 mt-0.5 block leading-relaxed">
                            Members are automatically classified by role (e.g. <em>President / VP</em> = <strong>Executive</strong>, <em>Leads</em> = <strong>Lead</strong>, <em>Advisors</em> = <strong>Advisor</strong>). Admin can override any member's category instantly using the dropdown on their card or table row.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Filters & Search Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Filter Pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {['All', ...Array.from(new Set([...customCategories, ...committeeMembers.map(m => m.category).filter(Boolean)]))].map((cat) => {
                          const count = cat === 'All'
                            ? committeeMembers.length
                            : committeeMembers.filter(m => m.category === cat).length;

                          return (
                            <button
                              key={cat}
                              onClick={() => setCommitteeCategoryFilter(cat)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                committeeCategoryFilter === cat
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {cat === 'Executive' && <Crown className="w-3 h-3 text-amber-300" />}
                              {cat === 'Lead' && <Sparkles className="w-3 h-3 text-cyan-300" />}
                              {cat === 'Advisor' && <GraduationCap className="w-3 h-3 text-indigo-300" />}
                              {cat !== 'All' && !['Executive', 'Lead', 'Advisor', 'Member'].includes(cat) && <Tag className="w-3 h-3 text-purple-400" />}
                              <span>{cat}</span>
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
                                {count}
                              </span>
                            </button>
                          );
                        })}

                        {/* Power Create Category Button */}
                        <button
                          type="button"
                          onClick={() => setIsCreateCategoryModalOpen(true)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xs transition-all flex items-center gap-1.5"
                          title="Create a new committee category"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>+ Create Category</span>
                        </button>
                      </div>

                      {/* Search */}
                      <input
                        type="text"
                        placeholder="Search member, role, dept..."
                        value={committeeSearch}
                        onChange={e => setCommitteeSearch(e.target.value)}
                        className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 w-full sm:w-64 shadow-xs"
                      />
                    </div>

                    {/* Filtered Members List */}
                    {(() => {
                      const filtered = committeeMembers.filter(m => {
                        const matchesSearch = !committeeSearch ||
                          m.name?.toLowerCase().includes(committeeSearch.toLowerCase()) ||
                          m.designation?.toLowerCase().includes(committeeSearch.toLowerCase()) ||
                          m.department?.toLowerCase().includes(committeeSearch.toLowerCase()) ||
                          m.student_id?.toLowerCase().includes(committeeSearch.toLowerCase());
                        const matchesCat = committeeCategoryFilter === 'All' || m.category === committeeCategoryFilter;
                        return matchesSearch && matchesCat;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <Users className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No members found</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {committeeSearch ? 'Try a different search query' : 'Add members to this committee tenure or clone from a past committee.'}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {/* Mobile View (sm:hidden) */}
                          <div className="block sm:hidden space-y-3">
                            {filtered.map(m => (
                              <div
                                key={m.id}
                                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                      src={m.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.name}`}
                                      alt={m.name}
                                      className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/40 flex-shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <span className="font-bold text-slate-900 dark:text-white text-sm block truncate">{m.name}</span>
                                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">{m.designation}</span>
                                    </div>
                                  </div>

                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0 border ${
                                    m.category === 'Executive'
                                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30'
                                      : m.category === 'Lead'
                                      ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30'
                                      : m.category === 'Advisor'
                                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/30'
                                      : m.category === 'Member'
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                                  }`}>
                                    {m.category}
                                  </span>
                                </div>

                                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">1-Click Category</span>
                                    <select
                                      value={m.is_override ? m.category : 'Auto'}
                                      onChange={(e) => handleQuickMemberCategoryChange(m.id, e.target.value)}
                                      className="mt-1 px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                                    >
                                      <option value="Auto">⚙️ Auto ({m.category})</option>
                                      {customCategories.map(cat => (
                                        <option key={cat} value={cat}>
                                          {cat === 'Executive' ? '👑 Executive' :
                                           cat === 'Lead' ? '⚡ Lead' :
                                           cat === 'Advisor' ? '🎓 Advisor' :
                                           cat === 'Member' ? '👤 Member' : `🏷️ ${cat}`}
                                        </option>
                                      ))}
                                      <option value="__CUSTOM__">➕ + Custom Category...</option>
                                    </select>
                                  </div>

                                  <div className="flex items-center gap-1.5 self-end">
                                    <button
                                      onClick={() => setEditingCommitteeMember(m)}
                                      className="p-1.5 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCommitteeMember(m.id)}
                                      className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Desktop Table View (hidden sm:block) */}
                          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 uppercase font-mono tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                  <th className="py-3 px-4">Member</th>
                                  <th className="py-3 px-4">Designation / Role</th>
                                  <th className="py-3 px-4">Category (1-Click Override)</th>
                                  <th className="py-3 px-4">Classification</th>
                                  <th className="py-3 px-4">Department</th>
                                  <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                                {filtered.map(m => (
                                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                    <td className="py-3.5 px-4 flex items-center gap-3">
                                      <img
                                        src={m.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.name}`}
                                        alt={m.name}
                                        className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500/40 shadow-xs"
                                      />
                                      <div>
                                        <span className="font-bold text-slate-900 dark:text-white block">{m.name}</span>
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{m.email}</span>
                                      </div>
                                    </td>

                                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                                      {m.designation}
                                    </td>

                                    <td className="py-3.5 px-4">
                                      <select
                                        value={m.is_override ? m.category : 'Auto'}
                                        onChange={(e) => handleQuickMemberCategoryChange(m.id, e.target.value)}
                                        className="px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                                      >
                                        <option value="Auto">⚙️ Auto ({m.category})</option>
                                        {customCategories.map(cat => (
                                          <option key={cat} value={cat}>
                                            {cat === 'Executive' ? '👑 Executive' :
                                             cat === 'Lead' ? '⚡ Lead' :
                                             cat === 'Advisor' ? '🎓 Advisor' :
                                             cat === 'Member' ? '👤 Member' : `🏷️ ${cat}`}
                                          </option>
                                        ))}
                                        <option value="__CUSTOM__">➕ + Custom Category...</option>
                                      </select>
                                    </td>

                                    <td className="py-3.5 px-4">
                                      {m.is_override ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                          👑 Override
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                                          ⚙️ Auto Inferred
                                        </span>
                                      )}
                                    </td>

                                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                                      {m.department}
                                    </td>

                                    <td className="py-3.5 px-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          onClick={() => setEditingCommitteeMember(m)}
                                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                                          title="Edit Member"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          onClick={() => handleDeleteCommitteeMember(m.id)}
                                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 transition-colors"
                                          title="Remove from Committee"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 1: LANDING PAGE CMS */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">Public Landing Page Text & Content CMS</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-6">
                Edit any piece of public text below. Changes are saved directly into the SQLite database and appear immediately on the live landing page.
              </p>

              {/* Quick Jump Links for Sections */}
              <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 px-2 py-1 flex items-center">Quick Jump:</span>
                <a
                  href="#cms_hero_section"
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all"
                >
                  1. Hero Header
                </a>
                <a
                  href="#cms_mission_section"
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all"
                >
                  2. Hero Mission
                </a>
                <a
                  href="#cms_agenda_section"
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all"
                >
                  3. Agenda Overview
                </a>
                <a
                  href="#cms_milestones_section"
                  className="px-3 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:border-amber-500 flex items-center gap-1 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>4. Milestones & Events ({agenda.length})</span>
                </a>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {/* 1. Hero Title & Subtitle */}
                <div id="cms_hero_section" className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 scroll-mt-28">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-2 font-bold">Section: Hero Header</span>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Main Club Heading</label>
                      <input
                        type="text"
                        defaultValue={siteContent.hero_title?.content || ''}
                        id="cms_hero_title"
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tagline / Subtitle</label>
                      <input
                        type="text"
                        defaultValue={siteContent.hero_title?.meta?.subtitle || ''}
                        id="cms_hero_subtitle"
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status Badge Text</label>
                      <input
                        type="text"
                        defaultValue={siteContent.hero_title?.meta?.badge || ''}
                        id="cms_hero_badge"
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const title = (document.getElementById('cms_hero_title') as HTMLInputElement).value;
                        const subtitle = (document.getElementById('cms_hero_subtitle') as HTMLInputElement).value;
                        const badge = (document.getElementById('cms_hero_badge') as HTMLInputElement).value;
                        handleSaveContent('hero_title', 'Main Hero Heading', title, {
                          subtitle,
                          badge,
                          cta_primary_text: 'Join the Robotics Club',
                          cta_secondary_text: 'Explore Projects & Lab'
                        });
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Hero Header</span>
                    </button>
                  </div>
                </div>

                {/* 2. Hero Mission Statement */}
                <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-2 font-bold">Section: Hero Mission</span>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mission Statement Narrative</label>
                      <textarea
                        rows={3}
                        defaultValue={siteContent.hero_mission?.content || ''}
                        id="cms_hero_mission"
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const content = (document.getElementById('cms_hero_mission') as HTMLTextAreaElement).value;
                        handleSaveContent('hero_mission', 'Hero Mission Statement', content, siteContent.hero_mission?.meta);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Mission Statement</span>
                    </button>
                  </div>
                </div>

                {/* 3. Agenda Section Overview */}
                <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-2 font-bold">Section: Agenda Overview</span>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Agenda Section Overview</label>
                      <textarea
                        rows={3}
                        defaultValue={siteContent.agenda_overview?.content || ''}
                        id="cms_agenda_overview"
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const content = (document.getElementById('cms_agenda_overview') as HTMLTextAreaElement).value;
                        handleSaveContent('agenda_overview', 'Club Mission & Vision', content, siteContent.agenda_overview?.meta);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Agenda Overview</span>
                    </button>
                  </div>
                </div>

                {/* 4. Upcoming Club Milestones & Scheduled Events */}
                <div id="cms_milestones_section" className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-6 scroll-mt-28">
                  <div>
                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-2 font-bold flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      Section: Upcoming Club Milestones
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      Customize the section headings and manage the scheduled field trials, workshops, and competitions displayed live to all visitors.
                    </p>

                    {/* Section Header & Subtitle */}
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 mb-6 shadow-xs">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Milestones Section Title
                        </label>
                        <input
                          type="text"
                          defaultValue={siteContent.milestones_header?.content || 'Upcoming Club Milestones'}
                          id="cms_milestones_title"
                          placeholder="Upcoming Club Milestones"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Milestones Section Subtitle
                        </label>
                        <input
                          type="text"
                          defaultValue={siteContent.milestones_header?.meta?.subtitle || 'Scheduled field trials, workshops, and competitions'}
                          id="cms_milestones_subtitle"
                          placeholder="Scheduled field trials, workshops, and competitions"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const title = (document.getElementById('cms_milestones_title') as HTMLInputElement).value;
                          const subtitle = (document.getElementById('cms_milestones_subtitle') as HTMLInputElement).value;
                          handleSaveContent('milestones_header', 'Upcoming Club Milestones', title, { subtitle });
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Milestones Heading & Subtitle</span>
                      </button>
                    </div>
                  </div>

                  {/* Add New Milestone Event Form */}
                  <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-indigo-500" />
                      Add New Milestone Event
                    </h4>
                    <form onSubmit={handleAddAgendaItem} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Event Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Line Follower Robot Bootcamp"
                            value={newAgendaItem.title}
                            onChange={e => setNewAgendaItem({ ...newAgendaItem, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Badge Type</label>
                          <select
                            value={newAgendaItem.badge}
                            onChange={e => setNewAgendaItem({ ...newAgendaItem, badge: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold"
                          >
                            <option value="Workshop">Workshop</option>
                            <option value="Field Trial">Field Trial</option>
                            <option value="Competition">Competition</option>
                            <option value="Bootcamp">Bootcamp</option>
                            <option value="Hackathon">Hackathon</option>
                            <option value="Seminar">Seminar</option>
                            <option value="Exhibition">Exhibition</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Date / Timeframe (e.g. October 2026) *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. October 2026 or Nov 15, 2026"
                            value={newAgendaItem.date}
                            onChange={e => setNewAgendaItem({ ...newAgendaItem, date: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Display Priority (optional)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={newAgendaItem.order_num}
                            onChange={e => setNewAgendaItem({ ...newAgendaItem, order_num: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Description / Key Objectives *</label>
                        <textarea
                          rows={2}
                          required
                          placeholder="Brief summary of activities, target audience, hardware kits..."
                          value={newAgendaItem.description}
                          onChange={e => setNewAgendaItem({ ...newAgendaItem, description: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Milestone Event</span>
                      </button>
                    </form>
                  </div>

                  {/* Existing Milestones List */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                      <span>Scheduled Milestones on Live Website ({agenda.length})</span>
                      <span className="text-[11px] font-mono text-slate-400">Syncs directly to SQLite</span>
                    </h4>

                    {agenda.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No milestones scheduled yet. Add one above!</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {agenda.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3 shadow-xs"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                  {item.badge || 'Event'}
                                </span>
                                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{item.date}</span>
                              </div>
                              <h5 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h5>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-3">
                                {item.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <button
                                onClick={() => setEditingAgendaItem(item)}
                                className="px-3 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-bold transition-all flex items-center gap-1"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteAgendaItem(item.id)}
                                className="px-3 py-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition-all flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT DATA TABLE */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Member & User Registry</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">View registered accounts, approve pending member applications, and assign Admin/Member roles.</p>
                </div>

                {/* Search */}
                <input
                  type="text"
                  placeholder="Filter users..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 w-full sm:w-64 shadow-xs"
                />
              </div>

              {/* Mobile Card View (sm:hidden) */}
              <div className="block sm:hidden space-y-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={u.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/40 shadow-xs flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white text-sm block truncate">{u.name}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">{u.email}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0 border ${
                        u.status === 'approved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                          : u.status === 'pending'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30 animate-pulse'
                          : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/30'
                      }`}>
                        {u.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Role</span>
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value as 'Admin' | 'Member')}
                          className={`mt-1 px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none w-full ${
                            u.role === 'Admin'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                              : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                          }`}
                        >
                          <option value="Member">Member</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Department</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate mt-1">
                          {u.department || 'JSTU'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                        ID: {u.student_id || '—'}
                      </span>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {u.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'approved')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                            title="Approve Application"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenAssignSessionModal(u)}
                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 transition-colors"
                          title="Assign to Committee Sessions"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-1.5 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                          title="Edit User"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (hidden sm:block) */}
              <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 uppercase font-mono tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <img
                            src={u.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500/40 shadow-xs"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value as 'Admin' | 'Member')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                              u.role === 'Admin'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                            }`}
                          >
                            <option value="Member">Member</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                            u.status === 'approved'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                              : u.status === 'pending'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 animate-pulse'
                              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/30'
                          }`}>
                            {u.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {u.department || '—'}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {u.student_id || '—'}
                        </td>


                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(u.id, 'approved')}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                                title="Approve Application"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenAssignSessionModal(u)}
                              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 transition-colors"
                              title="Assign to Committee Sessions"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setEditingUser(u)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                              title="Edit User"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROJECTS CMS */}
        {activeTab === 'projects' && (
          <div className="space-y-6 sm:space-y-8">
            {/* 1. Pending Proposals Review Queue */}
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1424] border border-amber-300/80 dark:border-amber-500/40 shadow-sm dark:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                      <span>Member Project Proposals Review</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950">
                        {proposals.length} Pending
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Proposals submitted by authenticated members. Super Admin approval publishes them live into the featured robotics showcase.
                    </p>
                  </div>
                </div>
              </div>

              {proposals.length === 0 ? (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/80" />
                  <p className="text-xs font-semibold">No pending member proposals waiting for review. All clear!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {proposals.map((prop) => (
                    <div key={prop.id} className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                            {prop.category}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            Submitted by <strong className="text-slate-900 dark:text-white">{prop.submitted_by_name || 'Member'}</strong>
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">{prop.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-3 leading-relaxed">
                          {prop.description}
                        </p>
                        {prop.tech_stack && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {(Array.isArray(prop.tech_stack) ? prop.tech_stack : JSON.parse(prop.tech_stack || '[]')).map((t: string) => (
                              <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-amber-200/60 dark:border-amber-500/20">
                        <button
                          onClick={() => handleProposalDecision(prop.id, 'rejected')}
                          className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleProposalDecision(prop.id, 'approved')}
                          className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1 active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Publish Live</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Add New Project Form */}
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4">Add New Robotics Project</h2>
              <form onSubmit={handleAddProject} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Project Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LineFollower-X"
                      value={newProject.title}
                      onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select
                      value={newProject.category}
                      onChange={e => setNewProject({ ...newProject, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    >
                      {superConfig.project_categories?.filter((c: string) => c !== 'All').map((cat: string) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Project mission, mechanical components, sensors used..."
                    value={newProject.description}
                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select
                      value={newProject.status}
                      onChange={e => setNewProject({ ...newProject, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    >
                      <option value="Active Development">Active Development</option>
                      <option value="Field Testing">Field Testing</option>
                      <option value="Prototype Verified">Prototype Verified</option>
                      <option value="Competition Ready">Competition Ready</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newProject.image_url}
                      onChange={e => setNewProject({ ...newProject, image_url: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">GitHub Repo Link</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={newProject.github_link}
                      onChange={e => setNewProject({ ...newProject, github_link: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tech Stack (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="ROS2, Python, LiDAR, OpenCV..."
                      value={newProject.tech_stack}
                      onChange={e => setNewProject({ ...newProject, tech_stack: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Team Members (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="Tahmid, Sadia, Fahim..."
                      value={newProject.team_members}
                      onChange={e => setNewProject({ ...newProject, team_members: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </form>
            </div>

            {/* 3. Existing Projects List with Edit and Delete */}
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4">Existing Robotics Projects ({projects.length})</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {projects.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          {p.category}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          ● {p.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">{p.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingProject({
                          ...p,
                          tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack.join(', ') : p.tech_stack,
                          team_members: Array.isArray(p.team_members) ? p.team_members.join(', ') : p.team_members
                        })}
                        className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        title="Edit Project"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DIRECTORY ROLES */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">Directory & Committee Roles Management</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Add or remove roles shown on the public directory (e.g., Director, Vice Chair, Standard Member).
              </p>

              {/* Add Role Form */}
              <form onSubmit={handleAddRole} className="flex flex-col sm:flex-row gap-3 mb-8">
                <input
                  type="text"
                  required
                  placeholder="Role title (e.g. Avionics Engineer)..."
                  value={newRole.name}
                  onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                />
                <input
                  type="number"
                  placeholder="Priority (1-10)"
                  value={newRole.priority}
                  onChange={e => setNewRole({ ...newRole, priority: parseInt(e.target.value) || 5 })}
                  className="w-full sm:w-28 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Role</span>
                </button>
              </form>

              {/* Roles List */}
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {roles.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">{r.name}</span>
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">Priority: {r.priority}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteRole(r.id)}
                      className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">Broadcast Club Announcement</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Post notifications and alerts directly to all member dashboards.
              </p>

              <form onSubmit={handleAddAnnouncement} className="space-y-4 mb-8">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lab Access Hours for Rover Assembly..."
                      value={newAnnouncement.title}
                      onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                    <select
                      value={newAnnouncement.priority}
                      onChange={e => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Content</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Announcement details, location, requisitions..."
                    value={newAnnouncement.content}
                    onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Broadcast Announcement</span>
                </button>
              </form>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Recent Announcements</h3>
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          {a.priority}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{a.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{a.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-700 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate pr-2">Edit User: {editingUser.name}</h3>
                <button onClick={() => setEditingUser(null)} className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUserModal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>



                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={editingUser.department || ''}
                    onChange={e => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student ID</label>
                  <input
                    type="text"
                    value={editingUser.student_id || ''}
                    onChange={e => setEditingUser({ ...editingUser, student_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Profile Photo</label>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <img
                      src={editingUser.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(editingUser.name || 'Member')}`}
                      alt="User avatar preview"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xs flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(editingUser.name || 'Member')}`;
                      }}
                    />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleImageFileToBase64(f, (b64) => setEditingUser({ ...editingUser, profile_photo: b64 }));
                            }}
                            className="hidden"
                          />
                        </label>
                        {editingUser.profile_photo && (
                          <button
                            type="button"
                            onClick={() => setEditingUser({ ...editingUser, profile_photo: '' })}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="Or enter public photo URL: https://..."
                        value={editingUser.profile_photo || ''}
                        onChange={e => setEditingUser({ ...editingUser, profile_photo: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                  <textarea
                    rows={2}
                    value={editingUser.bio || ''}
                    onChange={e => setEditingUser({ ...editingUser, bio: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center transition-all active:scale-98"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project Edit Modal */}
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate pr-2">Edit Robotics Project: {editingProject.title}</h3>
                <button onClick={() => setEditingProject(null)} className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Project Title</label>
                    <input
                      type="text"
                      required
                      value={editingProject.title}
                      onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select
                      value={editingProject.category}
                      onChange={e => setEditingProject({ ...editingProject, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    >
                      {superConfig.project_categories?.filter((c: string) => c !== 'All').map((cat: string) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={editingProject.description}
                    onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select
                      value={editingProject.status}
                      onChange={e => setEditingProject({ ...editingProject, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Active Development">Active Development</option>
                      <option value="Field Testing">Field Testing</option>
                      <option value="Prototype Verified">Prototype Verified</option>
                      <option value="Competition Ready">Competition Ready</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={editingProject.image_url || ''}
                      onChange={e => setEditingProject({ ...editingProject, image_url: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">GitHub Repo Link</label>
                    <input
                      type="url"
                      value={editingProject.github_link || ''}
                      onChange={e => setEditingProject({ ...editingProject, github_link: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tech Stack (comma-separated)</label>
                    <input
                      type="text"
                      value={editingProject.tech_stack || ''}
                      onChange={e => setEditingProject({ ...editingProject, tech_stack: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Team Members (comma-separated)</label>
                    <input
                      type="text"
                      value={editingProject.team_members || ''}
                      onChange={e => setEditingProject({ ...editingProject, team_members: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center transition-all active:scale-98"
                  >
                    Update Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Milestone / Agenda Item Edit Modal */}
        {editingAgendaItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-xl w-full shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Edit Milestone Event</h3>
                    <p className="text-[11px] text-slate-500">Updates live across the university landing page</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingAgendaItem(null)} 
                  className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateAgendaItem} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Event Title *</label>
                    <input
                      type="text"
                      required
                      value={editingAgendaItem.title}
                      onChange={e => setEditingAgendaItem({ ...editingAgendaItem, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Badge Type</label>
                    <select
                      value={editingAgendaItem.badge || 'Workshop'}
                      onChange={e => setEditingAgendaItem({ ...editingAgendaItem, badge: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="Workshop">Workshop</option>
                      <option value="Field Trial">Field Trial</option>
                      <option value="Competition">Competition</option>
                      <option value="Bootcamp">Bootcamp</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Exhibition">Exhibition</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date / Timeframe *</label>
                    <input
                      type="text"
                      required
                      value={editingAgendaItem.date}
                      onChange={e => setEditingAgendaItem({ ...editingAgendaItem, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Display Priority Order</label>
                    <input
                      type="number"
                      value={editingAgendaItem.order_num ?? 0}
                      onChange={e => setEditingAgendaItem({ ...editingAgendaItem, order_num: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description / Objectives *</label>
                  <textarea
                    rows={3}
                    required
                    value={editingAgendaItem.description}
                    onChange={e => setEditingAgendaItem({ ...editingAgendaItem, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingAgendaItem(null)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center transition-all active:scale-98"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* COMMITTEE MANAGEMENT MODALS                             */}
        {/* ======================================================== */}

        {/* 1. Add Committee Modal */}
        {isAddCommitteeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Committee Tenure</h3>
                    <p className="text-xs text-slate-500">Every executive tenure gets a unique number</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddCommitteeModalOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCommittee} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Committee Number *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={newCommittee.committee_number}
                      onChange={e => setNewCommittee({ ...newCommittee, committee_number: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Session Years *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2026–2027"
                      value={newCommittee.session_years}
                      onChange={e => setNewCommittee({ ...newCommittee, session_years: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Committee Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2nd Executive Committee"
                    value={newCommittee.title}
                    onChange={e => setNewCommittee({ ...newCommittee, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Theme / Motto</label>
                  <input
                    type="text"
                    placeholder="e.g. Autonomous Horizons & Scalable Robotics"
                    value={newCommittee.theme_motto}
                    onChange={e => setNewCommittee({ ...newCommittee, theme_motto: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description / Charter</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of this committee tenure..."
                    value={newCommittee.description}
                    onChange={e => setNewCommittee({ ...newCommittee, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="newCommIsCurrent"
                    checked={newCommittee.is_current === 1}
                    onChange={e => setNewCommittee({ ...newCommittee, is_current: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <label htmlFor="newCommIsCurrent" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Set as LIVE running committee immediately
                  </label>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddCommitteeModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md"
                  >
                    Create Tenure
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. Edit Committee Modal */}
        {editingCommittee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Committee #{editingCommittee.committee_number}</h3>
                    <p className="text-xs text-slate-500">{editingCommittee.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingCommittee(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateCommittee} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Committee Number *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={editingCommittee.committee_number}
                      onChange={e => setEditingCommittee({ ...editingCommittee, committee_number: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Session Years *</label>
                    <input
                      type="text"
                      required
                      value={editingCommittee.session_years}
                      onChange={e => setEditingCommittee({ ...editingCommittee, session_years: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Committee Title *</label>
                  <input
                    type="text"
                    required
                    value={editingCommittee.title}
                    onChange={e => setEditingCommittee({ ...editingCommittee, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Theme / Motto</label>
                  <input
                    type="text"
                    value={editingCommittee.theme_motto || ''}
                    onChange={e => setEditingCommittee({ ...editingCommittee, theme_motto: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingCommittee.description || ''}
                    onChange={e => setEditingCommittee({ ...editingCommittee, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="editCommIsCurrent"
                    checked={editingCommittee.is_current === 1}
                    onChange={e => setEditingCommittee({ ...editingCommittee, is_current: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <label htmlFor="editCommIsCurrent" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Set as LIVE running committee
                  </label>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingCommittee(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. Add Committee Member Modal */}
        {isAddMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Committee Member</h3>
                    <p className="text-xs text-slate-500">Assign member to Committee #{committees.find(c => c.id === selectedCommitteeId)?.committee_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Prefill from registered user picker */}
              {users.length > 0 && (
                <div className="mb-5 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50">
                  <label className="block text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-1">
                    ⚡ Quick Autofill from Registered User
                  </label>
                  <select
                    value={newCommitteeMember.user_id}
                    onChange={e => {
                      const uId = e.target.value;
                      if (!uId) {
                        setNewCommitteeMember(prev => ({ ...prev, user_id: '' }));
                        return;
                      }
                      const found = users.find(u => u.id.toString() === uId);
                      if (found) {
                        setNewCommitteeMember(prev => ({
                          ...prev,
                          user_id: uId,
                          name: found.name || prev.name,
                          email: found.email || prev.email,
                          department: found.department || prev.department,
                          student_id: found.student_id || prev.student_id,
                          profile_photo: found.profile_photo || prev.profile_photo,
                          bio: found.bio || prev.bio,
                          designation: found.committee_role || prev.designation,
                          category: found.committee_category || prev.category
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                  >
                    <option value="">-- Choose a registered member to auto-fill --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) · {u.department || 'JSTU'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Committee Session(s) Picker */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign to Committee Session(s) *
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  Select which committee session(s) this member belongs to. Check multiple sessions to show them across tenures.
                </p>
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 max-h-36 overflow-y-auto">
                  {committees.map(c => {
                    const isChecked = (newCommitteeMember.target_committee_ids || [selectedCommitteeId]).includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            const current = newCommitteeMember.target_committee_ids || (selectedCommitteeId ? [selectedCommitteeId] : []);
                            const next = e.target.checked
                              ? [...current, c.id]
                              : current.filter(id => id !== c.id);
                            setNewCommitteeMember({
                              ...newCommitteeMember,
                              target_committee_ids: next.length > 0 ? next : [c.id]
                            });
                          }}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">
                            Committee #{c.committee_number}: {c.title}
                          </span>
                          <span className="ml-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            (Session {c.session_years}){c.is_current === 1 ? ' ★ Active' : ''}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleAddCommitteeMember} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newCommitteeMember.name}
                      onChange={e => setNewCommitteeMember({ ...newCommitteeMember, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={newCommitteeMember.email}
                      onChange={e => setNewCommitteeMember({ ...newCommitteeMember, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Designation / Role Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. President & System Architect"
                      value={newCommitteeMember.designation}
                      onChange={e => setNewCommitteeMember({ ...newCommitteeMember, designation: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category (Classification)</label>
                    <div className="space-y-1.5">
                      <select
                        value={isCustomCategoryMode ? '__CUSTOM__' : newCommitteeMember.category}
                        onChange={e => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomCategoryMode(true);
                          } else {
                            setIsCustomCategoryMode(false);
                            setNewCommitteeMember({ ...newCommitteeMember, category: e.target.value });
                          }
                        }}
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Auto">⚙️ Auto (Smart Detect from Role)</option>
                        {customCategories.map(cat => (
                          <option key={cat} value={cat}>
                            {cat === 'Executive' ? '👑 Executive (ExCom)' :
                             cat === 'Lead' ? '⚡ Lead' :
                             cat === 'Advisor' ? '🎓 Advisor' :
                             cat === 'Member' ? '👤 General Member' : `🏷️ ${cat}`}
                          </option>
                        ))}
                        <option value="__CUSTOM__">➕ Enter Custom Category...</option>
                      </select>

                      {isCustomCategoryMode && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Autonomous Flight Wing, Sub-Executive..."
                            value={customCategoryInput}
                            onChange={e => {
                              setCustomCategoryInput(e.target.value);
                              setNewCommitteeMember({ ...newCommitteeMember, category: e.target.value });
                            }}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customCategoryInput.trim()) {
                                handleCreateNewCategory(customCategoryInput);
                              }
                              setIsCustomCategoryMode(false);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                          >
                            Set
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={newCommitteeMember.department}
                      onChange={e => setNewCommitteeMember({ ...newCommitteeMember, department: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 210101"
                      value={newCommitteeMember.student_id}
                      onChange={e => setNewCommitteeMember({ ...newCommitteeMember, student_id: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Profile Photo</label>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 mb-3">
                    <img
                      src={newCommitteeMember.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newCommitteeMember.name || 'Member')}`}
                      alt="Photo preview"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-500/40 shadow-xs flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newCommitteeMember.name || 'Member')}`;
                      }}
                    />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleImageFileToBase64(f, (b64) => setNewCommitteeMember({ ...newCommitteeMember, profile_photo: b64 }));
                            }}
                            className="hidden"
                          />
                        </label>
                        {newCommitteeMember.profile_photo && (
                          <button
                            type="button"
                            onClick={() => setNewCommitteeMember({ ...newCommitteeMember, profile_photo: '' })}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="Or enter public photo URL: https://..."
                        value={newCommitteeMember.profile_photo}
                        onChange={e => setNewCommitteeMember({ ...newCommitteeMember, profile_photo: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={newCommitteeMember.display_order}
                    onChange={e => setNewCommitteeMember({ ...newCommitteeMember, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Technical Skills</label>
                  <input
                    type="text"
                    placeholder="ROS2, SLAM, Embedded C++, Altium"
                    value={newCommitteeMember.skills}
                    onChange={e => setNewCommitteeMember({ ...newCommitteeMember, skills: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bio / Profile Summary</label>
                  <textarea
                    rows={2}
                    value={newCommitteeMember.bio}
                    onChange={e => setNewCommitteeMember({ ...newCommitteeMember, bio: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddMemberModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
                  >
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. Edit Committee Member Modal */}
        {editingCommitteeMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Member: {editingCommitteeMember.name}</h3>
                    <p className="text-xs text-slate-500">Update role title, category override, or bio</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingCommitteeMember(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateCommitteeMember} className="space-y-4">
                {/* Committee Session Assignment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Committee Session (Tenure) *
                  </label>
                  <select
                    value={editingCommitteeMember.committee_id || selectedCommitteeId || ''}
                    onChange={e => setEditingCommitteeMember({ ...editingCommitteeMember, committee_id: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                  >
                    {committees.map(c => (
                      <option key={c.id} value={c.id}>
                        Committee #{c.committee_number}: {c.title} (Session {c.session_years}){c.is_current === 1 ? ' ★ Active' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Change this dropdown to move this member into a different committee session tenure.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editingCommitteeMember.name}
                      onChange={e => setEditingCommitteeMember({ ...editingCommitteeMember, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={editingCommitteeMember.email}
                      onChange={e => setEditingCommitteeMember({ ...editingCommitteeMember, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Designation / Role Title *</label>
                    <input
                      type="text"
                      required
                      value={editingCommitteeMember.designation}
                      onChange={e => setEditingCommitteeMember({ ...editingCommitteeMember, designation: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category (Admin Override)</label>
                    <div className="space-y-1.5">
                      <select
                        value={isCustomCategoryMode ? '__CUSTOM__' : editingCommitteeMember.category}
                        onChange={e => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomCategoryMode(true);
                          } else {
                            setIsCustomCategoryMode(false);
                            setEditingCommitteeMember({ ...editingCommitteeMember, category: e.target.value });
                          }
                        }}
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Auto">⚙️ Auto (Smart Detect)</option>
                        {customCategories.map(cat => (
                          <option key={cat} value={cat}>
                            {cat === 'Executive' ? '👑 Executive (ExCom)' :
                             cat === 'Lead' ? '⚡ Lead' :
                             cat === 'Advisor' ? '🎓 Advisor' :
                             cat === 'Member' ? '👤 General Member' : `🏷️ ${cat}`}
                          </option>
                        ))}
                        <option value="__CUSTOM__">➕ Enter Custom Category...</option>
                      </select>

                      {isCustomCategoryMode && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Autonomous Flight Wing..."
                            value={customCategoryInput}
                            onChange={e => {
                              setCustomCategoryInput(e.target.value);
                              setEditingCommitteeMember({ ...editingCommitteeMember, category: e.target.value });
                            }}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customCategoryInput.trim()) {
                                handleCreateNewCategory(customCategoryInput);
                              }
                              setIsCustomCategoryMode(false);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                          >
                            Set
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={editingCommitteeMember.department || ''}
                      onChange={e => setEditingCommitteeMember({ ...editingCommitteeMember, department: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student ID</label>
                    <input
                      type="text"
                      value={editingCommitteeMember.student_id || ''}
                      onChange={e => setEditingCommitteeMember({ ...editingCommitteeMember, student_id: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Profile Photo</label>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 mb-3">
                    <img
                      src={editingCommitteeMember.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(editingCommitteeMember.name || 'Member')}`}
                      alt="Photo preview"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-500/40 shadow-xs flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(editingCommitteeMember.name || 'Member')}`;
                      }}
                    />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleImageFileToBase64(f, (b64) => setEditingCommitteeMember({ ...editingCommitteeMember, profile_photo: b64 }));
                            }}
                            className="hidden"
                          />
                        </label>
                        {editingCommitteeMember.profile_photo && (
                          <button
                            type="button"
                            onClick={() => setEditingCommitteeMember({ ...editingCommitteeMember, profile_photo: '' })}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="Or enter public photo URL: https://..."
                        value={editingCommitteeMember.profile_photo || ''}
                        onChange={e => setEditingCommitteeMember({ ...editingCommitteeMember, profile_photo: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingCommitteeMember.display_order ?? 0}
                    onChange={e => setEditingCommitteeMember({ ...editingCommitteeMember, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Skills</label>
                  <input
                    type="text"
                    value={editingCommitteeMember.skills || ''}
                    onChange={e => setEditingCommitteeMember({ ...editingCommitteeMember, skills: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                  <textarea
                    rows={2}
                    value={editingCommitteeMember.bio || ''}
                    onChange={e => setEditingCommitteeMember({ ...editingCommitteeMember, bio: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingCommitteeMember(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 5. Clone Roster Modal */}
        {isCloneModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500">
                    <Copy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clone Past Roster</h3>
                    <p className="text-xs text-slate-500">Copy members from another year</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCloneModalOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Select a past committee below. All of its members, roles, and profiles will be cloned into the current committee tenure. You can then quickly modify specific members or add new ones.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Source Committee to Copy From</label>
                  <select
                    value={cloneSourceId}
                    onChange={e => setCloneSourceId(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose Committee --</option>
                    {committees.filter(c => c.id !== selectedCommitteeId).map(c => (
                      <option key={c.id} value={c.id}>
                        Committee #{c.committee_number}: {c.title} ({c.session_years}) · {c.total_members_count || 0} members
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCloneModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!cloneSourceId}
                    onClick={handleCloneRoster}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Clone Members Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5b. Dedicated Create Custom Category Modal */}
        {isCreateCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Committee Category</h3>
                    <p className="text-xs text-slate-500">Define a new category or wing for committee members</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsCreateCategoryModalOpen(false);
                    setNewCategoryName('');
                  }}
                  className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous Flight Wing, Sub-Executive..."
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newCategoryName.trim()) {
                      e.preventDefault();
                      handleCreateNewCategory(newCategoryName);
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Popular Suggestions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Sub-Executive',
                    'Autonomous Drone Wing',
                    'Embedded Systems & IoT',
                    'Software & AI Division',
                    'Robo-Soccer Team',
                    'Media & Public Relations',
                    'Advisory Council'
                  ].map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNewCategoryName(sug)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateCategoryModalOpen(false);
                    setNewCategoryName('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newCategoryName.trim()) {
                      handleCreateNewCategory(newCategoryName);
                    }
                  }}
                  disabled={!newCategoryName.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all"
                >
                  Create Category
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Assign Member to Committee Sessions Modal */}
        {assigningSessionUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-3">
                  <img
                    src={assigningSessionUser.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${assigningSessionUser.name}`}
                    alt={assigningSessionUser.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/40"
                  />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Assign Committee Sessions
                    </h3>
                    <p className="text-xs text-slate-500">{assigningSessionUser.name} ({assigningSessionUser.email})</p>
                  </div>
                </div>
                <button
                  onClick={() => setAssigningSessionUser(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUserSessionAssignments} className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select which committee session(s) this member holds. If they hold multiple sessions, check each session and they will appear in all chosen committees!
                </p>

                {/* Session Checkboxes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Active Sessions for {assigningSessionUser.name}:
                  </label>
                  <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 max-h-48 overflow-y-auto">
                    {committees.map(c => {
                      const isChecked = assignedSessionIds.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                            isChecked
                              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700'
                              : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              if (e.target.checked) {
                                setAssignedSessionIds([...assignedSessionIds, c.id]);
                              } else {
                                setAssignedSessionIds(assignedSessionIds.filter(id => id !== c.id));
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <div className="flex-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                Committee #{c.committee_number}: {c.title}
                              </span>
                              <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                                {c.session_years}
                              </span>
                              {c.is_current === 1 && (
                                <span className="text-[10px] text-emerald-600 font-bold">★ Active</span>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Role / Designation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Role / Designation
                    </label>
                    <input
                      type="text"
                      value={assignedSessionRole}
                      onChange={e => setAssignedSessionRole(e.target.value)}
                      placeholder="e.g. Director, President, Member"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={assignedSessionCategory}
                      onChange={e => setAssignedSessionCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Auto">Auto (Smart)</option>
                      <option value="Executive">Executive</option>
                      <option value="Lead">Lead</option>
                      <option value="Advisor">Advisor</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAssigningSessionUser(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Session Assignments</span>
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

export default AdminCMSPanel;
