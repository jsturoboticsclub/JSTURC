import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Github, Cpu, Layers, CheckCircle, ShieldAlert, FileText, Wrench } from 'lucide-react';
import { CyberBadge } from '../common/CyberPrimitives';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export interface ProjectDetail {
  id: string | number;
  title: string;
  category: string;
  description: string;
  image?: string;
  githubUrl?: string;
  status?: string;
  computeArchitecture?: string;
  bom?: { item: string; qty: number; spec: string }[];
  schematicsUrl?: string;
  tags?: string[];
}

interface ProjectDetailModalProps {
  project: ProjectDetail | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  useBodyScrollLock(!!project);

  const [activeTab, setActiveTab] = useState<'overview' | 'bom' | 'architecture'>('overview');

  if (!project || typeof document === 'undefined') return null;

  const defaultBOM = [
    { item: 'Main Flight/Rover Controller', qty: 1, spec: 'STM32F405 ARM Cortex-M4 @ 168MHz' },
    { item: 'High-Level Compute Brain', qty: 1, spec: 'Raspberry Pi 5 (8GB RAM) / ROS2 Iron' },
    { item: 'LiDAR Sensor', qty: 1, spec: 'RPLiDAR A2M8 360° 12m Range' },
    { item: 'Stereo Depth Camera', qty: 1, spec: 'Intel RealSense D435i with IMU' },
    { item: 'Motor Controllers', qty: 4, spec: 'VESC 6+ High-Current CAN Bus' },
    { item: 'Power Supply System', qty: 1, spec: '6S 22.2V 10000mAh LiPo with Smart BMS' },
  ];

  const bomList = project.bom || defaultBOM;
  const architecture = project.computeArchitecture || 'Distributed CAN Bus + ROS2 DDS Architecture';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto overscroll-contain"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#070B14] border border-slate-200 dark:border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-[#0D1424]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
                {project.category || 'Robotics Research'}
              </span>
              {project.status && (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300">
                  {project.status}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
              {project.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800/80 px-6 bg-white dark:bg-[#070B14]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-mono font-bold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-300'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            SYSTEM OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab('bom')}
            className={`py-3 px-4 text-xs font-mono font-bold border-b-2 transition-colors ${
              activeTab === 'bom'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-300'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            HARDWARE BOM ({bomList.length})
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 text-xs font-mono font-bold border-b-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-300'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            COMPUTE STACK
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto overscroll-contain space-y-6 flex-1 text-slate-600 dark:text-slate-300 text-sm">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {project.image && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-64 relative group shadow-xs">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-2">
                  System Description
                </h4>
                <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                  {project.description}
                </p>
              </div>

              {project.tags && project.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-2">
                    Subsystems & Disciplines
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-indigo-700 dark:text-indigo-300 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bom' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
                <span>Hardware Component</span>
                <span>Quantity · Specification</span>
              </div>
              <div className="space-y-2">
                {bomList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Wrench className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">{item.item}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">x{item.qty}</span>
                      <span className="text-slate-500 text-xs font-mono ml-2 block sm:inline">[{item.spec}]</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30">
                <div className="flex items-center gap-2.5 mb-2 text-indigo-700 dark:text-indigo-300">
                  <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-sm font-bold font-mono">Real-Time Compute & Communications Bus</h4>
                </div>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed">
                  {architecture}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  System Architecture Standards
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold block mb-1">Low-Level Control:</span>
                    <span className="text-slate-700 dark:text-slate-300">FreeRTOS / Micro-ROS via UART DMA</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold block mb-1">Edge Perception:</span>
                    <span className="text-slate-700 dark:text-slate-300">YOLOv8-Nano on Coral Edge TPU</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold block mb-1">Local Planning:</span>
                    <span className="text-slate-700 dark:text-slate-300">Nav2 DWB Controller @ 20Hz</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold block mb-1">Power Regulation:</span>
                    <span className="text-slate-700 dark:text-slate-300">Isolated 5V/12V DC-DC Buck Converter</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1424] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
              >
                <Github className="w-4 h-4" />
                <span>Open Source Repository</span>
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
