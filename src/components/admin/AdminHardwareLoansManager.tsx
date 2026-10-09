import React, { useState, useEffect } from 'react';
import { 
  Wrench, CheckCircle2, Clock, AlertCircle, XCircle, 
  RotateCcw, Search, User, Calendar, ShieldCheck, Loader2,
  Plus, Edit3, Trash2, Cpu, Box, Layers, X, Save, Sparkles
} from 'lucide-react';
import { AdminModalWrapper } from './AdminModalWrapper';

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  spec: string;
  badge: string;
  type: 'project' | 'board' | 'sensor' | 'consumable';
  total_stock: number;
  available_stock: number;
  image_url?: string;
  status: 'available' | 'maintenance' | 'reserved';
}

const CATEGORY_PRESETS = [
  'Flagship Projects',
  'Microcontrollers & Compute',
  'Sensors & Actuators',
  'Consumables & Prototyping'
];

export const AdminHardwareLoansManager: React.FC = () => {
  // Main view: 'requisitions' | 'inventory'
  const [activeSubTab, setActiveSubTab] = useState<'requisitions' | 'inventory'>('requisitions');

  // --- LOANS STATE ---
  const [loans, setLoans] = useState<any[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [loanFilter, setLoanFilter] = useState<'all' | 'pending' | 'approved' | 'active' | 'returned' | 'rejected'>('all');
  const [loanSearch, setLoanSearch] = useState('');
  const [processingLoanId, setProcessingLoanId] = useState<number | null>(null);

  // --- INVENTORY STATE ---
  const [inventory, setInventory] = useState<EquipmentItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inventorySearch, setInventorySearch] = useState('');
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EquipmentItem | null>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'Microcontrollers & Compute',
    spec: '',
    badge: 'HARDWARE',
    type: 'board' as 'project' | 'board' | 'sensor' | 'consumable',
    total_stock: 1,
    available_stock: 1,
    status: 'available' as 'available' | 'maintenance' | 'reserved',
    image_url: ''
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const token = localStorage.getItem('token');

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  // --- FETCH LOANS ---
  const fetchLoans = async () => {
    if (!token) return;
    try {
      setLoadingLoans(true);
      const res = await fetch(`/api/admin/hardware/loans?status=${loanFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLoans(data.loans || []);
      }
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setLoadingLoans(false);
    }
  };

  // --- FETCH INVENTORY ---
  const fetchInventory = async () => {
    try {
      setLoadingInventory(true);
      const res = await fetch('/api/hardware/inventory');
      const data = await res.json();
      if (data.success) {
        setInventory(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load equipment inventory:', err);
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [loanFilter]);

  useEffect(() => {
    fetchInventory();
  }, []);

  // --- UPDATE LOAN STATUS ---
  const handleUpdateStatus = async (loanId: number, status: string) => {
    if (!token) return;
    setProcessingLoanId(loanId);
    try {
      const res = await fetch(`/api/admin/hardware/loans/${loanId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', data.message);
        fetchLoans();
        fetchInventory(); // Synchronize stock
      } else {
        showToast('error', data.error || 'Failed to update loan status');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Network error');
    } finally {
      setProcessingLoanId(null);
    }
  };

  // --- SAVE EQUIPMENT (ADD OR EDIT) ---
  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category.trim()) {
      showToast('error', 'Please provide equipment title and category.');
      return;
    }

    setSavingItem(true);
    try {
      const isEditing = Boolean(editingItem);
      const url = isEditing
        ? `/api/admin/hardware/inventory/${editingItem!.id}`
        : '/api/admin/hardware/inventory';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('success', data.message || 'Equipment inventory saved successfully');
        setIsAddModalOpen(false);
        setEditingItem(null);
        fetchInventory();
      } else {
        showToast('error', data.error || 'Failed to save equipment item');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Network error');
    } finally {
      setSavingItem(false);
    }
  };

  // --- DELETE EQUIPMENT ---
  const handleDeleteEquipment = async (item: EquipmentItem) => {
    try {
      const res = await fetch(`/api/admin/hardware/inventory/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `"${item.name}" removed from inventory`);
        setItemToDelete(null);
        fetchInventory();
      } else {
        showToast('error', data.error || 'Failed to delete equipment item');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Network error');
    }
  };

  // --- QUICK STOCK ADJUSTMENT ---
  const handleAdjustStock = async (item: EquipmentItem, delta: number) => {
    const newAvailable = Math.max(0, Math.min(item.total_stock, item.available_stock + delta));
    if (newAvailable === item.available_stock) return;

    try {
      const res = await fetch(`/api/admin/hardware/inventory/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          available_stock: newAvailable
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInventory(prev => prev.map(eq => eq.id === item.id ? { ...eq, available_stock: newAvailable } : eq));
      }
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    }
  };

  // Open modal for editing
  const openEditModal = (item: EquipmentItem) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      name: item.name,
      category: item.category,
      spec: item.spec || '',
      badge: item.badge || 'HARDWARE',
      type: item.type || 'sensor',
      total_stock: item.total_stock ?? 1,
      available_stock: item.available_stock ?? 1,
      status: item.status || 'available',
      image_url: item.image_url || ''
    });
    setIsAddModalOpen(true);
  };

  // Open modal for adding new
  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      id: '',
      name: '',
      category: 'Microcontrollers & Compute',
      spec: '',
      badge: 'HARDWARE',
      type: 'board',
      total_stock: 1,
      available_stock: 1,
      status: 'available',
      image_url: ''
    });
    setIsAddModalOpen(true);
  };

  // Filtered Loans
  const filteredLoans = loans.filter(l => {
    const term = loanSearch.toLowerCase();
    return (
      l.user_name?.toLowerCase().includes(term) ||
      l.hardware_title?.toLowerCase().includes(term) ||
      l.project_name?.toLowerCase().includes(term) ||
      l.user_email?.toLowerCase().includes(term) ||
      l.student_id?.toLowerCase().includes(term)
    );
  });

  // Filtered Inventory
  const categories = ['All', ...Array.from(new Set(inventory.map(i => i.category)))];
  const filteredInventory = inventory.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const term = inventorySearch.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(term) ||
      item.spec?.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term);
    return matchesCat && matchesSearch;
  });

  const pendingCount = loans.filter(l => l.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header and Sub-Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              Lab Operations Core
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Equipment Inventory & Loan Requisitions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Full admin control over loanable hardware items, available stock counts, and member borrow requests.
          </p>
        </div>

        {/* Sub-Navigation Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('requisitions')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'requisitions'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Borrowing Requests</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'inventory'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Equipment Catalog & Stock</span>
            <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-full">
              {inventory.length}
            </span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between animate-in fade-in ${
          feedback.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-2">Dismiss</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: REQUISITIONS & BORROWING REQUESTS                                */}
      {/* ========================================================================= */}
      {activeSubTab === 'requisitions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by student name, student ID, hardware, or project..."
                value={loanSearch}
                onChange={e => setLoanSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-xs"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-mono">
              {(['all', 'pending', 'approved', 'active', 'returned', 'rejected'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setLoanFilter(s)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                    loanFilter === s
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loadingLoans ? (
            <div className="py-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Loading equipment loan requisitions...</span>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-mono">
              No hardware loan applications found matching this view.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredLoans.map(loan => (
                <div
                  key={loan.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                        loan.status === 'approved' || loan.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : loan.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : loan.status === 'returned'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}>
                        {loan.status}
                      </span>
                      <span className="text-xs font-mono text-slate-400">Duration: {loan.requested_days} Days</span>
                      <span className="text-xs font-mono text-slate-400">Applied: {new Date(loan.created_at).toLocaleDateString()}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {loan.hardware_title}
                    </h3>

                    <div className="text-xs text-slate-600 dark:text-slate-300 font-mono flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{loan.user_name} ({loan.user_email})</span>
                      {loan.student_id && <span className="text-slate-400">· ID: {loan.student_id}</span>}
                    </div>

                    {loan.project_name && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-700 dark:text-slate-300 font-medium">Project:</strong> {loan.project_name}
                      </p>
                    )}

                    {loan.purpose && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        "{loan.purpose}"
                      </p>
                    )}

                    {loan.expected_return_at && (
                      <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1 pt-1">
                        <Clock className="w-3 h-3" />
                        <span>Expected Return: {new Date(loan.expected_return_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    {loan.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(loan.id, 'approved')}
                          disabled={processingLoanId === loan.id}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(loan.id, 'rejected')}
                          disabled={processingLoanId === loan.id}
                          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {(loan.status === 'approved' || loan.status === 'active') && (
                      <button
                        onClick={() => handleUpdateStatus(loan.id, 'returned')}
                        disabled={processingLoanId === loan.id}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Mark Returned</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: EQUIPMENT CATALOG & STOCK INVENTORY                               */}
      {/* ========================================================================= */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search catalog by equipment name, specifications, or category..."
                value={inventorySearch}
                onChange={e => setInventorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-xs"
              />
            </div>

            {/* Add Equipment Button */}
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-xs transition-all flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Equipment</span>
            </button>
          </div>

          {/* Category Chips Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loadingInventory ? (
            <div className="py-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Loading equipment catalog...</span>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-mono">
              No equipment found in catalog. Click "Add Equipment" to add hardware items.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInventory.map(item => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                        {item.badge || item.type}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        item.status === 'available'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : item.status === 'maintenance'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 mb-1">
                      {item.category}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
                      {item.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {item.spec}
                    </p>
                  </div>

                  {/* Stock & Management Controls */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {/* Stock pill with + / - buttons */}
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => handleAdjustStock(item, -1)}
                        disabled={item.available_stock <= 0}
                        className="w-5 h-5 flex items-center justify-center rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-bold text-xs disabled:opacity-40"
                        title="Decrease available stock"
                      >
                        -
                      </button>
                      <span className="text-[11px] font-mono font-bold px-1.5 text-slate-700 dark:text-slate-300">
                        {item.available_stock} / {item.total_stock}
                      </span>
                      <button
                        onClick={() => handleAdjustStock(item, 1)}
                        disabled={item.available_stock >= item.total_stock}
                        className="w-5 h-5 flex items-center justify-center rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-bold text-xs disabled:opacity-40"
                        title="Increase available stock"
                      >
                        +
                      </button>
                    </div>

                    {/* Edit & Delete actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        title="Edit equipment"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        title="Delete equipment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT EQUIPMENT                                              */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <AdminModalWrapper isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
          <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-indigo-500" />
                <span>{editingItem ? 'Edit Equipment Item' : 'Add New Equipment to Catalog'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Equipment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raspberry Pi 5 (8GB RAM)"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    list="category-suggestions"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                  />
                  <datalist id="category-suggestions">
                    {CATEGORY_PRESETS.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Equipment Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                  >
                    <option value="board">Microcontroller / Compute Board</option>
                    <option value="project">Flagship Full Robot Platform</option>
                    <option value="sensor">Sensor / Camera / Actuator</option>
                    <option value="consumable">Consumable / Prototyping Tool</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. COMPUTE, SENSOR, LAB"
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Availability Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="available">Available for Loan</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="reserved">Reserved / Competition</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Technical Specifications & Included Parts
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Quad-core 2.4GHz Arm Cortex-A76 SBC with power adapter and case."
                  value={formData.spec}
                  onChange={e => setFormData({ ...formData, spec: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Quantity in Lab
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.total_stock}
                    onChange={e => {
                      const total = parseInt(e.target.value, 10) || 1;
                      setFormData({
                        ...formData,
                        total_stock: total,
                        available_stock: Math.min(formData.available_stock, total)
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Currently Available
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.total_stock}
                    value={formData.available_stock}
                    onChange={e => setFormData({ ...formData, available_stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingItem ? 'Saving...' : editingItem ? 'Save Changes' : 'Add to Inventory'}</span>
                </button>
              </div>
            </form>
          </div>
        </AdminModalWrapper>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                                */}
      {/* ========================================================================= */}
      {itemToDelete && (
        <AdminModalWrapper isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)}>
          <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Remove Equipment?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">"{itemToDelete.name}"</strong> from lab inventory?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEquipment(itemToDelete)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </AdminModalWrapper>
      )}
    </div>
  );
};
