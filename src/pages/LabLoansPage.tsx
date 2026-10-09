import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wrench, Cpu, Layers, CheckCircle2, AlertCircle, Clock, 
  Send, Sparkles, ShieldCheck, ChevronRight, ArrowRight, 
  RotateCcw, Box, Zap, Search, Info, Loader2, Plus, LogIn
} from 'lucide-react';
import JSTUHeader from '../components/JSTUHeader';
import ScrollReveal from '../components/ScrollReveal';
import { useAuthSync } from '../lib/auth';

interface PresetItem {
  id: string;
  category: string;
  name: string;
  spec: string;
  badge: string;
  type: 'project' | 'board' | 'sensor' | 'consumable';
  total_stock?: number;
  available_stock?: number;
  status?: 'available' | 'maintenance' | 'reserved';
}

const PRESET_LAB_ITEMS: PresetItem[] = [
  // Flagship Projects
  { id: 'proj_aegis_rover', category: 'Flagship Projects', name: 'Aegis-1 Autonomous Ground Rover', spec: 'Full research rover with Jetson Orin + RPLiDAR S2', badge: 'FULL SYSTEM', type: 'project', total_stock: 1, available_stock: 1, status: 'available' },
  { id: 'proj_valkyrie_drone', category: 'Flagship Projects', name: 'Valkyrie-X Quadrotor LiDAR Surveyor', spec: 'Complete aerial platform with Pixhawk 6X + 4K Gimbal', badge: 'FULL SYSTEM', type: 'project', total_stock: 1, available_stock: 1, status: 'available' },
  { id: 'proj_robotic_arm', category: 'Flagship Projects', name: '6-Axis Articulated Manipulator Arm', spec: 'High-torque robotic arm with pneumatic 2-finger gripper', badge: 'FULL SYSTEM', type: 'project', total_stock: 1, available_stock: 1, status: 'available' },

  // Compute & Boards
  { id: 'dev_jetson_orin', category: 'Microcontrollers & Compute', name: 'NVIDIA Jetson Orin Nano (8GB)', spec: '40 TOPS AI compute board for ROS2 & computer vision', badge: 'COMPUTE', type: 'board', total_stock: 3, available_stock: 3, status: 'available' },
  { id: 'dev_rpi5', category: 'Microcontrollers & Compute', name: 'Raspberry Pi 5 (8GB RAM)', spec: 'Quad-core 2.4GHz Arm Cortex-A76 SBC', badge: 'COMPUTE', type: 'board', total_stock: 5, available_stock: 5, status: 'available' },
  { id: 'dev_esp32_s3', category: 'Microcontrollers & Compute', name: 'ESP32-S3 Dual-Core with WiFi & BLE', spec: 'Dual-core Xtensa 240MHz with vector AI acceleration', badge: 'EMBEDDED', type: 'board', total_stock: 8, available_stock: 8, status: 'available' },
  { id: 'dev_arduino_uno', category: 'Microcontrollers & Compute', name: 'Arduino Uno R3 ATmega328P', spec: 'Standard 5V prototyping microcontroller with USB-B cable', badge: 'EMBEDDED', type: 'board', total_stock: 12, available_stock: 12, status: 'available' },
  { id: 'dev_stm32f4', category: 'Microcontrollers & Compute', name: 'STM32F405 ARM Cortex-M4 Development Kit', spec: 'High-speed 168MHz MCU with CAN bus transceiver', badge: 'EMBEDDED', type: 'board', total_stock: 6, available_stock: 6, status: 'available' },

  // Sensors & Actuators
  { id: 'sens_rplidar_a2', category: 'Sensors & Actuators', name: 'RPLiDAR A2M8 360° 2D Laser Scanner', spec: '12-meter range, 8000 samples/sec for SLAM navigation', badge: 'SENSOR', type: 'sensor', total_stock: 3, available_stock: 3, status: 'available' },
  { id: 'sens_realsense_d435', category: 'Sensors & Actuators', name: 'Intel RealSense D435i Active IR Depth Camera', spec: 'Stereo RGB-D camera with built-in 6-DOF IMU', badge: 'VISION', type: 'sensor', total_stock: 2, available_stock: 2, status: 'available' },
  { id: 'sens_bno055', category: 'Sensors & Actuators', name: 'Bosch BNO055 9-DOF Absolute Orientation IMU', spec: 'Triaxial accelerometer, gyroscope, and geomagnetic sensor', badge: 'SENSOR', type: 'sensor', total_stock: 5, available_stock: 5, status: 'available' },
  { id: 'act_mg996r', category: 'Sensors & Actuators', name: 'MG996R Metal Gear High-Torque Servo Set (4x)', spec: '11 kg/cm torque metal gear digital servos', badge: 'ACTUATOR', type: 'sensor', total_stock: 8, available_stock: 8, status: 'available' },

  // Prototyping & Consumables
  { id: 'con_jumper_wires', category: 'Consumables & Prototyping', name: 'Premium Jumper Wire Pack (120 Pcs)', spec: '40x M-M, 40x M-F, 40x F-F multi-color 20cm flexible cables', badge: 'WIRING', type: 'consumable', total_stock: 25, available_stock: 25, status: 'available' },
  { id: 'con_breadboards', category: 'Consumables & Prototyping', name: 'Solderless Breadboard MB-102 (830 Tie Points)', spec: 'High-quality nickel-plated spring clips with power rails', badge: 'PROTOTYPING', type: 'consumable', total_stock: 20, available_stock: 20, status: 'available' },
  { id: 'con_lipo_battery', category: 'Consumables & Prototyping', name: '3S 11.1V 2200mAh 35C LiPo Battery Pack', spec: 'High-discharge battery pack with XT60 connector', badge: 'POWER', type: 'consumable', total_stock: 6, available_stock: 6, status: 'available' },
  { id: 'con_soldering_kit', category: 'Consumables & Prototyping', name: 'Lab Soldering Station & Precision Tweezer Access', spec: '60W temperature-controlled iron, solder flux, brass cleaner', badge: 'LAB TOOL', type: 'consumable', total_stock: 4, available_stock: 4, status: 'available' }
];

export const LabLoansPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryItems, setInventoryItems] = useState<PresetItem[]>(PRESET_LAB_ITEMS);
  const [loadingInventory, setLoadingInventory] = useState(false);
  
  // Form State
  const [chosenItemName, setChosenItemName] = useState('');
  const [customItemMode, setCustomItemMode] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [durationDays, setDurationDays] = useState(7);
  const [projectName, setProjectName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // My Loans State
  const [myLoans, setMyLoans] = useState<any[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);

  // Reactive synchronized auth state
  const { user: currentUser, token } = useAuthSync();

  const fetchInventory = async () => {
    try {
      setLoadingInventory(true);
      const res = await fetch('/api/hardware/inventory');
      const data = await res.json();
      if (data.success && data.items && data.items.length > 0) {
        setInventoryItems(data.items);
      }
    } catch (err) {
      console.error('Failed to load lab inventory:', err);
    } finally {
      setLoadingInventory(false);
    }
  };

  const fetchMyLoans = async () => {
    if (!token) return;
    try {
      setLoadingLoans(true);
      const res = await fetch('/api/hardware/loans/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMyLoans(data.loans || []);
      }
    } catch (err) {
      console.error('Failed to load my loans:', err);
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (currentUser && token) {
      fetchMyLoans();
    } else {
      setMyLoans([]);
    }
  }, [currentUser, token]);

  const handleSelectItem = (item: PresetItem) => {
    setCustomItemMode(false);
    setChosenItemName(item.name);
    // Smooth scroll to form
    const formEl = document.getElementById('requisition-form');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmitRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !token) {
      navigate('/auth');
      return;
    }

    if (!chosenItemName.trim()) {
      setSubmissionFeedback({ type: 'error', message: 'Please select or specify the equipment or project you wish to requisition.' });
      return;
    }

    setIsSubmitting(true);
    setSubmissionFeedback(null);
    try {
      const res = await fetch('/api/hardware/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          hardware_id: customItemMode ? `custom_${Date.now()}` : chosenItemName.toLowerCase().replace(/\s+/g, '_').slice(0, 30),
          hardware_title: `${chosenItemName} (Qty: ${quantity})`,
          requested_days: durationDays,
          project_name: projectName,
          purpose: purpose
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissionFeedback({
          type: 'success',
          message: 'Equipment requisition submitted! A lab coordinator will review and prepare your hardware kit.'
        });
        setChosenItemName('');
        setProjectName('');
        setPurpose('');
        setQuantity(1);
        fetchMyLoans();
      } else {
        setSubmissionFeedback({
          type: 'error',
          message: data.error || 'Failed to submit equipment requisition.'
        });
      }
    } catch (err: any) {
      setSubmissionFeedback({
        type: 'error',
        message: err.message || 'Network error occurred while submitting.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dynamicCategories = ['All', ...Array.from(new Set(inventoryItems.map(it => it.category)))];

  const filteredItems = inventoryItems.filter(it => {
    const matchesCat = selectedCategory === 'All' || it.category === selectedCategory;
    const term = searchTerm.toLowerCase();
    const matchesSearch = it.name.toLowerCase().includes(term) || it.spec.toLowerCase().includes(term);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      <JSTUHeader currentUser={currentUser} />

      <main className="flex-1 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Hero Section */}
        <ScrollReveal>
          <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-br from-slate-900 via-[#0D1424] to-[#0A0F1D] text-white border border-slate-800 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Wrench className="w-3.5 h-3.5" />
                <span>JSTU Robotics Lab · Universal Equipment & Project Loans</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Requisition Lab Hardware, Components & Project Kits.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                Whether you need a complete autonomous rover platform, microcontrollers (ESP32, Jetson, Arduino), sensors, or basic consumables like jumper wires and breadboards — submit your requisition here for fast lab clearance.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="#requisition-form"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start Loan Application</span>
                </a>

                {currentUser ? (
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-slate-300">Logged in as: <strong className="text-indigo-400 font-bold">{currentUser.name}</strong></span>
                  </div>
                ) : (
                  <Link
                    to="/auth?redirect=/loans"
                    className="px-4 py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/30"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In to Submit Loans</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Section: My Active Loans (if user is authenticated) */}
        {currentUser && (
          <ScrollReveal>
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">My Equipment Requisitions & Loans</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Your active borrowing records and approvals</p>
                  </div>
                </div>

                <button
                  onClick={fetchMyLoans}
                  className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {loadingLoans ? (
                <div className="py-8 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>Retrieving your loan status...</span>
                </div>
              ) : myLoans.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs font-mono bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  You have no active or historical loan applications. Select an item below to apply!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myLoans.map(loan => (
                    <div
                      key={loan.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${
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
                          <span className="text-[11px] font-mono text-slate-400">Duration: {loan.requested_days}d</span>
                        </div>

                        <h3 className="text-sm font-bold truncate">{loan.hardware_title}</h3>
                        {loan.project_name && (
                          <p className="text-xs text-slate-500 line-clamp-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Project:</span> {loan.project_name}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                        <span>Submitted: {new Date(loan.created_at).toLocaleDateString()}</span>
                        {loan.expected_return_at && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            Return: {new Date(loan.expected_return_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Section: Universal Requisition Application Form */}
        <ScrollReveal>
          <div id="requisition-form" className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Wrench className="w-5 h-5" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">Universal Loan Requisition Form</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Submit Your Equipment Requisition
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Select an item from the catalog below or type in any custom prototyping components you require.
              </p>
            </div>

            {/* Borrower Session Authorization Banner */}
            {currentUser ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">
                      Active Member: <strong className="font-extrabold">{currentUser.name}</strong> ({currentUser.email || currentUser.student_id || 'Student Profile'})
                    </p>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-mono">
                      Your requisition will be automatically logged to your member profile for quick lab checkout.
                    </p>
                  </div>
                </div>
                <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                  Verified Session
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">
                      Member Sign-In Required for Equipment Checkout
                    </p>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-mono">
                      Sign in with your JSTU Robotics account so lab coordinators can verify and clear your requisition.
                    </p>
                  </div>
                </div>
                <Link
                  to="/auth?redirect=/loans"
                  className="self-start sm:self-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Join</span>
                </Link>
              </div>
            )}

            {submissionFeedback && (
              <div className={`p-4 rounded-2xl text-xs flex items-center justify-between ${
                submissionFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  {submissionFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{submissionFeedback.message}</span>
                </div>
                <button onClick={() => setSubmissionFeedback(null)} className="font-bold underline ml-2">Dismiss</button>
              </div>
            )}

            <form onSubmit={handleSubmitRequisition} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Item Selection Field */}
                <div className="md:col-span-8 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                      Equipment or Project Requested *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomItemMode(!customItemMode);
                        setChosenItemName('');
                      }}
                      className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {customItemMode ? '← Pick from Lab Catalog' : '✏️ Need something else? Type custom item'}
                    </button>
                  </div>

                  {customItemMode ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. 50x Jumper Wires (M-M), 1x L298N Motor Driver, Soldering Station Access..."
                      value={chosenItemName}
                      onChange={e => setChosenItemName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500 shadow-xs"
                    />
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Click any item in the catalog below or type name here..."
                      value={chosenItemName}
                      onChange={e => setChosenItemName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500 shadow-xs"
                    />
                  )}
                </div>

                {/* Quantity */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-mono focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>

                {/* Duration */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                    Loan Duration
                  </label>
                  <select
                    value={durationDays}
                    onChange={e => setDurationDays(Number(e.target.value))}
                    className="w-full px-3 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-mono focus:outline-none focus:border-emerald-500 shadow-xs"
                  >
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days (1 Wk)</option>
                    <option value={14}>14 Days (2 Wks)</option>
                    <option value={30}>30 Days (1 Mo)</option>
                  </select>
                </div>

                {/* Project / Competition Name */}
                <div className="md:col-span-6 space-y-2">
                  <label className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                    Project, Competition, or Course Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jamalpur Autonomous Rover / Capstone Research"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>

                {/* Purpose / Justification */}
                <div className="md:col-span-6 space-y-2">
                  <label className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                    Technical Justification & Purpose *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Field testing autonomous LiDAR navigation in campus grounds..."
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Borrowers must return equipment in clean working condition.</span>
                </div>

                {!currentUser ? (
                  <Link
                    to="/auth?redirect=/loans"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Submit Loan</span>
                  </Link>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Loan Requisition</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </ScrollReveal>

        {/* Section: Lab Equipment & Project Catalog */}
        <ScrollReveal>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Available Lab Equipment & Kits Catalog
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Click on any item to automatically load it into your requisition form above.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Filter catalog items..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs font-mono">
              {dynamicCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all font-bold ${
                    selectedCategory === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-white dark:bg-[#0D1424] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer group flex flex-col justify-between gap-4 ${
                    chosenItemName === item.name
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-white dark:bg-[#0D1424] border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.badge}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline flex items-center gap-1">
                        <span>Select</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono leading-relaxed">
                      {item.spec}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="truncate max-w-[140px]">{item.category}</span>
                    {item.status === 'maintenance' ? (
                      <span className="text-amber-500 font-semibold">Under Maintenance</span>
                    ) : item.available_stock !== undefined && item.available_stock <= 0 ? (
                      <span className="text-rose-500 font-semibold">Checked Out (0 in lab)</span>
                    ) : (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>In Stock ({item.available_stock ?? item.total_stock ?? 1} available)</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
};

export default LabLoansPage;
