import React, { useState, useEffect, useRef } from 'react';
import { HardwareShowcaseItem, DEFAULT_HARDWARE_SHOWCASE, HardwareComponentSpec } from '../../data/hardwareShowcaseData';
import { Save, Plus, Edit2, Trash2, X, Check, Eye, ExternalLink, Play, Layers, Cpu, ArrowUp, ArrowDown, Upload, Loader2, CloudUpload } from 'lucide-react';
import { fileToBase64Image } from '../../utils/imageHelper';
import { AdminModalWrapper } from './AdminModalWrapper';

export const AdminHardwareShowcaseManager: React.FC = () => {
  const [items, setItems] = useState<HardwareShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<HardwareShowcaseItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/site-content')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.hardware_showcase?.meta?.items && Array.isArray(data.data.hardware_showcase.meta.items)) {
          setItems(data.data.hardware_showcase.meta.items);
        } else {
          setItems(DEFAULT_HARDWARE_SHOWCASE);
        }
      })
      .catch(err => {
        console.error('Failed to load hardware showcase items', err);
        setItems(DEFAULT_HARDWARE_SHOWCASE);
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
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    setUploadingImage(true);
    try {
      // 1. Process client-side to optimized high-res Base64 (1920x1080, quality 0.90)
      const base64Data = await fileToBase64Image(file, 1920, 1080, 0.9);

      // 2. Dispatch to backend Cloudinary upload endpoint
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          image: base64Data,
          folder: 'jstu_robotics/hardware'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image to Cloudinary');
      }

      const uploadedUrl = data.url;
      setEditingItem(prev => (prev ? { ...prev, imageUrl: uploadedUrl } : null));
      showToast('success', 'Image uploaded to Cloudinary successfully!');
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      showToast('error', err.message || 'Image upload to Cloudinary failed.');
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSave = async (updatedItems: HardwareShowcaseItem[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          key: 'hardware_showcase',
          title: 'Robotics Hardware Showcase',
          content: 'Interactive Hardware Subsystems & Prototypes',
          meta: { items: updatedItems }
        })
      });
      if (!res.ok) throw new Error('Failed to save hardware showcase');
      showToast('success', 'Hardware showcase saved successfully! Changes are live on the landing page.');
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = () => {
    const newItem: HardwareShowcaseItem = {
      id: `hw_${Date.now()}`,
      title: 'New Robotic Hardware System',
      category: 'Autonomous Systems & Robotics',
      badge: 'NEW PROTOTYPE',
      imageUrl: '/Assets/hero-robot.jpg',
      summary: 'Brief overview of this robotics prototype, its mission, and its engineering capabilities.',
      howItWorks: 'Describe the sensory fusion, electronic architecture, compute stack, and control algorithms here.',
      components: [
        { name: 'Compute Controller', spec: 'NVIDIA Jetson / STM32' },
        { name: 'Sensory Array', spec: 'LiDAR & Depth Vision' }
      ],
      docUrl: 'https://github.com/jsturoboticsclub',
      embedUrl: '',
      specsQuick: [
        { label: 'Compute', value: 'Jetson' },
        { label: 'Status', value: 'Operational' }
      ]
    };
    setEditingItem(newItem);
  };

  const handleEdit = (item: HardwareShowcaseItem) => {
    setEditingItem({
      ...item,
      components: item.components ? [...item.components] : [],
      specsQuick: item.specsQuick ? [...item.specsQuick] : []
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this hardware showcase item?')) {
      const updated = items.filter(i => i.id !== id);
      setItems(updated);
      handleSave(updated);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setItems(next);
    handleSave(next);
  };

  const saveEditingItem = () => {
    if (!editingItem) return;
    let nextList: HardwareShowcaseItem[];
    const exists = items.some(i => i.id === editingItem.id);
    if (exists) {
      nextList = items.map(i => (i.id === editingItem.id ? editingItem : i));
    } else {
      nextList = [...items, editingItem];
    }
    setItems(nextList);
    setEditingItem(null);
    handleSave(nextList);
  };

  // Helpers for editing components array
  const addComponentToEdit = () => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      components: [...editingItem.components, { name: 'New Subsystem', spec: 'Specification detail' }]
    });
  };

  const updateComponentInEdit = (index: number, field: 'name' | 'spec', value: string) => {
    if (!editingItem) return;
    const comps = [...editingItem.components];
    comps[index][field] = value;
    setEditingItem({ ...editingItem, components: comps });
  };

  const removeComponentFromEdit = (index: number) => {
    if (!editingItem) return;
    const comps = editingItem.components.filter((_, i) => i !== index);
    setEditingItem({ ...editingItem, components: comps });
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono">
        Loading Hardware Showcase Manager...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-4 rounded-xl text-xs font-mono font-bold fixed top-20 right-6 z-50 shadow-xl border ${
          toastMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500 text-rose-400'
        }`}>
          {toastMessage.text}
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Robotics Hardware Showcase CMS</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage the hardware prototypes featured on the landing page. Update component breakdown, how it works architecture, images, documentation links, and embedded videos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hardware Prototype</span>
          </button>
        </div>
      </div>

      {/* Showcase Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image Preview Banner */}
              <div className="h-44 relative bg-slate-950 overflow-hidden group">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900/90 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                  {item.category}
                </span>
                {item.badge && (
                  <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Text Information */}
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>

                {/* Subsystem Count Badge */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {item.components?.length || 0} Subsystems
                  </span>
                  {item.docUrl && (
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                      <Check className="w-3 h-3" /> Docs Linked
                    </span>
                  )}
                  {item.embedUrl && (
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 flex items-center gap-1 font-bold">
                      <Play className="w-3 h-3" /> Video Linked
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card Action Controls */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/30 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === items.length - 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal for Adding / Modifying an Item */}
      {editingItem && (
        <AdminModalWrapper isOpen={!!editingItem} onClose={() => setEditingItem(null)}>
          <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 my-auto max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {items.some(i => i.id === editingItem.id) ? 'Edit Hardware Prototype' : 'Add New Hardware Prototype'}
                </h3>
                <p className="text-xs text-slate-500">Configure visual imagery, component specifications, and documentation links.</p>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Prototype Title
                  </label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Discipline / Category
                  </label>
                  <input
                    type="text"
                    value={editingItem.category}
                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingItem.badge || ''}
                    placeholder="e.g. FLAGSHIP DEPLOYMENT"
                    onChange={e => setEditingItem({ ...editingItem, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Image URL or Path</span>
                    {editingItem.imageUrl && (editingItem.imageUrl.includes('cloudinary') || editingItem.imageUrl.includes('res.cloudinary')) && (
                      <span className="text-[10px] text-emerald-500 font-mono font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Cloudinary CDN Active
                      </span>
                    )}
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingItem.imageUrl}
                      onChange={e => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                      placeholder="/Assets/hero-robot.jpg or https://res.cloudinary.com/..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />

                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Upload to Cloudinary Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-500/25 transition-all flex-shrink-0 cursor-pointer"
                      title="Select a photo from device and upload directly to Cloudinary"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <CloudUpload className="w-3.5 h-3.5" />
                          <span>Upload to Cloudinary</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Preset Quick Image Pickers & Live Preview */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">Presets:</span>
                      <button
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, imageUrl: '/Assets/hero-robot.jpg' })}
                        className="text-[10px] font-mono text-indigo-500 hover:underline"
                      >
                        [Rover]
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, imageUrl: '/Assets/uav-drone.jpg' })}
                        className="text-[10px] font-mono text-indigo-500 hover:underline"
                      >
                        [Drone]
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, imageUrl: '/Assets/robotic-arm.jpg' })}
                        className="text-[10px] font-mono text-indigo-500 hover:underline"
                      >
                        [Arm]
                      </button>
                    </div>

                    {editingItem.imageUrl && (
                      <div className="flex items-center gap-2">
                        <img
                          src={editingItem.imageUrl}
                          alt="Preview"
                          className="w-7 h-7 rounded-lg object-cover border border-slate-300 dark:border-slate-700 bg-slate-900"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]">
                          {editingItem.imageUrl.startsWith('http') ? 'Remote URL' : 'Local Asset'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Summary
                </label>
                <textarea
                  rows={2}
                  value={editingItem.summary}
                  onChange={e => setEditingItem({ ...editingItem, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                  How It Works & Architecture Description
                </label>
                <textarea
                  rows={3}
                  value={editingItem.howItWorks}
                  onChange={e => setEditingItem({ ...editingItem, howItWorks: e.target.value })}
                  placeholder="Explain the sensors, fusion algorithms, odometry, and controllers..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed"
                />
              </div>

              {/* Dynamic Components Subsystem List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    Integrated Subsystems & Specifications ({editingItem.components?.length || 0})
                  </label>
                  <button
                    type="button"
                    onClick={addComponentToEdit}
                    className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subsystem</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editingItem.components?.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={c.name}
                        onChange={e => updateComponentInEdit(idx, 'name', e.target.value)}
                        placeholder="Component (e.g. Primary LiDAR)"
                        className="w-1/3 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                      <input
                        type="text"
                        value={c.spec}
                        onChange={e => updateComponentInEdit(idx, 'spec', e.target.value)}
                        placeholder="Specification (e.g. 360° 30m range)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeComponentFromEdit(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* External URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Documentation URL (GitHub or Wiki)
                  </label>
                  <input
                    type="text"
                    value={editingItem.docUrl || ''}
                    onChange={e => setEditingItem({ ...editingItem, docUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Video / Demo Embed URL (YouTube embed)
                  </label>
                  <input
                    type="text"
                    value={editingItem.embedUrl || ''}
                    onChange={e => setEditingItem({ ...editingItem, embedUrl: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditingItem}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
              >
                <Save className="w-4 h-4" />
                <span>Save Prototype</span>
              </button>
            </div>
          </div>
        </AdminModalWrapper>
      )}
    </div>
  );
};
